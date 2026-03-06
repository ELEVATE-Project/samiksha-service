const path = require('path');
const fs = require('fs');
const rootPath = path.join(__dirname, '../../');
require('dotenv').config({ path: rootPath + '/.env' });

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const request = require('request');
const url = process.env.MONGODB_URL;
const dbName = process.env.DB;
const dryRun = false;
const BATCH_SIZE = 100;
const input = JSON.parse(fs.readFileSync(path.join(__dirname, 'input.json'), 'utf8'))
const { loginCredentails, tenantMappingConfig } = input
const { oldTenantId, newTenantId, newOrgId,oldOrgId } = tenantMappingConfig

// ─── CLI Args ─────────────────────────────────────────────────────────────────


console.log('MongoDB URL  :', url, dbName);
console.log('Old Tenant ID:', oldTenantId);
console.log('New Tenant ID:', newTenantId);
console.log('Old Org ID   :', oldOrgId);
console.log('New Org ID   :', newOrgId);

// ─── Log File Setup ───────────────────────────────────────────────────────────

const LOG_FILE = path.join(
  __dirname,
  `migration_log_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
);

const migrationLog = {
  startedAt: new Date().toISOString(),
  dryRun,
  params: { oldTenantId, newTenantId, oldOrgId, newOrgId },
  collections: {},
  warnings: [],
  errors: [],
  completedAt: null,
};

function logWarning(collectionName, docId, field, message) {
  const warning = { collection: collectionName, docId, field, message, timestamp: new Date().toISOString() };
  migrationLog.warnings.push(warning);
  console.warn(`  ⚠️  [${collectionName}] doc ${docId} — ${field}: ${message}`);
  writeLog();
}
/**
 * Append a collection result to the log file (overwrites with full state each time).
 */
function writeLog() {
  fs.writeFileSync(LOG_FILE, JSON.stringify(migrationLog, null, 2), 'utf8');
}

/**
 * Record a collection's migration result in the log.
 * @param {string} collectionName
 * @param {number} modifiedCount
 * @param {string[]} updatedIds   - array of stringified _id values
 * @param {string|null} error
 */
function logCollection(collectionName, modifiedCount, updatedIds = [], error = null) {
  migrationLog.collections[collectionName] = {
    modifiedCount,
    updatedIds,
    error,
    timestamp: new Date().toISOString(),
  };
  if (error) migrationLog.errors.push({ collection: collectionName, error });
  writeLog();
}

// ─── Database ─────────────────────────────────────────────────────────────────

let client;

async function connectDatabase() {
  client = new MongoClient(url, { useUnifiedTopology: true });
  await client.connect();
  console.log('✓ Connected to MongoDB\n');
}

// ─── Entity Service ───────────────────────────────────────────────────────────

/**
 * Call the entity management service to find entities.
 */
function entityDocuments(
  filterData = {},
  projection = [],
  page = 1,
  limit = 100,
  search = '',
  aggregateValue = null,
  isAggregateStaging = false,
  isSort = true,
  aggregateProjection = []
) {
  return new Promise((resolve, reject) => {
    try {
      const endpoint =
        `${process.env.ENTITY_MANAGEMENT_SERVICE_URL}/v1/entities/find` +
        `?page=${page}&limit=${limit}&search=${search}` +
        `&aggregateValue=${aggregateValue}&aggregateStaging=${isAggregateStaging}&aggregateSort=${isSort}`;

      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: { query: filterData, projection, aggregateProjection },
      };

      request.post(endpoint, options, (err, response) => {
        if (err) return resolve({ success: false, data: [], error: err.message });

        const body = response.body;
        if (body.status === 200) {
          return resolve({ success: true, data: body.result || [] });
        }
        return resolve({ success: false, data: [], error: body.message });
      });
    } catch (error) {
      reject(error);
    }
  });
}


/**
 *
 * @function
 * @name profile
 * @param {String}   userId -userId
 * @returns {Promise} returns a promise.
 */
function profile(userId = '', tenantId = '') {
  return new Promise((resolve, reject) => {
    try {
      const url =
        `${process.env.USER_SERVICE_URL}/v1/user/profileById` +
        (userId ? `/${userId}?tenant_code=${tenantId}` : '');

      const options = {
        headers: {
          'content-type': 'application/json',
          internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
        },
        timeout: 10000, 
      };

      request.get(url, options, (err, response) => {
        if (err) return resolve({ success: false, error: err.message });

        const body = JSON.parse(response.body);
        if (body.responseCode === 'OK') {
          return resolve({
            success: true,
            data: _.omit(body.result, [
              'email', 'maskedEmail', 'maskedPhone', 'recoveryEmail',
              'phone', 'prevUsedPhone', 'prevUsedEmail', 'recoveryPhone',
              'encEmail', 'encPhone',
            ]),
          });
        }

        return resolve({ success: false, error: body.params?.status });
      });
    } catch (error) {
      reject(error);
    }
  });
}
// ─── Scope / Entity Finding

/**
 * Resolve old entity IDs → new entity IDs inside a scope object or array.
 * @param {object|string[]} input           scope object or flat entity-id array
 * @param {string}          tenantId        target tenant to look up
 * @param {boolean}         returnEntityTypeId    also return the resolved entityTypeId
 */
async function updateEntities(input, tenantId, returnEntityTypeId = false,collectionName, docId) {
  try {
    const isArray = Array.isArray(input);
    // we are using same function for solution and program scope and observation enitites so we will handle both logic here
    const scope = isArray ? { entities: input } : _.omit(input, ['entityType']);

    // collect all unique reference IDs from the scope (except orgs which we handle separately)
    const referenceIds = new Set();
    for (const key of Object.keys(scope)) {
      if (key === 'organizations') continue;
      const values = scope[key] || [];
      if (!values.includes('ALL')) values.forEach((v) => referenceIds.add(v));
    }

    let valueMap = new Map();
    let newEntityTypeId;

    if (referenceIds.size) {
      const filter = {
        'metaInformation.tenantMigrationReferenceId': { $in: [...referenceIds] },
        ...(tenantId && { tenantId }),
      };

      const result = await entityDocuments(filter, ['_id', 'metaInformation', 'entityTypeId']);

      // log if the service call  failed
      if (!result.success) {
        logWarning(collectionName, docId, 'entities', `entityDocuments call failed: ${result.error}`);
        return input; 
      }

      const { data = [] } = result;

      //  log if some reference IDs had no match in the new tenant
      const unmapped = [...referenceIds].filter(
        (id) => !data.find((doc) => doc.metaInformation?.tenantMigrationReferenceId === id)
      );
      if (unmapped.length) {
        logWarning(collectionName, docId, 'entities', `No mapping found for IDs: ${unmapped.join(', ')}`);
      }

      newEntityTypeId = data[0]?.entityTypeId;
      valueMap = new Map(data.map((doc) => [doc.metaInformation?.tenantMigrationReferenceId, doc._id]));
    }

    const resolvedScope = {};
    for (const key of Object.keys(scope)) {
      const values = scope[key] || [];
      if (values.includes('ALL')) {
        resolvedScope[key] = values;
        continue;
      }
      resolvedScope[key] = values.map((v) => valueMap.get(v) || v);
    }

    if (resolvedScope.organizations?.length) {
      resolvedScope.organizations = resolvedScope.organizations.map((id) =>
        id === oldOrgId.toLowerCase() ? newOrgId.toLowerCase() : id
      );
    }
   // eneityTypeId is required for observations but not for solution/program scope, so we only add it if the caller explicitly asks for it (and we found a mapping)
    if (returnEntityTypeId) resolvedScope.entityTypeId = newEntityTypeId;

    return resolvedScope;
  } catch (err) {
    console.error('✗ Failed to resolve scope:', err.message);
    logWarning(collectionName, docId, 'entities', err.message);
    return input;
  }
}


function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function login() {
  return new Promise((resolve, reject) => {
    try {
      const normalizedCreatorType = (loginCredentails.createrType || '').toLowerCase().trim();
      const loginUrl =
        normalizedCreatorType === 'admin'
          ? `${process.env.USER_SERVICE_URL}/v1/admin/login`
          : `${process.env.USER_SERVICE_URL}/v1/account/login`;

      const options = {
        headers: {
          'Content-Type': 'application/json',
          origin: loginCredentails.origin,
        },
        json: {
          identifier: loginCredentails.createrUserName,
          password: loginCredentails.createrPassword,
        },
        timeout: 10000,
      };

      request.post(loginUrl, options, (err, response) => {
        if (err) return reject(new Error(`Login request failed: ${err.message}`));

        const body = response.body;
        const token = body?.result?.access_token;
        const userId = body?.result?.user?.id?.toString();

        if (!token) return reject(new Error('Login failed: no access_token in response'));

        // ✅ Decode and verify admin role
        const decoded = decodeJWT(token);
        if (!decoded) return reject(new Error('Login failed: could not decode token'));

        const roles = decoded.data.organizations?.[0]?.roles  || [];
        const roleList = Array.isArray(roles) ? roles : [roles];
        const isAdmin = roleList.some((role) => 
          (typeof role === 'string' ? role : role?.title  || '').toLowerCase() === 'admin'
        );

        if (!isAdmin) {
          return reject(new Error(`Login failed: user ${userId} does not have admin role. Found roles: ${roleList.map(r => typeof r === 'string' ? r : r?.title || r?.name).join(', ') || 'none'}`));
        }

        console.log(`✓ Login successful. userId: ${userId}, role: admin`);
        return resolve({ token, userId });
      });
    } catch (error) {
      reject(error);
    }
  });
}
// ─── Generic Simple Migrations ──────────────────────────────────────────────────

/**
 * Migrate any collection where every document just needs tenantId / orgId
 * (and optional extra fields) updated — no per-document async resolution needed.
 *
 * Uses updateMany for maximum efficiency instead of fetching + bulkWrite.
 *
 * @param {string} collectionName
 * @param {object} extraFields   additional $set fields (e.g. { createdBy: author })
 * @param {object} extraQuery    additional filter fields on top of the tenant/org match
 */
async function migrateSimpleCollection(collectionName, extraFields = {}, extraQuery = {}) {
  const collection = client.db(dbName).collection(collectionName);

  try {
    const query = { tenantId: oldTenantId, orgId: oldOrgId, ...extraQuery };

    // Fetch _ids for the log before we update
    const docsToUpdate = await collection.find(query, { projection: { _id: 1 } }).toArray();

    if (!docsToUpdate.length) {
      console.log(`  No ${collectionName} documents found for migration`);
      logCollection(collectionName, 0, []);
      return 0;
    }

    const updatedIds = docsToUpdate.map((d) => d._id.toString());

    if (dryRun) {
      console.log(`  [DRY RUN] Would update ${updatedIds.length} ${collectionName} documents`);
      logCollection(collectionName, 0, updatedIds);
      return 0;
    }

    const result = await collection.updateMany(query, {
      $set: { tenantId: newTenantId, orgId: newOrgId, ...extraFields },
    });

    console.log(`  ✓ ${collectionName}: ${result.modifiedCount} updated`);
    logCollection(collectionName, result.modifiedCount, updatedIds);
    return result.modifiedCount;
  } catch (err) {
    console.error(`  ✗ ${collectionName} migration failed:`, err.message);
    logCollection(collectionName, 0, [], err.message);
    throw err;
  }
}

// ─── Collections that need entity update ─────────────────────

/**
 * Shared batched migrator for collections that require async entity resolution
 * per document (solutions, programs, observations, observationSubmissions).
 *
 * @param {string}   collectionName
 * @param {object}   baseQuery      MongoDB filter
 * @param {Function} buildOp        async (doc) => bulkWrite updateOne operation
 */
async function migrateBatchedCollection(collectionName, baseQuery, buildOp) {
  const collection = client.db(dbName).collection(collectionName);

  try {
    const documentsToMigrate = await collection.find(baseQuery).toArray();

    if (!documentsToMigrate.length) {
      console.log(`  No ${collectionName} documents found for migration`);
      logCollection(collectionName, 0, []);
      return 0;
    }

    const batches = _.chunk(documentsToMigrate, BATCH_SIZE);
    console.log(
      `  Processing ${documentsToMigrate.length} ${collectionName} docs in ${batches.length} batches\n`
    );

    let totalModified = 0;
    const allUpdatedIds = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      if (dryRun) {
        console.log(`    [DRY RUN] Batch ${i + 1}/${batches.length}: would update ${batch.length} docs`);
        batch.forEach((d) => allUpdatedIds.push(d._id.toString()));
        continue;
      }
      // Build all ops for the batch concurrently
      const bulkOps = await Promise.all(batch.map(buildOp));

     

      const result = await collection.bulkWrite(bulkOps);
      totalModified += result.modifiedCount;
      batch.forEach((d) => allUpdatedIds.push(d._id.toString()));

      console.log(`    Batch ${i + 1}/${batches.length}: ${result.modifiedCount} updated`);
    }

    console.log(`  ✓ ${collectionName}: ${totalModified} total updated`);
    logCollection(collectionName, totalModified, allUpdatedIds);
    return totalModified;
  } catch (error) {
    console.error(`  ✗ ${collectionName} migration failed:`, error.message);
    logCollection(collectionName, 0, [], error.message);
    throw error;
  }
}

// ─── Individual Migrators ─────────────────────────────────────────────────────

async function migrateSolutions(author) {
  return migrateBatchedCollection(
    'solutions',
    { tenantId: oldTenantId, orgId: oldOrgId, scope: { $exists: true } },
    async (doc) => {
      const updatedScope = doc.scope ? await updateEntities(doc.scope, newTenantId,false, 'solutions', doc._id.toString()) : undefined;
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId, 
              orgId: newOrgId,       
              updatedBy: author,
              ...(updatedScope && { scope: updatedScope }),
            },
          },
        },
      };
    }
  );
}

async function migrateProgram(author) {
  return migrateBatchedCollection(
    'programs',
    { tenantId: oldTenantId, orgId: oldOrgId, scope: { $exists: true } },
    async (doc) => {
      const updatedScope = doc.scope ? await updateEntities(doc.scope, newTenantId,false, 'programs', doc._id.toString()) : undefined;
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId, 
              orgId: newOrgId,      
              updatedBy: author,
              ...(updatedScope && { scope: updatedScope }),
            },
          },
        },
      };
    }
  );
}

async function migrateObservation() {
  return migrateBatchedCollection(
    'observations',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => {
      let updatedEntity;
      if (doc.entities?.length > 0) {
        updatedEntity = await updateEntities(doc.entities, newTenantId, true, 'observations', doc._id.toString());
      }
      let userProfileData = null;

      if (doc.userProfile?.id) {
        const result = await profile(doc.userProfile.id, newTenantId);
        if (!result.success) {
          logWarning('observations', doc._id, 'userProfile', result.error || 'profile call failed'); 
        } else {
          userProfileData = result;
        }
      }
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
              ...(updatedEntity?.entities && { entities: updatedEntity.entities }),
              ...(updatedEntity?.entityTypeId && { entityTypeId: updatedEntity.entityTypeId }),
              ...(userProfileData && {userProfile: userProfileData.data }),
            },
          },
        },
      };
    }
  );
}

async function migrateObservationSubmissions() {
  return migrateBatchedCollection(
    'observationSubmissions',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => {
      let entityData;
      if (doc.entityId) {
        const filter = {
          'metaInformation.tenantMigrationReferenceId': { $in: [doc.entityId] },
          tenantId: newTenantId,
        };
        const result = await entityDocuments(filter, ['_id', 'metaInformation', 'entityTypeId', 'registryDetails']);
        entityData = result?.data?.[0];
      }

      const updatedScope = doc.programInformation?.scope
        ? await updateEntities(doc.programInformation.scope, newTenantId, false, 'observationSubmissions', doc._id.toString())
        : undefined;

        let userProfileData = null;

      if (doc.userProfile?.id) {
        const result = await profile(doc.userProfile.id, newTenantId);
        if (!result.success) {
          logWarning('observationSubmissions', doc._id, 'userProfile', result.error || 'profile call failed'); 
        } else {
          userProfileData = result;
        }
      }

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
              ...(entityData && { entityId: entityData._id.toString() }),
              ...(entityData && { entityExternalId: entityData.metaInformation.externalId }),
              ...(entityData && {
                entityInformation: { ...entityData.metaInformation, ...entityData.registryDetails },
              }),
              'observationInformation.tenantId': newTenantId,
              'observationInformation.orgId': newOrgId,
              'programInformation.tenantId': newTenantId,
              'programInformation.orgId': newOrgId,
              ...(updatedScope && { 'programInformation.scope': updatedScope }),
              ...(userProfileData && {userProfile: userProfileData.data }),
            },
          },
        },
      };
    }
  );
}

// criteriaQuestions needs arrayFilters so it gets its own simple wrapper
async function migrateCriteriaQuestions() {
  const collectionName = 'criteriaQuestions';
  const collection = client.db(dbName).collection(collectionName);

  try {
    const query = { tenantId: oldTenantId, orgId: oldOrgId };
    const docsToUpdate = await collection.find(query, { projection: { _id: 1 } }).toArray();

    if (!docsToUpdate.length) {
      console.log(`  No ${collectionName} documents found for migration`);
      logCollection(collectionName, 0, []);
      return 0;
    }

    const updatedIds = docsToUpdate.map((d) => d._id.toString());

    if (dryRun) {
      console.log(`  [DRY RUN] Would update ${updatedIds.length} ${collectionName} documents`);
      logCollection(collectionName, 0, updatedIds);
      return 0;
    }

    // updateMany supports arrayFilters too
    const result = await collection.updateMany(
      query,
      {
        $set: {
          tenantId: newTenantId,
          orgId: newOrgId,
          'evidences.$[e].sections.$[s].questions.$[q].tenantId': newTenantId,
          'evidences.$[e].sections.$[s].questions.$[q].orgId': newOrgId,
        },
      },
      {
        arrayFilters: [
          { 'e.sections': { $exists: true } },
          { 's.questions': { $exists: true } },
          { 'q._id': { $exists: true } },
        ],
      }
    );

    console.log(`  ✓ ${collectionName}: ${result.modifiedCount} updated`);
    logCollection(collectionName, result.modifiedCount, updatedIds);
    return result.modifiedCount;
  } catch (err) {
    console.error(`  ✗ ${collectionName} migration failed:`, err.message);
    logCollection(collectionName, 0, [], err.message);
    throw err;
  }
}

// userExtension uses a positional operator on orgIds array — also needs its own handler
async function migrateUserExtension(author) {
  const collectionName = 'userExtension';
  const collection = client.db(dbName).collection(collectionName);

  try {
    const query = { tenantId: oldTenantId, orgIds: oldOrgId };
    const docsToUpdate = await collection.find(query, { projection: { _id: 1 } }).toArray();

    if (!docsToUpdate.length) {
      console.log(`  No ${collectionName} documents found for migration`);
      logCollection(collectionName, 0, []);
      return 0;
    }

    const updatedIds = docsToUpdate.map((d) => d._id.toString());

    if (dryRun) {
      console.log(`  [DRY RUN] Would update ${updatedIds.length} ${collectionName} documents`);
      logCollection(collectionName, 0, updatedIds);
      return 0;
    }

    // updateMany
    const result = await collection.updateMany(query, {
      $set: {
        tenantId: newTenantId,
        'orgIds.$': newOrgId,
        updatedBy: author,
      },
    });

    console.log(`  ✓ ${collectionName}: ${result.modifiedCount} updated`);
    logCollection(collectionName, result.modifiedCount, updatedIds);
    return result.modifiedCount;
  } catch (err) {
    console.error(`  ✗ ${collectionName} migration failed:`, err.message);
    logCollection(collectionName, 0, [], err.message);
    throw err;
  }
}

// ─── Surveys & Survey Submissions (dynamic user resolution — WIP) ─────────────

/**
 * Migrate surveys collection.
 */
async function migrateSurveys() {
  return migrateBatchedCollection(
    'surveys',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => {
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
            },
          },
        },
      };
    }
  );
}

/**
 * Migrate surveySubmissions collection.
 *
 */
async function migrateSurveySubmissions() {
  return migrateBatchedCollection(
    'surveySubmissions',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => {
      // fetch the migrated userProfile from user service
      let userProfileData = null;

      if (doc.userProfile?.id) {
        const result = await profile(doc.userProfile.id, newTenantId);
        if (!result.success) {
          logWarning('surveySubmissions', doc._id, 'userProfile', result.error || 'profile call failed'); 
        } else {
          userProfileData = result;
        }
      }
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
              ...(userProfileData && {userProfile: userProfileData.data }),
              'surveyInformation.tenantId': newTenantId,
              'surveyInformation.orgId': newOrgId,
            },
          },
        },
      };
    }
  );
}

// ─── Main Function ────────────────────────────────────────────────────────

async function tenantMigration() {
  try {
    console.log('🚀 Starting Tenant Migration...\n');
    if (dryRun) console.log('⚠️  DRY RUN MODE — No data will be modified\n');

    if (!url || !dbName)
      throw new Error('MONGODB_URL and DB environment variables are required');

    if (!oldTenantId || !newTenantId || !oldOrgId || !newOrgId)
      throw new Error('Missing required parameters: --oldTenantId, --newTenantId, --oldOrgId, --newOrgId');

    await connectDatabase();

    console.log('🔐 Logging in...');
    const { token, userId: author } = await login(); 

    // ── Group 1: simple updateMany collections — run in parallel ──────────────
    console.log('── Phase 1: Simple collections (parallel) ──────────────────────\n');
    await Promise.allSettled([
      migrateSimpleCollection('criteria',  ),
      migrateSimpleCollection('frameworks', {updatedBy: author}),
      migrateSimpleCollection('questions',  {updatedBy: author}),
      migrateCriteriaQuestions(),
      migrateUserExtension(author),
    ]);

    // ── Group 2: entity-resolution + user-resolved collections — run in parallel
    console.log('\n── Phase 2: Entity-resolution collections (parallel) ───────────\n');
    await Promise.allSettled([
      migrateSolutions(author),
      migrateProgram(author),
      migrateObservation(),
      migrateObservationSubmissions(),
      migrateSurveys(),
      migrateSurveySubmissions(),
    ]);
    


    migrationLog.completedAt = new Date().toISOString();
    writeLog();

    console.log('\n─────────────────────────────────────────────────────────────────');
    console.log('📋 Migration Summary');
    console.log('─────────────────────────────────────────────────────────────────');
    let grandTotal = 0;
    for (const [name, info] of Object.entries(migrationLog.collections)) {
      const status = info.error ? '✗' : '✓';
      console.log(`  ${status} ${name.padEnd(28)} modified: ${info.modifiedCount}`);
      grandTotal += info.modifiedCount;
    }
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`\n📄 Full log written to: ${LOG_FILE}\n`);

    if (migrationLog.errors.length) {
      console.warn(`⚠️  ${migrationLog.errors.length} collection(s) encountered errors — check the log file.`);
    }

    console.log('✓ Tenant migration completed successfully\n');

  } catch (error) {
    migrationLog.errors.push({ fatal: true, error: error.message });
    migrationLog.completedAt = new Date().toISOString();
    writeLog();
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✓ Database connection closed\n');
    }
  }
}

tenantMigration();