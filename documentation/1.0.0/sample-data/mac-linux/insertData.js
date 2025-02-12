const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017'; // MongoDB URL
const surveyDb = 'surveydb';
const entityDb = 'elevate-entity';

const surveyData = require('./data.js');
const entityData = require('./data3.js')
const observationData = require('./data2.js');

async function insertData(collectionName, dataFile,currentDB = surveyDb) {
    const client = new MongoClient(url);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log(`Connected to MongoDB for ${collectionName}`);

        const db = client.db(currentDB);
        const collection = db.collection(collectionName);

        // Read the data from the file
        const data = dataFile

        if(!data){
            await client.close();
            return;
        }

        const result = await collection.insertMany(data);
        //console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
    } finally {
        await client.close();
    }
}

async function main({dataToBeInserted}) {


    await insertData('entities', dataToBeInserted.entities,entityDb);
    await insertData('entityTypes',dataToBeInserted.entityType,entityDb);
    await insertData('userRoleExtension', dataToBeInserted.userRoleExtension,entityDb);

    await insertData('programs', dataToBeInserted.programData);
    await insertData('solutions',dataToBeInserted.solutionData);
    await insertData('survey', dataToBeInserted.surveysData);
    await insertData('criteria',dataToBeInserted.criteriaData);
    await insertData('criteriaQuestions',dataToBeInserted.criteriaQuestionsData);
    await insertData('questions',dataToBeInserted.questionsData);
    await insertData('frameworks',dataToBeInserted.frameworkData);
    await insertData('observationSubmissions',dataToBeInserted.observationSubmissionData);
    await insertData('observations',dataToBeInserted.observationData);

}

main({dataToBeInserted:entityData}).then(()=>{
    console.log('Entity data populated successfully.')
}).catch(console.error);
main({dataToBeInserted:surveyData}).then(()=>{
    console.log('survey data populated successfully.')
}).catch(console.error);
main({dataToBeInserted:observationData}).then(()=>{
    console.log('Observation data populated successfully.')
}).catch(console.error);





