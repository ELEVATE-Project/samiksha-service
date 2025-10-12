/**
 * name : migrateprogramtoprojects.js
 * author : Saish R B
 * created-date : Oct 8 2025
 * Description : Migration script to update program references from program service to project service
 * 
 * # 🚀 Program to Project Migration Script

## ⚙️ What It Does

- Updates program references in:
  - `solutions`
  - `surveys` & `surveySubmissions`
  - `observations` & `observationSubmissions`
- Pushes submission updates (completed/incomplete) to Kafka.
- Updates the `components` field in Project Service.
- Marks the old Survey Service programs as **inactive**.
- Logs migration results in a unique result file.

---
## ⚠️ Important Note

The program update to Project Service currently uses the **older method** of updating `components` (simple array of solution IDs).  
If your system has migrated to the new format that includes an `order` key in `components`, **this script will not work as-is** for that use case.

If your Project Service now uses the **new component format with `order` keys**, you must **update the payload structure** inside the script accordingly.


---



## 📂 Affected Collections

- `programs`
- `solutions`
- `surveys`
- `surveySubmissions`
- `observations`
- `observationSubmissions`

---

## 🧾 Requirements

- Node.js installed
- MongoDB connection access
- `.env` file placed in the **parent directory** (`../.env`) with the following keys:

  ```env
  MONGODB_URL=<your_mongo_connection_url>
  DB=<your_db_name>
  IMPROVEMENT_PROJECT_BASE_URL=<project_service_base_url>
  INTERNAL_ACCESS_TOKEN=<internal_access_token>
  PROJECT_SERVICE_NAME=project

 * 
 * 
 * 
 * ## 🧾 Command to run the script 
 * 
 * 
 * node migrateprogramtoprojects.js --tenantId=shikshalokam --projectServiceProgramId=68d39a10bd71ddbafc8a5dc0 --surveyServiceProgramId=689d7f832829ddbc94193d98 --domain=https://dev.elevate-apis.shikshalokam.org --identifier=nevil@tunerlabs.com --password=PASSword###11 --origin=default-qa.tekdinext.com
 * 
 * 
 * 
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
const InCompletedObservationsPushEndpoint =
  '/survey/v1/observationSubmissions/pushInCompleteObservationSubmissionForReporting';
const InCompletedSurveyPushEndpoint =
  '/survey/v1/surveySubmissions/pushInCompleteSurveySubmissionForReporting';
const solutionIdsToBeUpdatedInComponentsInProjectService = [];
const projectServiceSubDomain = 'project'
const programInfoMap = {}
const {
  loginAsAdminAndGetToken,
  pushCompletedObservationSubmissionToKafka,
  pushCompletedSurveySubmissionToKafka,
  pushInCompletedObservationSubmissionToKafka,
  pushInCompletedSurveySubmissionToKafka,
  projectServiceProgramUpdate,
  projectServiceProgramDetails
} = require('./migrationUtils/helper');

const fs = require('fs');
const { randomUUID } = require('crypto');
let orgId = null;

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
              isExternalProgram:true,
              programId: new ObjectId(programDocument._id),
              programExternalId: programDocument.externalId,
            },
          },
        }
      );

      if (submissionRecord.status == 'completed') {
        pushCompletedSurveySubmissionToKafka(
          submissionRecord._id.toString(),
          token,
          domain,
          completedSurveyPushEndpoint
        );
      } else if (submissionRecord.status == 'started'){
        
        pushInCompletedSurveySubmissionToKafka(
          submissionRecord._id.toString(),
          token,
          domain,
          InCompletedSurveyPushEndpoint
        );
      }


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
          programId: new ObjectId(programDocument._id), //check
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
            programId: new ObjectId(programDocument._id),   //check
            programExternalId: programDocument.externalId,
            programInformation: programInformation,
            isExternalProgram:true,
            observationInformation: {
              ...observationInfo,
              isExternalProgram:true,
              programId: new ObjectId(programDocument._id),
              programExternalId: programDocument.externalId,
            },
          },
        }
      );

      if (submissionRecord.status == 'completed') {
        pushCompletedObservationSubmissionToKafka(
          submissionRecord._id.toString(),
          token,
          domain,
          completedObservationsPushEndpoint
        );
      } else if (submissionRecord.status == 'started') {
        
        pushInCompletedObservationSubmissionToKafka(
          submissionRecord._id.toString(),
          token,
          domain,
          InCompletedObservationsPushEndpoint
        );
      }


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

  const userInfo = await loginAsAdminAndGetToken(domain, identifier, password, origin);

  const token = userInfo?.access_token ?? null;

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

  await updateProjectServiceComponents(solutionIdsToBeUpdatedInComponentsInProjectService)

  async function processMigrationFor(projectProgramId, surveyProgramId, tenantId) {
    console.log(`\n🔄 Starting migration for Old ID: ${projectProgramId} to New ID: ${surveyProgramId}`);

    //let programDocument = await programDetails(undefined, projectProgramId, undefined, { tenantId });
    let programDocument = await projectServiceProgramDetails({
      userToken:undefined,
      programId:projectProgramId,
      payload:{
        tenantData:{tenantId}
      },
      PROJECT_SERVICE_NAME:projectServiceSubDomain,
      INTERNAL_ACCESS_TOKEN:process.env.INTERNAL_ACCESS_TOKEN
    });

    if (!programDocument || !programDocument?.result) {
      console.error('❌ Program not found with given id');
      migrationResults.push({
        oldProgramId: projectProgramId,
        newProgramId: surveyProgramId,
        status: 'program_not_found',
      });
      return;
    }

    programDocument = programDocument.result;

    orgId = programDocument.orgId;

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

    programInfoMap[programDocument._id] = programDocument
    let programSolutionMap = {};
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

        // Initialize the array if it doesn't exist
        if (!Array.isArray(programSolutionMap[projectProgramId])) {
          programSolutionMap[projectProgramId] = [];
        }

        programSolutionMap[projectProgramId].push(solutionRecords[index]._id.toString());
      } catch (err) {
        migrationResults.push({
          oldProgramId: projectProgramId,
          newProgramId: surveyProgramId,
          solutionId: solutionRecords[index]._id.toString(),
          status: 'failed',
          error: err.message,
        });
      }
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

      solutionIdsToBeUpdatedInComponentsInProjectService.push(programSolutionMap);
  }

  async function updateProjectServiceComponents(solutionIdsToBeUpdatedInComponentsInProjectService) {
    for (let index = 0; index < solutionIdsToBeUpdatedInComponentsInProjectService.length; index++) {
      let mapInstance = solutionIdsToBeUpdatedInComponentsInProjectService?.[index];

      if (mapInstance && typeof mapInstance === 'object' && !Array.isArray(mapInstance)) {
        let programId = Object.keys(mapInstance)[0];
        let solutionIds = mapInstance?.[programId] ?? [];

        solutionIds = solutionIds.map((solId)=>{
          return solId.toString()
        })

        let programInfo = programInfoMap[programId];
        
        let currentComponents = programInfo.components;
        
        currentComponents = currentComponents.map((component)=>{
          return component.toString()
        })

        let newComponent = [
          ...currentComponents, // Keep all items from currentComponents
          ...solutionIds.filter((solId) => !currentComponents.includes(solId)), // Add only the ones not in currentComponents
        ];

        let result = await projectServiceProgramUpdate({
          projectServiceUrl,
          userToken:token,
          programId,
          payload:{
            components:newComponent
          },
          tenantInfo:{
            tenantId,
            orgId
          },
          INTERNAL_ACCESS_TOKEN:process.env.INTERNAL_ACCESS_TOKEN,
          PROJECT_SERVICE_NAME:projectServiceSubDomain
        });

        if(result.status == 200){
          console.log('program components updated successfully in project service...')
        }

        // You can now safely use programId and solutionIds
      } else {
        console.warn('Invalid map instance at index:', index);
      }
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

