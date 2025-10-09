const axios = require('axios');

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
async function loginAndGetToken(DOMAIN, IDENTIFIER, PASSWORD, ORIGIN) {
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
    );
    console.log('[Auth Success] Token fetched successfully.');
    return response.data.result.access_token;
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

module.exports = {
pushCompletedObservationSubmissionToKafka,
pushCompletedSurveySubmissionToKafka,
loginAndGetToken
}