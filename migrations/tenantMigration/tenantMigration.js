const path = require('path');
const fs = require('fs');
const rootPath = path.join(__dirname, '../../');
require('dotenv').config({ path: rootPath + '/.env' });

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const request = require('request');

// ─── Config ───────────────────────────────────────────────────────────────────

const url = process.env.MONGODB_URL;
const dbName = process.env.DB;
const BATCH_SIZE = 100;

// Usage: node tenantMigration.js --dry-run   OR   DRY_RUN=true node tenantMigration.js
const dryRun =
  process.argv.includes('--dry-run') ||
  process.env.DRY_RUN === 'true';

// Usage: CONCURRENCY=10 node tenantMigration.js  (default: 10)
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '1', 1);

/**
 * Minimal p-limit style concurrency limiter (no extra dependency needed).
 * Returns a `limit(fn)` wrapper that ensures at most `max` fns run at once.
 */
function createLimiter(max) {
  let active = 0;
  const queue = [];

  function run() {
    if (active >= max || !queue.length) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active--;
        run();
      });
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      run();
    });
  };
}

// ─── Input ────────────────────────────────────────────────────────────────────

const input = JSON.parse(fs.readFileSync(path.join(__dirname, 'input.json'), 'utf8'));
const { loginCredentails, tenantMappingConfig } = input;
const { oldTenantId, newTenantId, newOrgId, oldOrgId } = tenantMappingConfig;

console.log('MongoDB URL  :', url, dbName);
console.log('Old Tenant ID:', oldTenantId);
console.log('New Tenant ID:', newTenantId);
console.log('Old Org ID   :', oldOrgId);
console.log('New Org ID   :', newOrgId);
console.log('Dry Run      :', dryRun);
console.log('Concurrency  :', CONCURRENCY);

// ─── Log File Setup ───────────────────────────────────────────────────────────

const outputDir = path.join(__dirname, "output");

// create folder if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const LOG_FILE = path.join(
  outputDir,
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

// Instead of hitting the disk on every warning/update, we accumulate changes
// in memory and only write when explicitly flushed (end of batch / end of run).
let _logError= false;

function markLogError() {
  _logError = true;
}

function sucessLog() {
  if (!_logError) return;
  fs.writeFileSync(LOG_FILE, JSON.stringify(migrationLog, null, 2), 'utf8');
  _logError = false;
}

/** Previously called writeLog() on every event — now just marks dirty. */
function writeLog() {
  markLogError();
}

function logWarning(collectionName, docId, field, message) {
  const warning = {
    collection: collectionName,
    docId,
    field,
    message,
    timestamp: new Date().toISOString(),
  };
  migrationLog.warnings.push(warning);
  console.warn(`  ⚠️  [${collectionName}] doc ${docId} — ${field}: ${message}`);
  writeLog();
}

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

// ─── Retry wrapper for all HTTP calls ──────────────────────────────────
/**
 * Retry an async function up to `maxAttempts` times with exponential back-off.
 * Only retries on transient failures (network errors, 5xx responses).
 *
 * @param {Function} fn           async function to retry
 * @param {number}   maxAttempts  total attempts (default 3)
 * @param {number}   baseDelayMs  initial delay in ms, doubles each retry (default 300)
 */
