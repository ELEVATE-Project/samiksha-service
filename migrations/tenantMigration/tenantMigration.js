const path = require('path');
const fs = require('fs');
const rootPath = path.join(__dirname, '../../');
require('dotenv').config({ path: rootPath + '/.env' });

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const request = require('request');
const url = process.env.MONGODB_URL;
const dbName = process.env.DB;
const dryRun = true;
const BATCH_SIZE = 100; // increased from 5 for better throughput

// ─── CLI Args ─────────────────────────────────────────────────────────────────

const parsedArgs = {};
process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split('=');
  parsedArgs[key.replace(/^--/, '')] = value;
});

const { oldTenantId, newTenantId, oldOrgId, newOrgId, author } = parsedArgs;

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
  params: { oldTenantId, newTenantId, oldOrgId, newOrgId, author },
  collections: {},
  errors: [],
  completedAt: null,
};

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

// ─── Scope / Entity Finding

/**
 * Resolve old entity IDs → new entity IDs inside a scope object or array.
 * @param {object|string[]} input           scope object or flat entity-id array
 * @param {string}          tenantId        target tenant to look up
 * @param {boolean}         returnEntityTypeId    also return the resolved entityTypeId
 */
async function updateEntities(input, tenantId, returnEntityTypeId = false) {
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

      const { data = [] } = await entityDocuments(filter, ['_id', 'metaInformation', 'entityTypeId']);
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
    return input;
  }
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

      // Build all ops for the batch concurrently
      const bulkOps = await Promise.all(batch.map(buildOp));

      if (dryRun) {
        console.log(`    [DRY RUN] Batch ${i + 1}/${batches.length}: would update ${bulkOps.length} docs`);
        batch.forEach((d) => allUpdatedIds.push(d._id.toString()));
        continue;
      }

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

async function migrateSolutions() {
  return migrateBatchedCollection(
    'solutions',
    { tenantId: oldTenantId, orgId: oldOrgId, scope: { $exists: true } },
    async (doc) => {
      const updatedScope = doc.scope ? await updateEntities(doc.scope, newTenantId) : undefined;
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId, // BUG FIX: was oldTenantId
              orgId: newOrgId,       // BUG FIX: was oldOrgId
              author,
              updatedBy: author,
              ...(updatedScope && { scope: updatedScope }),
            },
          },
        },
      };
    }
  );
}

async function migrateProgram() {
  return migrateBatchedCollection(
    'programs',
    { tenantId: oldTenantId, orgId: oldOrgId, scope: { $exists: true } },
    async (doc) => {
      const updatedScope = doc.scope ? await updateEntities(doc.scope, newTenantId) : undefined;
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId, // BUG FIX: was oldTenantId
              orgId: newOrgId,       // BUG FIX: was oldOrgId
              owner: author,
              createdBy: author,
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
        updatedEntity = await updateEntities(doc.entities, newTenantId, true);
      }

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
              ...(updatedEntity?.entities && { entities: updatedEntity.entities }),
              // BUG FIX: guard against undefined before accessing .entityTypeId
              ...(updatedEntity?.entityTypeId && { entityTypeId: updatedEntity.entityTypeId }),
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
        ? await updateEntities(doc.programInformation.scope, newTenantId)
        : undefined;

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
          owner: author,
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
async function migrateUserExtension() {
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

    // updateMany with positional operator works fine here
    const result = await collection.updateMany(query, {
      $set: {
        tenantId: newTenantId,
        'orgIds.$': newOrgId,
        createdBy: author,
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
 *
 * TODO: Replace the `createdBy` placeholder below with a dynamic lookup
 *       once the user-service integration is ready. Each survey's creator
 *       should be fetched from the user service using the old createdBy id
 *       and remapped to the new tenant's user id.
 */
async function migrateSurveys() {
  return migrateBatchedCollection(
    'surveys',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => {
      // TODO: fetch the migrated userId from user service using doc.createdBy
      // e.g. const newCreatedBy = await getMigratedUserId(doc.createdBy);
      const newCreatedBy = doc.createdBy; // placeholder — keeps existing value until user logic is added

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
              createdBy: newCreatedBy,
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
      // TODO: fetch the migrated userId and userProfile from user service
      // e.g. const { newUserId, newUserProfile } = await getMigratedUser(doc.createdBy);
      const newCreatedBy  = doc.createdBy;   
      const newUserProfile = doc.userProfile; 

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tenantId: newTenantId,
              orgId: newOrgId,
              createdBy: newCreatedBy,
              userProfile: newUserProfile,
              'surveyInformation.tenantId': newTenantId,
              'surveyInformation.orgId': newOrgId,
            },
          },
        },
      };
    }
  );
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

async function tenantMigration() {
  try {
    console.log('🚀 Starting Tenant Migration...\n');
    if (dryRun) console.log('⚠️  DRY RUN MODE — No data will be modified\n');

    if (!url || !dbName)
      throw new Error('MONGODB_URL and DB environment variables are required');

    if (!oldTenantId || !newTenantId || !oldOrgId || !newOrgId)
      throw new Error('Missing required parameters: --oldTenantId, --newTenantId, --oldOrgId, --newOrgId');

    await connectDatabase();

    // ── Group 1: simple updateMany collections — run in parallel ──────────────
    console.log('── Phase 1: Simple collections (parallel) ──────────────────────\n');
    await Promise.allSettled([
      migrateSimpleCollection('criteria',   { owner: author }),
      migrateSimpleCollection('frameworks', { author }),
      migrateSimpleCollection('questions',  {}),
      migrateCriteriaQuestions(),
      migrateUserExtension(),
    ]);

    // ── Group 2: entity-resolution + user-resolved collections — run in parallel
    console.log('\n── Phase 2: Entity-resolution collections (parallel) ───────────\n');
    await Promise.allSettled([
      migrateSolutions(),
      migrateProgram(),
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