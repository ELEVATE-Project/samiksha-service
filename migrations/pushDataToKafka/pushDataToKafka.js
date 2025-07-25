const axios = require('axios')
const path = require('path')
const _ = require('lodash')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Command-line args
const args = process.argv.slice(2)
const DOMAIN = args[0] // e.g., https://saas-qa.tekdinext.com
const ORIGIN = args[1] // e.g., default-qa.tekdinext.com
const IDENTIFIER = args[2] // e.g., nevil@tunerlabs.com
const PASSWORD = args[3] // e.g., your password
const LIMIT = isNaN(parseInt(args[4])) ? 10 : parseInt(args[4])
const COMPLETED = "completed"
const completedObservationsPushEndpoint = "/survey/v1/observationSubmissions/pushCompletedObservationSubmissionForReporting"
const inCompletedObservationsPushEndpoint = "/survey/v1/observationSubmissions/pushInCompleteObservationSubmissionForReporting"
const completedSurveyPushEndpoint = "/survey/v1/surveySubmissions/pushCompletedSurveySubmissionForReporting"
const inCompletedSurveyPushEndpoint = "/survey/v1/surveySubmissions/pushInCompleteSurveySubmissionForReporting"
const observationSubmissionCollectionName = "observationSubmissions"
const surveySubmissionCollectionName = "surveySubmissions"

if (!DOMAIN || !ORIGIN || !IDENTIFIER || !PASSWORD) {
	console.error('Usage: node pushProjectToKafka.js <domain> <origin> <identifier> <password>')
	process.exit(1)
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loginAndGetToken() {
	try {
		const response = await axios.post(
			`${DOMAIN}/user/v1/account/login`,
			new URLSearchParams({
				identifier: IDENTIFIER,
				password: PASSWORD,
			}),
			{
				headers: {
					Origin: ORIGIN,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			}
		)
		console.log('[Auth Success] Token fetched successfully.')
		return response.data.result.access_token
	} catch (err) {
		console.error('[Auth Error] Failed to login and fetch token:', err.response?.data || err.message)
		throw err
	}
}

async function fetchResourceIds(token, collectionName) {
	try {
        console.log(`${DOMAIN}/survey/v1/admin/dbFind/${collectionName}`)
		const response = await axios.post(
			`${DOMAIN}/survey/v1/admin/dbFind/${collectionName}`,
			{
				query: {"deleted" : false},
				projection: ['_id', 'status'],
				limit: LIMIT,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'X-auth-token': token,
				},
			}
		)
		console.log(`[Info] Fetched ${response.data.result.length} ${collectionName} IDs via DB API.`)
		return response.data.result
	} catch (err) {
		console.error(`[Error] Failed to fetch ${collectionName} IDs from DB API:`, err.response?.data || err.message)
		throw err
	}
}

async function pushCompletedSurveySubmissionToKafka(id, token){
    try{
        const response = await axios.post(
			`${DOMAIN}${completedSurveyPushEndpoint}/${id}`,
			{},
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/plain, */*',
					'x-auth-token': token,
				},
			}
		)
    }
    catch(err){
		console.error(`[Failed] Survey ${id} failed to push:`, err.response?.data || err.message)
    }
}

async function pushInCompletedSurveySubmissionToKafka(id, token){
    try{
        const response = await axios.post(
			`${DOMAIN}${inCompletedSurveyPushEndpoint}/${id}`,
			{},
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/plain, */*',
					'x-auth-token': token,
				},
			}
		)
    }
    catch(err){
		console.error(`[Failed] Survey ${id} failed to push:`, err.response?.data || err.message)
    }
}

async function pushCompletedObservationSubmissionToKafka(id, token){
    try{
        const response = await axios.post(
			`${DOMAIN}${completedObservationsPushEndpoint}/${id}`,
			{},
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/plain, */*',
					'x-auth-token': token,
				},
			}
		)
    }
    catch(err){
		console.error(`[Failed] Observation ${id} failed to push:`, err.response?.data || err.message)
    }
}

async function pushInCompletedObservationSubmissionToKafka(id, token){
    try{
        const response = await axios.post(
			`${DOMAIN}${inCompletedObservationsPushEndpoint}/${id}`,
			{},
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/plain, */*',
					'x-auth-token': token,
				},
			}
		)
    }
    catch(err){
		console.error(`[Failed] Observation ${id} failed to push:`, err.response?.data || err.message)
    }
}

async function pushCompletedResourcesToKafka(id, token, collection) {
	try {
        switch(collection){
            case 'survey': await pushCompletedSurveySubmissionToKafka(id, token)
            break
            case 'observation' : await pushCompletedObservationSubmissionToKafka(id, token)
            break
            default: console.log("Unknown collection");
        }

		console.log(`[Success] ${collection} ${id} pushed to Kafka.`)
	} catch (err) {
		console.error(`[Failed] ${collection} ${id} failed to push:`, err.response?.data || err.message)
	}
}