async function withRetry(fn, maxAttempts = 1, baseDelayMs = 100) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`    ↻ Attempt ${attempt} failed (${err.message}), retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ─── Entity Service ───────────────────────────────────────────────────────────

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
  return withRetry(
    () =>
      new Promise((resolve, reject) => {
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
            if (err) return reject(new Error(err.message)); // throw so retry picks it up

            const body = response.body;
            // treat 5xx as retryable
            if (response.statusCode >= 500) {
              return reject(new Error(`Entity service ${response.statusCode}: ${body?.message}`));
            }

            if (body.status === 200) {
              return resolve({ success: true, data: body.result || [] });
            }
            // 4xx or business-level error — don't retry
            return resolve({ success: false, data: [], error: body.message });
          });
        } catch (error) {
          reject(error);
        }
      })
  );
}

function profile(userId = '', tenantId = '') {
  return new Promise((resolve, reject) => {
    try {
      const serviceUrl =
        `${process.env.USER_SERVICE_URL}/v1/user/profileById` +
        (userId ? `/${userId}?tenant_code=${tenantId}` : '');

      const options = {
        headers: {
          'content-type': 'application/json',
          internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
        },
        timeout: 5000,
      };

      request.get(serviceUrl, options, (err, response) => {
        if (err) return reject(new Error(err.message));

        // Handle server errors (no retry now, just fail fast)
        if (response.statusCode >= 500) {
          return reject(new Error(`User service ${response.statusCode}`));
        }

        let body;
        try {
          body = JSON.parse(response.body);
        } catch (e) {
          return reject(new Error('Invalid JSON response from user service'));
        }

        if (body.responseCode === 'OK') {
          return resolve({
            success: true,
            data: _.omit(body.result, [
              'email',
              'maskedEmail',
              'maskedPhone',
              'recoveryEmail',
              'phone',
              'prevUsedPhone',
              'prevUsedEmail',
              'recoveryPhone',
              'encEmail',
              'encPhone',
            ]),
          });
        }

        return resolve({
          success: false,
          error: body.params?.status,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Resolve old entity IDs → new entity IDs inside a scope object or array.
 *
 * @param {object|string[]} input
 * @param {string}          tenantId
 * @param {boolean}         returnEntityTypeId
 * @param {string}          collectionName
 * @param {string}          docId
 * @param {string}          _oldOrgId   - explicit param instead of module global
 * @param {string}          _newOrgId   - explicit param instead of module global
 */
async function updateEntities(
  input,
  tenantId,
  returnEntityTypeId = false,
  collectionName,
  docId,
  _oldOrgId = oldOrgId,   // falls back to top-level constant; easy to override in tests
  _newOrgId = newOrgId
) {
  try {
    const isArray = Array.isArray(input);
    const scope = isArray ? { entities: input } : _.omit(input, ['entityType']);

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

      if (!result.success) {
        logWarning(collectionName, docId, 'entities', `entityDocuments call failed: ${result.error}`);
        return input;
      }

      const { data = [] } = result;

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
        id === _oldOrgId.toLowerCase() ? _newOrgId.toLowerCase() : id
      );
    }

    if (returnEntityTypeId) resolvedScope.entityTypeId = newEntityTypeId;

    return resolvedScope;
  } catch (err) {
    console.error('✗ Failed to resolve scope:', err.message);
    logWarning(collectionName, docId, 'entities', err.message);
    return input;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

        const decoded = decodeJWT(token);
        if (!decoded) return reject(new Error('Login failed: could not decode token'));

        // Check admin role across ALL orgs, not just [0]
        const allRoles = (decoded.data.organizations || []).flatMap(
          (org) => (Array.isArray(org.roles) ? org.roles : [org.roles])
        );
        const isAdmin = allRoles.some(
          (role) => (typeof role === 'string' ? role : role?.title || '').toLowerCase() === 'admin'
        );

        if (!isAdmin) {
          const roleNames = allRoles
            .map((r) => (typeof r === 'string' ? r : r?.title || r?.name))
            .filter(Boolean)
            .join(', ');
          return reject(
            new Error(
              `Login failed: user ${userId} does not have admin role. Found roles: ${roleNames || 'none'}`
            )
          );
        }

        console.log(`✓ Login successful. userId: ${userId}, role: admin`);
        return resolve({ token, userId });
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ─── Generic Simple Migrations ─────────────────────────────────────────────────

async function migrateSimpleCollection(collectionName, extraFields = {}, extraQuery = {}) {
  const collection = client.db(dbName).collection(collectionName);

  try {
    const query = { tenantId: oldTenantId, orgId: oldOrgId, ...extraQuery };
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
    sucessLog(); // flush after each collection
    return result.modifiedCount;
  } catch (err) {
    console.error(`  ✗ ${collectionName} migration failed:`, err.message);
    logCollection(collectionName, 0, [], err.message);
    sucessLog();
    throw err;
  }
}

// ─── Batched Migrator ──────────────────────────────────────────────────────────

/**
 * buildOp is now called through the concurrency limiter.
 */
async function migrateBatchedCollection(collectionName, baseQuery, buildOp) {
  const collection = client.db(dbName).collection(collectionName);
  const limit = createLimiter(CONCURRENCY); 

  try {
    const documentsToMigrate = await collection.find(baseQuery).toArray();

    if (!documentsToMigrate.length) {
      console.log(`  No ${collectionName} documents found for migration`);
      logCollection(collectionName, 0, []);
      return 0;
    }

    const batches = _.chunk(documentsToMigrate, BATCH_SIZE);
    console.log(
      `  Processing ${documentsToMigrate.length} ${collectionName} docs in ${batches.length} batch(es)\n`
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

      const bulkOps = await Promise.all(batch.map((doc) => limit(() => buildOp(doc))));

      const result = await collection.bulkWrite(bulkOps);
      totalModified += result.modifiedCount;
      batch.forEach((d) => allUpdatedIds.push(d._id.toString()));

      console.log(`    Batch ${i + 1}/${batches.length}: ${result.modifiedCount} updated`);

      sucessLog();
    }

    console.log(`  ✓ ${collectionName}: ${totalModified} total updated`);
    logCollection(collectionName, totalModified, allUpdatedIds);
    sucessLog();
    return totalModified;
  } catch (error) {
    console.error(`  ✗ ${collectionName} migration failed:`, error.message);
    logCollection(collectionName, 0, [], error.message);
    sucessLog();
    throw error;
  }
}

// ─── Individual Migrators ──────────────────────────────────────────────────────

async function migrateSolutions(author) {
  return migrateBatchedCollection(
    'solutions',
    { tenantId: oldTenantId, orgId: oldOrgId},
    async (doc) => {
      const updatedScope = doc.scope
        ? await updateEntities(doc.scope, newTenantId, false, 'solutions', doc._id.toString())
        : undefined;
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
      const updatedScope = doc.scope
        ? await updateEntities(doc.scope, newTenantId, false, 'programs', doc._id.toString())
        : undefined;
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
              ...(userProfileData && { userProfile: userProfileData.data }),
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
      try {

        let entityData;
        if (doc.entityId) {
          const filter = {
            'metaInformation.tenantMigrationReferenceId': { $in: [doc.entityId] },
            tenantId: newTenantId,
          };

          const result = await entityDocuments(
            filter,
            ['_id', 'metaInformation', 'entityTypeId', 'registryDetails']
          );

          entityData = result?.data?.[0];
        }
        const programInfoWasNullish = !doc.programInformation;
        if (programInfoWasNullish) {
          doc.programInformation = {};
        }
       

        const updatedScope = doc?.programInformation?.scope
          ? await updateEntities(
              doc.programInformation.scope,
              newTenantId,
              false,
              'observationSubmissions',
              doc._id.toString()
            )
          : undefined;

        let userProfileData = null;
        if (doc.userProfile?.id) {
          const result = await profile(doc.userProfile.id, newTenantId);

          if (!result.success) {
            logWarning(
              'observationSubmissions',
              doc._id,
              'userProfile',
              result.error || 'profile call failed'
            );
          } else {
            userProfileData = result;
          }
        }

        const programInfoUpdate = programInfoWasNullish
        ? {
            programInformation: {
              tenantId: newTenantId,
              orgId: newOrgId,
              ...(updatedScope && { scope: updatedScope }),
            },
          }
        : {
            'programInformation.tenantId': newTenantId,
            'programInformation.orgId': newOrgId,
            ...(updatedScope && { 'programInformation.scope': updatedScope }),
          };

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
                  entityInformation: {
                    ...entityData.metaInformation,
                    ...entityData.registryDetails,
                  },
                }),
                'observationInformation.tenantId': newTenantId,
                'observationInformation.orgId': newOrgId,
                ...programInfoUpdate,
                ...(userProfileData && { userProfile: userProfileData.data }),
              },
            },
          },
        };

      } catch (error) {

        console.error(
          `❌ Error processing observationSubmission docId: ${doc._id}`,
          error.message
        );

        // optional detailed log
        console.log("Problematic document:", JSON.stringify(doc, null, 2));

        throw error; // rethrow so migration fails visibly
      }
    }
  );
}

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
    sucessLog();
    return result.modifiedCount;
  } catch (err) {
    console.error(`  ✗ ${collectionName} migration failed:`, err.message);
    logCollection(collectionName, 0, [], err.message);
    sucessLog();
    throw err;
  }
}

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

    const result = await collection.updateMany(query, {
      $set: {
        tenantId: newTenantId,
        'orgIds.$': newOrgId,
        updatedBy: author,
      },
    });

    console.log(`  ✓ ${collectionName}: ${result.modifiedCount} updated`);
    logCollection(collectionName, result.modifiedCount, updatedIds);
    sucessLog();
    return result.modifiedCount;
  } catch (err) {
    console.error(`  ✗ ${collectionName} migration failed:`, err.message);
    logCollection(collectionName, 0, [], err.message);
    sucessLog();
    throw err;
  }
}

async function migrateSurveys() {
  return migrateBatchedCollection(
    'surveys',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { tenantId: newTenantId, orgId: newOrgId } },
      },
    })
  );
}

async function migrateSurveySubmissions() {
  return migrateBatchedCollection(
    'surveySubmissions',
    { tenantId: oldTenantId, orgId: oldOrgId },
    async (doc) => {
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
              ...(userProfileData && { userProfile: userProfileData.data }),
              'surveyInformation.tenantId': newTenantId,
              'surveyInformation.orgId': newOrgId,
            },
          },
        },
      };
    }
  );
}

/**
 * Inspect Promise.allSettled results and throw if any critical collection failed.
 *
 * @param {PromiseSettledResult[]} results
 * @param {string[]}               names     - collection names in the same order
 * @param {string[]}               critical  - names that should abort the migration on failure
 */
function checkSettledResults(results, names, critical = []) {
  const failures = results
    .map((r, i) => ({ name: names[i], ...r }))
    .filter((r) => r.status === 'rejected');

  if (!failures.length) return;

  failures.forEach((f) => {
    console.error(`  ✗ ${f.name} failed: ${f.reason?.message || f.reason}`);
  });

  const criticalFailures = failures.filter((f) => critical.includes(f.name));
  if (criticalFailures.length) {
    throw new Error(
      `Critical collection(s) failed: ${criticalFailures.map((f) => f.name).join(', ')} — aborting migration.`
    );
  }

  console.warn(`  ⚠️  Non-critical failures above — migration continues, check the log file.`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function tenantMigration() {
  try {
    console.log('🚀 Starting Tenant Migration…\n');
    if (dryRun) console.log('⚠️  DRY RUN MODE — No data will be modified\n');

    if (!url || !dbName)
      throw new Error('MONGODB_URL and DB environment variables are required');

    if (!oldTenantId || !newTenantId || !oldOrgId || !newOrgId)
      throw new Error('Missing required parameters in tenantMappingConfig');

    await connectDatabase();

    console.log('🔐 Logging in…');
    const { token, userId: author } = await login();

    // ── Phase 1 ───────────────────────────────────────────────────────────────
    console.log('\n── Phase 1: Simple collections (parallel) ──────────────────────\n');

    const phase1Names = ['criteria', 'frameworks', 'questions', 'criteriaQuestions', 'userExtension'];
    const phase1Results = await Promise.allSettled([
      migrateSimpleCollection('criteria'),
      migrateSimpleCollection('frameworks', { updatedBy: author }),
      migrateSimpleCollection('questions', { updatedBy: author }),
      migrateCriteriaQuestions(),
      migrateUserExtension(author),
    ]);

    checkSettledResults(phase1Results, phase1Names, phase1Names);

    // ── Phase 2 ───────────────────────────────────────────────────────────────
    console.log('\n── Phase 2: Entity-resolution collections (parallel) ───────────\n');

    const phase2Names = [
      'solutions', 'programs', 'observations',
      'observationSubmissions', 'surveys', 'surveySubmissions',
    ];
    const phase2Results = await Promise.allSettled([
      migrateSolutions(author),
      migrateProgram(author),
      migrateObservation(),
      migrateObservationSubmissions(),
      migrateSurveys(),
      migrateSurveySubmissions(),
    ]);

    checkSettledResults(phase2Results, phase2Names, phase2Names);

    migrationLog.completedAt = new Date().toISOString();
    sucessLog(); // final flush

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
    console.log(`  Total documents modified: ${grandTotal}`);
    console.log(`\n📄 Full log written to: ${LOG_FILE}\n`);

    if (migrationLog.errors.length) {
      console.warn(`⚠️  ${migrationLog.errors.length} collection(s) had errors — check the log file.`);
    }

    console.log('✓ Tenant migration completed\n');
  } catch (error) {
    migrationLog.errors.push({ fatal: true, error: error.message });
    migrationLog.completedAt = new Date().toISOString();
    sucessLog();
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