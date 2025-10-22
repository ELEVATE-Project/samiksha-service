/**
 * name : migrateprogramtoprojects.js
 * author : Saish R B
 * created-date : Oct 12 2025
 * # Migration Helper Utilities

This module provides utility functions for interacting with Kafka, performing program updates in the Project Service, and handling authentication. It is designed to facilitate migrations and other backend interactions.

*
*/
const projectServiceUrl = process.env.IMPROVEMENT_PROJECT_BASE_URL;
const PROGRAM_UPDATE = '/v1/programs/update';
const EXTERNAL_PROGRAM_READ = '/v1/programs/read';
const request = require('request');

async function pushInCompletedObservationSubmissionToKafka(id, token, DOMAIN, inCompletedObservationPushEndpoint) {
  return new Promise((resolve, reject) => {

    console.log(id, 'id in pushInCompletedObservationSubmissionToKafka');

    const url = `${DOMAIN}${inCompletedObservationPushEndpoint}/${id}`;
    const options = {
      url,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'x-auth-token': token,
      },
      json: {}, // empty body same as axios.post({}, ...)
    };

    request.post(options, (err, res, body) => {
      if (err) {
        console.error(`[Failed] Observation submission ${id} failed to push:`, err.message);
        return reject(err);
      }

      try {
        const data = typeof body === 'object' ? body : JSON.parse(body);
        console.log(data, 'response from pushInCompletedObservationSubmissionToKafka');
        resolve(data);
      } catch (parseErr) {
        console.error(`[Failed] Observation submission ${id} response parse error:`, parseErr.message);
        reject(parseErr);
      }
    });
  });
}
// Push incomplete survey submission
async function pushInCompletedSurveySubmissionToKafka(id, token, DOMAIN, InCompletedSurveyPushEndpoint) {
  return new Promise((resolve, reject) => {
    console.log(id, 'id in pushInCompletedSurveySubmissionToKafka');

    const url = `${DOMAIN}${InCompletedSurveyPushEndpoint}/${id}`;
    const options = {
      url,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'x-auth-token': token,
      },
      json: {}, // equivalent to axios.post({}, ...)
    };

    request.post(options, (err, res, body) => {
      if (err) {
        console.error(`[Failed] Survey submission ${id} failed to push:`, err.message);
        return reject(err);
      }

      try {
        const data = typeof body === 'object' ? body : JSON.parse(body);
        console.log(data, 'response from pushInCompletedSurveySubmissionToKafka');
        resolve(data);
      } catch (parseErr) {
        console.error(`[Failed] Survey submission ${id} response parse error:`, parseErr.message);
        reject(parseErr);
      }
    });
  });
}

// Push completed observation submission
async function pushCompletedObservationSubmissionToKafka(id, token, DOMAIN, completedObservationPushEndpoint) {
  return new Promise((resolve, reject) => {
    console.log(id, 'id in pushCompletedObservationSubmissionToKafka');

    const url = `${DOMAIN}${completedObservationPushEndpoint}/${id}`;
    const options = {
      url,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'x-auth-token': token,
      },
      json: {}, // empty body like axios.post({}, ...)
    };

    request.post(options, (err, res, body) => {
      if (err) {
        console.error(`[Failed] Observation submission ${id} failed to push:`, err.message);
        return reject(err);
      }

      try {
        const data = typeof body === 'object' ? body : JSON.parse(body);
        console.log(data, 'response from pushCompletedObservationSubmissionToKafka');
        resolve(data);
      } catch (parseErr) {
        console.error(`[Failed] Observation submission ${id} response parse error:`, parseErr.message);
        reject(parseErr);
      }
    });
  });
}

// Login and fetch user token
async function loginAsAdminAndGetToken(DOMAIN, IDENTIFIER, PASSWORD, ORIGIN) {
  return new Promise((resolve, reject) => {
    const url = `${DOMAIN}/user/v1/account/login`;

    const options = {
      url,
      headers: {
        Origin: ORIGIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: IDENTIFIER,
        password: PASSWORD,
      }),
    };

    request.post(options, (err, res, body) => {
      if (err) {
        console.error('[Auth Error] Failed to login and fetch token:', err.message);
        return reject(err);
      }

      try {
        const data = typeof body === 'object' ? body : JSON.parse(body);

        if (res.statusCode === 200 && data?.result) {
          console.log('[Auth Success] Token fetched successfully.');
          return resolve(data.result);
        } else {
          console.error('[Auth Error] Unexpected response:', data);
          return reject(new Error('Invalid login response'));
        }
      } catch (parseErr) {
        console.error('[Auth Error] Failed to parse response:', parseErr.message);
        return reject(parseErr);
      }
    });
  });
}

// Push completed survey submission
async function pushCompletedSurveySubmissionToKafka(id, token, DOMAIN, completedSurveyPushEndpoint) {
  return new Promise((resolve, reject) => {
    console.log(id, 'id in pushCompletedSurveySubmissionToKafka');

    const url = `${DOMAIN}${completedSurveyPushEndpoint}/${id}`;
    const options = {
      url,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'x-auth-token': token,
      },
      json: {}, // empty body, same as axios.post({}, ...)
    };

    request.post(options, (err, res, body) => {
      if (err) {
        console.error(`[Failed] Survey submission ${id} failed to push:`, err.message);
        return reject(err);
      }

      try {
        const data = typeof body === 'object' ? body : JSON.parse(body);
        console.log(data, 'response from pushCompletedSurveySubmissionToKafka');
        resolve(data);
      } catch (parseErr) {
        console.error(`[Failed] Survey submission ${id} response parse error:`, parseErr.message);
        reject(parseErr);
      }
    });
  });
}
const projectServiceProgramUpdate = function ({
  projectServiceUrl,
  userToken,
  programId,
  payload = {},
  tenantInfo,
  INTERNAL_ACCESS_TOKEN,
  PROJECT_SERVICE_NAME,
  ADMIN_AUTH_TOKEN
}) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `${projectServiceUrl}/${PROJECT_SERVICE_NAME}${PROGRAM_UPDATE}/${programId}`;

      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': INTERNAL_ACCESS_TOKEN,
          ...tenantInfo,
          'admin-auth-token': ADMIN_AUTH_TOKEN,
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
