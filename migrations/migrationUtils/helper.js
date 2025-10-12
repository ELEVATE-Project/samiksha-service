/**
 * name : migrateprogramtoprojects.js
 * author : Saish R B
 * created-date : Oct 12 2025
 * # Migration Helper Utilities

This module provides utility functions for interacting with Kafka, performing program updates in the Project Service, and handling authentication. It is designed to facilitate migrations and other backend interactions.

*
*/

const axios = require('axios');
const projectServiceUrl = process.env.IMPROVEMENT_PROJECT_BASE_URL;
const PROGRAM_UPDATE = '/v1/programs/update';
const EXTERNAL_PROGRAM_READ = '/v1/programs/read';
const request = require('request');

async function pushInCompletedObservationSubmissionToKafka(id, token, DOMAIN, inCompletedObservationPushEndpoint) {
  try {
    const response = await axios.post(
      `${DOMAIN}${inCompletedObservationPushEndpoint}/${id}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
          'x-auth-token': token,
        },
      }
    );
    console.log(response.data, 'response from pushInCompletedObservationSubmissionToKafka');
    
  } catch (err) {
    console.error(`[Failed] Observation submission ${id} failed to push:`, err.response?.data || err.message);
  }
}

// Push completed survey submission
async function pushInCompletedSurveySubmissionToKafka(id, token, DOMAIN, InCompletedSurveyPushEndpoint) {
  try {
    console.log(id, 'id in pushInCompletedSurveySubmissionToKafka');
    const response = await axios.post(
      `${DOMAIN}${InCompletedSurveyPushEndpoint}/${id}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
          'x-auth-token': token,
        },
      }
    );
    console.log(response.data, 'response from pushInCompletedSurveySubmissionToKafka');
  } catch (err) {
    console.error(`[Failed] Survey submission ${id} failed to push:`, err.response?.data || err.message);
  }
}

async function pushCompletedObservationSubmissionToKafka(id, token, DOMAIN, completedObservationPushEndpoint) {
  try {
    const response = await axios.post(
      `${DOMAIN}${completedObservationPushEndpoint}/${id}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
          'x-auth-token': token,
        },
      }
    );
    console.log(response.data, 'response from pushCompletedObservationSubmissionToKafka');
  } catch (err) {
    console.error(`[Failed] Observation submission ${id} failed to push:`, err.response?.data || err.message);
  }
}

// Login and fetch user token
async function loginAsAdminAndGetToken(DOMAIN, IDENTIFIER, PASSWORD, ORIGIN) {
  try {
    const response = await axios.post(
      `${DOMAIN}/user/v1/admin/login`,
      JSON.stringify({
        identifier: IDENTIFIER,
        password: PASSWORD,
      }),
      {
        headers: {
          Origin: ORIGIN,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('[Auth Success] Token fetched successfully.');
    return response.data.result;
  } catch (err) {
    console.error('[Auth Error] Failed to login and fetch token:', err.response?.data || err.message);
    throw err;
  }
}

// Push completed survey submission
async function pushCompletedSurveySubmissionToKafka(id, token, DOMAIN, completedSurveyPushEndpoint) {
  try {
    console.log(id, 'id in pushCompletedSurveySubmissionToKafka');
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
    );
    console.log(response.data, 'response from pushCompletedSurveySubmissionToKafka');
  } catch (err) {
    console.error(`[Failed] Survey submission ${id} failed to push:`, err.response?.data || err.message);
  }
}

const projectServiceProgramUpdate = function ({
  projectServiceUrl,
  userToken,
  programId,
  payload = {},
  tenantInfo,
  INTERNAL_ACCESS_TOKEN,
  PROJECT_SERVICE_NAME,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `${projectServiceUrl}/${PROJECT_SERVICE_NAME}${PROGRAM_UPDATE}/${programId}`;

      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': INTERNAL_ACCESS_TOKEN,
          ...tenantInfo,
          'admin-auth-token': 'N0DM5NAwwCN5KNXKJwlwu6c0nQQt6Rcl',
        },
        json: { ...payload },
      };

      if (userToken) {
        options.headers['X-auth-token'] = userToken;
      }

      request.post(url, options, projectServiceCallback);

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

const projectServiceProgramDetails = function ({userToken, programId, payload = {},PROJECT_SERVICE_NAME,INTERNAL_ACCESS_TOKEN}) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `${projectServiceUrl}/${PROJECT_SERVICE_NAME}${EXTERNAL_PROGRAM_READ}/${programId}`;
      
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': INTERNAL_ACCESS_TOKEN,
        },
        json: {  ...payload },
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

module.exports = {
  pushCompletedObservationSubmissionToKafka,
  pushCompletedSurveySubmissionToKafka,
  loginAsAdminAndGetToken,
  pushInCompletedObservationSubmissionToKafka,
  pushInCompletedSurveySubmissionToKafka,
  projectServiceProgramUpdate,
  projectServiceProgramDetails
};
