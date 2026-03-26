const axios = require('axios');
const _ = require('lodash');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const rootPath = path.join(__dirname, '../../');
require('dotenv').config({ path: rootPath + '/.env' });
const skipped = {
    surveySubmissionIds: [],
    observationSubmissionIds: []
  }
// CLI args
const args = minimist(process.argv.slice(2));

const DOMAIN = args.domain || null;
const MODE = args.mode || 'both';
console.log(args, '[ARGS]');
const CHUNK_SIZE = args.chunk || 20;
const DELAY_MS = args.delay || 2000;

const COMPLETED = 'completed';

// Validate
if (!DOMAIN) {
  console.error('Usage: node pushSubmissionToKafka.js --domain=http://localhost:4301');
  process.exit(1);
}

// Delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Login
async function loginAndGetToken() {
  const input = JSON.parse(fs.readFileSync(path.join(__dirname, 'input.json'), 'utf8'));
  const { loginCredentails, tenantMappingConfig } = input;

  const res = await axios.post(
    `${process.env.USER_SERVICE_URL}/v1/admin/login`,
    new URLSearchParams({
      identifier: loginCredentails.createrUserName,
      password: loginCredentails.createrPassword,
    }),
    {
      headers: {
        origin: loginCredentails.origin,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  console.log(res.data.result.access_token, '[Auth Success]');
  return res.data.result.access_token;
}

// Batch fetch statuses
async function fetchStatuses(ids, token, type) {
  try {
    const collection = type === 'survey' ? 'surveySubmissions' : 'observationSubmissions';

    const res = await axios.post(
      `${DOMAIN}/survey/v1/admin/dbFind/${collection}`,
      {
        query: { _id: { $in: ids } },
        projection: ['_id', 'status'],
        limit: ids.length,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      }
    );

    // Convert to map → O(1) lookup
    const statusMap = {};
    res.data.result.forEach((doc) => {
      statusMap[doc._id] = doc.status;
    });

    return statusMap;
  } catch (err) {
    console.error('[Batch Fetch Failed]', err.message);
    return {};
  }
}

// Push function
async function pushToKafka(id, status, token, type) {
  try {
    let url = '';

    if (type === 'survey') {
      url =
        status === COMPLETED
          ? `${DOMAIN}/survey/v1/surveySubmissions/pushCompletedSurveySubmissionForReporting/${id}`
          : `${DOMAIN}/survey/v1/surveySubmissions/pushInCompleteSurveySubmissionForReporting/${id}`;
    } else {
      url =
        status === COMPLETED
          ? `${DOMAIN}/survey/v1/observationSubmissions/pushCompletedObservationSubmissionForReporting/${id}`
          : `${DOMAIN}/survey/v1/observationSubmissions/pushInCompleteObservationSubmissionForReporting/${id}`;
    }

    await axios.post(
      url,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      }
    );

    console.log(`[Success] ${type} ${id} (${status})`);
  } catch (err) {
    console.error(`[Failed] ${type} ${id}`, err.response?.data || err.message);
  }
}

// Process in chunks with batch status fetch
async function processInChunks(ids, token, type) {
  const chunks = _.chunk(ids, CHUNK_SIZE);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    console.log(`\n[Processing] ${type} chunk ${i + 1}/${chunks.length}`);

    // SINGLE DB CALL for entire chunk
    const statusMap = await fetchStatuses(chunk, token, type);

    await Promise.all(
      chunk.map((id) => {
        const status = statusMap[id];

        if (!status) {
          console.log(`[Skip] No status for ${id}`);
          const outputDir = path.join(__dirname, 'output');

          // create folder if not exists

          if (type === 'survey') {
            skipped.surveySubmissionIds.push(id);
          } else {
            skipped.observationSubmissionIds.push(id);
          }

          return;
        }

        return pushToKafka(id, status, token, type);
      })
    );

    if (i < chunks.length - 1) {
      console.log(`[Waiting] ${DELAY_MS}ms...`);
      await delay(DELAY_MS);
    }
  }
}

function writeSkippedToFile() {
	try {
		const outputDir = path.join(__dirname, "output")

		// create folder if not exists
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		const filePath = path.join(
			outputDir,
			`kafka_skipped_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
		)

		fs.writeFileSync(filePath, JSON.stringify(skipped, null, 2), 'utf8')

		console.log(`\n📁 Skipped IDs written to: ${filePath}`)
	} catch (err) {
		console.error('[File Write Error]', err.message)
	}
}

// Main
(async () => {
  try {
    // const input = readInputFile(FILE_PATH)
    const input = JSON.parse(fs.readFileSync(path.join(__dirname, 'input2.json'), 'utf8'));

    const surveyIds = input.surveySubmissionIds || [];
    const observationIds = input.observationSubmissionIds || [];

    const token = await loginAndGetToken();

    if (MODE === 'survey' || MODE === 'both') {
      console.log(`\n--- Survey (${surveyIds.length}) ---`);
      await processInChunks(surveyIds, token, 'survey');
    }

    if (MODE === 'observation' || MODE === 'both') {
      console.log(`\n--- Observation (${observationIds.length}) ---`);
      await processInChunks(observationIds, token, 'observation');
    }

    writeSkippedToFile()

    console.log('\n✅ Events pushed Successfully!');
  } catch (err) {
    console.error('[Fatal]', err.message);
  }
})();
