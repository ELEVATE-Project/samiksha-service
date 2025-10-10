/**
 * name : migrateprogramtoprojects.js
 * author : Saish R B
 * created-date : Oct 8 2025
 * Description : Migration script to update program references from program service to project service
 */

require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_URL = process.env.MONGODB_URL;
const DB = process.env.DB;
const projectServiceUrl = process.env.IMPROVEMENT_PROJECT_BASE_URL;
const EXTERNAL_PROGRAM_READ = '/v1/programs/read';
const dbClient = new MongoClient(MONGODB_URL);
const request = require('request');
const completedObservationsPushEndpoint =
  '/survey/v1/observationSubmissions/pushCompletedObservationSubmissionForReporting';
const completedSurveyPushEndpoint =
  '/survey/v1/surveySubmissions/pushCompletedSurveySubmissionForReporting';
const {
  loginAndGetToken,
  pushCompletedObservationSubmissionToKafka,
  pushCompletedSurveySubmissionToKafka,
} = require('./generics/helper');

const fs = require('fs');
const { randomUUID } = require('crypto');

async function modifyProgramsCollection() {
  console.log(`Starting migration for collection: programs`);
  await dbClient.connect();
  const db = dbClient.db(DB);

  // --- Results array for logging
  const migrationResults = [];
  const uniqueFile = `migration_result_${randomUUID()}.txt`;

  function getArgValue(flag) {
    const arg = args.find((a) => a.startsWith(`--${flag}=`));
    return arg ? arg.split('=')[1] : null;
  }

  async function updateSurveyCollection({ programDocument, solutionId, oldProgramId }) {
    let programInformation = {
      _id: new ObjectId(programDocument._id),
      externalId: programDocument.externalId,
      name: programDocument.name,
      description: programDocument.description,
      imageCompression: programDocument.imageCompression,
      isPrivateProgram: programDocument.isAPrivateProgram,
    };

    const surveyRecords = await db
      .collection('surveys')
      .find({ programId: new ObjectId(oldProgramId), solutionId: new ObjectId(solutionId) })
      .toArray();

    let allSurveyIds = surveyRecords.map((survey) => survey._id);

    const updateSurveyRecords = await db.collection('surveys').updateMany(
      {
        _id: { $in: allSurveyIds },
        tenantId: programDocument.tenantId,
        programId: new ObjectId(oldProgramId),
      },
      {
        $set: {
            programId: new ObjectId(programDocument._id),
            programExternalId: programDocument.externalId,
            isExternalProgram:true
        },
      }
    );

    const surveySubmissionRecords = await db
      .collection('surveySubmissions')
      .find({
        programId: new ObjectId(oldProgramId),
        solutionId: new ObjectId(solutionId),
        surveyId: { $in: allSurveyIds },
      })
      .toArray();

    for (let index = 0; index < surveySubmissionRecords.length; index++) {
      let submissionRecord = surveySubmissionRecords[index];
      let surveyInformation = submissionRecord.surveyInformation || {};
      await db.collection('surveySubmissions').updateOne(
        { _id: submissionRecord._id, tenantId: programDocument.tenantId, programId: new ObjectId(oldProgramId) },
        {
          $set: {
            programId: new ObjectId(programDocument._id),     //check
            programExternalId: programDocument.externalId,
            programInformation: programInformation,
            isExternalProgram:true,
            surveyInformation: {
              ...surveyInformation,
              programId: new ObjectId(programDocument._id),
              programExternalId: programDocument.externalId,
            },
          },
        }
      );

      pushCompletedSurveySubmissionToKafka(
        submissionRecord._id.toString(),
        token,
        domain,
        completedSurveyPushEndpoint
      );
    }

    console.log('Survey and Survey Submission collections updated successfully...');
  }

  async function updateObservationCollection({ programDocument, solutionId, oldProgramId }) {
    let programInformation = {
      _id: new ObjectId(programDocument._id),
      externalId: programDocument.externalId,
      name: programDocument.name,
      description: programDocument.description,
      imageCompression: programDocument.imageCompression,
      isPrivateProgram: programDocument.isAPrivateProgram,
    };

    const surveyRecords = await db
      .collection('observations')
      .find({ programId: new ObjectId(oldProgramId), solutionId: new ObjectId(solutionId) })
      .toArray();

    let allObservationIds = surveyRecords.map((survey) => survey._id);

    const updateObservationRecords = await db.collection('observations').updateMany(
      {
        _id: { $in: allObservationIds },
        tenantId: programDocument.tenantId,
        programId: new ObjectId(oldProgramId),
      },
      {
        $set: {
          programId: new ObjectId(programDocument._id),
          programExternalId: programDocument.externalId,
          isExternalProgram:true
        },
      }
    );

    const observationSubmissionRecords = await db
      .collection('observationSubmissions')
      .find({
        programId: new ObjectId(oldProgramId),
        solutionId: new ObjectId(solutionId),
        observationId: { $in: allObservationIds },
      })
      .toArray();

    for (let index = 0; index < observationSubmissionRecords.length; index++) {
      let submissionRecord = observationSubmissionRecords[index];
      let observationInfo = submissionRecord.observationInformation || {};
      await db.collection('observationSubmissions').updateOne(
        { _id: submissionRecord._id, tenantId: programDocument.tenantId, programId: new ObjectId(oldProgramId) },
        {
          $set: {
            programId: new ObjectId(programDocument._id),
            programExternalId: programDocument.externalId,
            programInformation: programInformation,
            isExternalProgram:true,
            observationInformation: {
              ...observationInfo,
              programId: new ObjectId(programDocument._id),
              programExternalId: programDocument.externalId,
            },
          },
        }
      );

      pushCompletedObservationSubmissionToKafka(
        submissionRecord._id.toString(),
        token,
        domain,
        completedObservationsPushEndpoint
      );
    }

    console.log('Observation and Observation Submission collections updated successfully...');
  }

  // Default ID pairs (each pair = [oldId, newId])
  const defaultPairs = [
    ['68c0781d1702a1001476261c', '68c12803ed55b7f8b7fba812'],
    ['68db7e07c24cb20014ffbc47', '68e36ff5a634a9291cc1c5b5'],
    ['68c7e9e01702a1001476337d', '68c7f1b9ed55b7f8b7fbac46'],
  ];

  const args = process.argv.slice(2);

  const tenantId = getArgValue('tenantId');
  const projectServiceProgramId = getArgValue('projectServiceProgramId');
  const surveyServiceProgramId = getArgValue('surveyServiceProgramId');
  const domain = getArgValue('domain');
  const identifier = getArgValue('identifier');
  const password = getArgValue('password');
  const origin = getArgValue('origin');

  if (!origin || !domain || !identifier || !password || !tenantId) {
    console.error('❌ Missing required flags.');
    process.exit(1);
  }

  const token = await loginAndGetToken(domain, identifier, password, origin);

  if (!token) {
    console.error('❌ Failed to authenticate. Please check your credentials.');
    process.exit(1);
  }
  console.log('✅ Authentication successful.');

  const idPairs =
    projectServiceProgramId && surveyServiceProgramId
      ? [[projectServiceProgramId, surveyServiceProgramId]]
      : defaultPairs;

  console.log('✅ ID Pairs to process:');
  idPairs.forEach(([oldId, newId], index) => {
    console.log(`${index + 1}. Old ID: ${oldId}  →  New ID: ${newId}`);
  });

  for (let i = 0; i < idPairs.length; i++) {
    await processMigrationFor(idPairs[i][0], idPairs[i][1], tenantId);
  }

  async function processMigrationFor(projectProgramId, surveyProgramId, tenantId) {
    console.log(`\n🔄 Starting migration for Old ID: ${projectProgramId} to New ID: ${surveyProgramId}`);

    let programDocument = await programDetails(undefined, projectProgramId, undefined, { tenantId });

    if (!programDocument) {
      console.error('❌ Program not found with given id');
      migrationResults.push({
        oldProgramId: projectProgramId,
        newProgramId: surveyProgramId,
        status: 'program_not_found',
      });
      return;
    }

    programDocument = programDocument.status == 200 ? programDocument.result : null;

    const solutionRecords = await db
      .collection('solutions')
      .find({ programId: new ObjectId(surveyProgramId), tenantId })
      .toArray();

    if (!solutionRecords.length) {
      console.log(`No solutions found for programId: ${surveyProgramId}. Skipping...`);
      migrationResults.push({
        oldProgramId: projectProgramId,
        newProgramId: surveyProgramId,
        status: 'no_solutions_found',
      });
      return;
    }

    for (let index = 0; index < solutionRecords.length; index++) {
      try {
        console.log('modifying solution id ', solutionRecords[index]._id);
        const updateSolutionRecord = await db.collection('solutions').updateOne(
          { programId: new ObjectId(surveyProgramId), _id: solutionRecords[index]._id },
          {
            $set: {
              programId: new ObjectId(programDocument._id), //check
              programName: programDocument.name,
              programDescription: programDocument.description,
              programExternalId: programDocument.externalId,
              isExternalProgram: true,
              updatedAt: new Date(),
            },
          }
        );

        if (updateSolutionRecord) {
          if (solutionRecords[index].type == 'survey') {
            await updateSurveyCollection({
              programDocument,
              solutionId: solutionRecords[index]._id,
              oldProgramId: surveyProgramId,
            });
          } else if (solutionRecords[index].type == 'observation') {
            await updateObservationCollection({
              programDocument,
              solutionId: solutionRecords[index]._id,
              oldProgramId: surveyProgramId,
            });
          }
        }

        migrationResults.push({
          oldProgramId: projectProgramId,
          newProgramId: surveyProgramId,
          solutionId: solutionRecords[index]._id.toString(),
          status: 'success',
        });
      } catch (err) {
        migrationResults.push({
          oldProgramId: projectProgramId,
          newProgramId: surveyProgramId,
          solutionId: solutionRecords[index]._id.toString(),
          status: 'failed',
          error: err.message,
        });
      }

      //now we need to update program from survey service to inactive
      await db.collection('programs').updateOne(
        { _id: new ObjectId(surveyProgramId) },
        {
          $set: {
            status: 'inactive',
            updatedAt: new Date(),
          },
        }
      );
    }
  }

  // --- After all migrations, write results to file
  fs.writeFileSync(uniqueFile, JSON.stringify(migrationResults, null, 2));
  console.log(`\n📝 Migration results written to: ${uniqueFile}`);
}

modifyProgramsCollection().catch((error) => {
  console.log(error, 'error');
  console.log(`Error during migration: ${error.message}`);
  process.exit(1);
});

const programDetails = function (userToken, programId, userDetails, payload = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${EXTERNAL_PROGRAM_READ}/${programId}`;
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: { tenantData: payload },
      };

      if (userToken) {
        options.headers['X-auth-token'] = userToken;
      }

      request.get(url, options, projectServiceCallback);

      let result = { success: true };

      function projectServiceCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;
          if (typeof response !== 'object') response = JSON.parse(response);
          result = response;
          if (result.status === 200) return resolve(result);
          result.success = false;
        }
        return resolve(result);
      }

      setTimeout(() => resolve({ success: false }), 5000);
    } catch (error) {
      return reject(error);
    }
  });
};
