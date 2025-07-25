const axios = require('axios')
const path = require('path')
const _ = require('lodash')
const minimist = require('minimist');
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

// Parse command-line arguments
const args = minimist(process.argv.slice(2));

const DOMAIN       = args.domain || null
const ORIGIN       = args.origin || null
const IDENTIFIER   = args.email || null
const PASSWORD     = args.password || null
const LIMIT        = isNaN(parseInt(args.limit)) ? 10 : parseInt(args.limit);
const MODE         = args.mode || "both"
const PROGRAM_ID   = args.programId || null
const SOLUTION_ID  = args.solutionId || null
const DATE         = args.date || null
const COMPLETED = "completed"
const completedObservationsPushEndpoint = "/survey/v1/observationSubmissions/pushCompletedObservationSubmissionForReporting"
const inCompletedObservationsPushEndpoint = "/survey/v1/observationSubmissions/pushInCompleteObservationSubmissionForReporting"
const completedSurveyPushEndpoint = "/survey/v1/surveySubmissions/pushCompletedSurveySubmissionForReporting"
const inCompletedSurveyPushEndpoint = "/survey/v1/surveySubmissions/pushInCompleteSurveySubmissionForReporting"
const observationSubmissionCollectionName = "observationSubmissions"
const surveySubmissionCollectionName = "surveySubmissions"

if (!DOMAIN || !ORIGIN || !IDENTIFIER || !PASSWORD) {
	console.error('Usage: node pushDataToKafka.js <domain> <origin> <identifier> <password>')
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
        let query = {
			"deleted" : false
		}
		if(PROGRAM_ID) query["programId"] = PROGRAM_ID
		if(SOLUTION_ID) query["solutionId"] = SOLUTION_ID
		if (DATE) {
			const parsedDate = new Date(DATE)
			if (!isNaN(parsedDate)) {
			  query["createdAt"] = { $gte: parsedDate }
			}
		}
		const response = await axios.post(
			`${DOMAIN}/survey/v1/admin/dbFind/${collectionName}`,
			{
				query,
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

		if(MODE === 'survey' || MODE === 'both') await pushSurveySubmissions(token)
		if(MODE === 'observation' || MODE === 'both') await pushObservationSubmissions(token)
		
		console.log(`[Done] All submissions processed.`)
	} catch (error) {
		console.error('[Error] Script execution failed:', error.message)
	}
})()

// Examplar command to run the script

/* 
	node pushDataToKafka.js \
	--domain=http://localhost:6000 \
	--origin=localhost \
	--email=user@example.com \
	--password=pass123 \
	--limit=10 \
	--mode=survey \
	--programId=prog123 \
	--solutionId=sol456 \
	--date=2025-01-01
*/