async function pushInCompletedResourcesToKafka(id, token, collection) {
	try {
        switch(collection){
            case 'survey': await pushInCompletedSurveySubmissionToKafka(id, token)
            break
            case 'observation' : await pushInCompletedObservationSubmissionToKafka(id, token)
            break
            default: console.log("Unknown collection");
        }

		console.log(`[Success] ${collection} ${id} pushed to Kafka.`)
	} catch (err) {
		console.error(`[Failed] ${collection} ${id} failed to push:`, err.response?.data || err.message)
	}
}

function separateCompletedAndInCompletedResources(docs){
    let completedResources = []
    let inCompletedResources = []
    for(let i=0; i<docs.length; i++){
        if(docs[i].status === COMPLETED) completedResources.push(docs[i])
        else inCompletedResources.push(docs[i])
    }

    return {completedResources, inCompletedResources}
}

async function pushSurveySubmissions(token) {
    try{
        const surveyDocs = await fetchResourceIds(token, surveySubmissionCollectionName)
        const {completedResources, inCompletedResources} = separateCompletedAndInCompletedResources(surveyDocs)
        const completedSurveyChunks = _.chunk(completedResources, 5)
        const inCompletedSurveyChunks = _.chunk(inCompletedResources, 5)

        // Handle Completed Survey Submissions
		for (let i = 0; i < completedSurveyChunks.length; i++) {
			const chunk = completedSurveyChunks[i]
			console.log(`[Processing] Chunk ${i + 1} of ${completedSurveyChunks.length}`)
			await Promise.all(chunk.map((survey) => pushCompletedResourcesToKafka(survey._id, token, 'survey')))

			// Wait 3 seconds before the next chunk
			if (i < completedSurveyChunks.length - 1) {
				console.log(`[Waiting] Delaying before next chunk...`)
				await delay(3000) // delay in milliseconds
			}
		}

        // Handle InCompleted Survey Submissions
		for (let i = 0; i < inCompletedSurveyChunks.length; i++) {
			const chunk = inCompletedSurveyChunks[i]
			console.log(`[Processing] Chunk ${i + 1} of ${inCompletedSurveyChunks.length}`)
			await Promise.all(chunk.map((survey) => pushInCompletedResourcesToKafka(survey._id, token, 'survey')))

			// Wait 3 seconds before the next chunk
			if (i < inCompletedSurveyChunks.length - 1) {
				console.log(`[Waiting] Delaying before next chunk...`)
				await delay(3000) // delay in milliseconds
			}
		}
    }
    catch(err){
		console.error(`[Failed] Some survey submissions failed to push:`, err.response?.data || err.message)    
    }
}

async function pushObservationSubmissions(token) {
    try{
        const observationDocs = await fetchResourceIds(token, observationSubmissionCollectionName)
        const {completedResources, inCompletedResources} = separateCompletedAndInCompletedResources(observationDocs)
        const completedObservationChunks = _.chunk(completedResources, 5)
        const inCompletedObservationChunks = _.chunk(inCompletedResources, 5)

        // Handle Completed Observation Submissions
		for (let i = 0; i < completedObservationChunks.length; i++) {
			const chunk = completedObservationChunks[i]
			console.log(`[Processing] Chunk ${i + 1} of ${completedObservationChunks.length}`)
			await Promise.all(chunk.map((observation) => pushCompletedResourcesToKafka(observation._id, token, 'observation')))

			// Wait 3 seconds before the next chunk
			if (i < completedObservationChunks.length - 1) {
				console.log(`[Waiting] Delaying before next chunk...`)
				await delay(3000) // delay in milliseconds
			}
		}

        // Handle InCompleted Observation Submissions
		for (let i = 0; i < inCompletedObservationChunks.length; i++) {
			const chunk = inCompletedObservationChunks[i]
			console.log(`[Processing] Chunk ${i + 1} of ${inCompletedObservationChunks.length}`)
			await Promise.all(chunk.map((observation) => pushInCompletedResourcesToKafka(observation._id, token, 'observation')))

			// Wait 3 seconds before the next chunk
			if (i < inCompletedObservationChunks.length - 1) {
				console.log(`[Waiting] Delaying before next chunk...`)
				await delay(3000) // delay in milliseconds
			}
		}
    }
    catch(err){
        console.error(`[Failed] Some observation submissions failed to push:`, err.response?.data || err.message)
    }    
}

;(async () => {
	try {
		const token = await loginAndGetToken()
		console.log('[Info] Logged in successfully.')

        await pushSurveySubmissions(token)
        await pushObservationSubmissions(token)
		
		console.log(`[Done] All survey and observation submissions processed.`)
	} catch (error) {
		console.error('[Error] Script execution failed:', error.message)
	}
})()
// command sample : node pushProjectsToKafka.js   https://saas-qa.tekdinext.com   default-qa.tekdinext.com   nevil@tunerlabs.com   'PASSword###11'