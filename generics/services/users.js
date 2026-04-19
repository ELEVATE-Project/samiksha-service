//dependencies
const request = require('request');
const userServiceUrl = process.env.USER_SERVICE_URL;

const NodeCache = require('node-cache')
const tenantCache = new NodeCache()

const CACHE_TTL_SECONDS = Number(process.env.TENANT_CACHE_TTL)

/**
 *
 * @function
 * @name profile
 * @param {String}   userId -userId
 * @param {String}   userToken-userToken
 * @returns {Promise} returns a promise.
 */
const profile = function (userId = '', userToken = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let url = userServiceUrl + messageConstants.endpoints.USER_READ;

      if (userId !== '') {
        url = url + '/' + userId;
      }

      const options = {
        headers: {
          'content-type': 'application/json',
          internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
        },
      };
      if (userToken !== '') {
        options.headers['x-auth-token'] = userToken;
      }
      request.get(url, options, kendraCallback);

      function kendraCallback(err, data) {
        let result = {
          success: true,
        };

        if (err) {
          result.success = false;
        } else {
          let response = JSON.parse(data.body);
          if (response.responseCode === httpStatusCode['ok_userService'].message) {
            result['data'] = _.omit(response.result, [
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
            ]);
          } else {
            result['message'] = response.params?.status;
            result.success = false;
          }
        }

        return resolve(result);
      }
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Fetches the default organization details for a given organization code/id.
 * @param {string} organisationIdentifier - The code/id of the organization.
 * @param {String} userToken - user token
 * @param {String} tenantId - tenantId
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const getOrgDetails = function (organisationIdentifier, userToken, tenantId) {
  return new Promise(async (resolve, reject) => {
    try {
      let url;
      if (!isNaN(organisationIdentifier)) {
        url =
          userServiceUrl + messageConstants.endpoints.ORGANIZATION_READ + '?organisation_id=' + organisationIdentifier;
      } else {
        url =
          userServiceUrl +
          messageConstants.endpoints.ORGANIZATION_READ +
          '?organisation_code=' +
          organisationIdentifier +
          '&tenant_code=' +
          tenantId;
      }
      const options = {
        headers: {
          // 'X-auth-token': 'bearer ' + userToken,
          internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
        },
      };
      request.get(url, options, userReadCallback);
      let result = {
        success: true,
      };
      function userReadCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = JSON.parse(data.body);
          if (response.responseCode === httpStatusCode['ok_userService'].message) {
            result['data'] = response.result;
          } else {
            result.success = false;
          }
        }

        return resolve(result);
      }
      setTimeout(function () {
        return resolve(
          (result = {
            success: false,
          })
        );
      }, messageConstants.common.SERVER_TIME_OUT);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Fetches the tenant details for a given tenant ID along with org it is associated with.
 * @param {string} tenantId - The code/id of the organization.
 * @param {Boolean} aggregateValidOrgs - boolean value to populate valid orgs from response
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const fetchTenantDetails = function (tenantId, aggregateValidOrgs = false) {
  return new Promise(async (resolve, reject) => {
    try {
      // Internal request
      let url = userServiceUrl + messageConstants.endpoints.TENANT_READ_INTERNAL + '/' + tenantId;
      headers = {
        'content-type': 'application/json',
        internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
      };

      const options = {
        headers: {
          'content-type': 'application/json',
          internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
        },
      };
      request.get(url, options, userReadCallback);
      let result = {
        success: true,
      };
      function userReadCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = JSON.parse(data.body);
          if (response.responseCode === httpStatusCode['ok_userService'].message) {
            if (aggregateValidOrgs == true) {
              if (response.result.organizations && response.result.organizations.length) {
                // convert the types of items to string
                let validOrgs = response.result.organizations.map((data) => {
                  return data.code.toString();
                });
                result['data'] = validOrgs;
              } else {
                result['data'] = [];
              }
            } else {
              result['data'] = response.result;
            }
          } else {
            result.success = false;
          }
        }

        return resolve(result);
      }
      setTimeout(function () {
        return resolve(
          (result = {
            success: false,
          })
        );
      }, messageConstants.common.SERVER_TIME_OUT);
    } catch (error) {
      return reject(error);
    }
  });
};


/**
 * Fetches the tenant details for a given tenant ID along with org it is associated with.
 * @param {String} tenantId - tenantId details
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const fetchPublicTenantDetails = function (tenantId) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = userServiceUrl + messageConstants.endpoints.PUBLIC_BRANDING;
      const options = {
        headers: {
          'content-type': 'application/json',
          'x-tenant-code': tenantId,
        },
      };
      request.get(url, options, publicBranding);
      let result = {
        success: true,
      };
      function publicBranding(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = JSON.parse(data.body);
          if (response.responseCode === httpStatusCode['ok_userService'].message) {
            result['data'] = response.result;
          } else {
            result.success = false;
          }
        }

        return resolve(result);
      }
      setTimeout(function () {
        return resolve(
          (result = {
            success: false,
          })
        );
      }, messageConstants.common.SERVER_TIME_OUT);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Fetches user profile by userId/username and tenantId.
 * @param {String} tenantId - tenantId details
 * @param {String} userId - userId details
 * @param {String} username - username details
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const getUserProfileByIdentifier = function (tenantId, userId = null, username) {
  return new Promise(async (resolve, reject) => {
    try {
      let params = userId ? `/${userId}?tenant_code=${tenantId}` : `?tenant_code=${tenantId}&username=${username}`;

      let url = `${userServiceUrl}${messageConstants.endpoints.PROFILE_READ_BY_ID}${params}`;
      const options = {
        headers: {
          'content-type': 'application/json',
          internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
        },
      };

      request.get(url, options, apiCallBackFunction);
      let result = {
        success: true,
      };
      function apiCallBackFunction(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = JSON.parse(data.body);

          if (response.responseCode === httpStatusCode['ok_userService'].message) {
            result['data'] = response.result;
          } else {
            result.success = false;
          }
        }

        return resolve(result);
      }
      setTimeout(function () {
        return resolve(
          (result = {
            success: false,
          })
        );
      }, messageConstants.common.SERVER_TIME_OUT);
    } catch (error) {
      return reject(error);
    }
  });
};



async function getTenantDetails(tenantId) {
  const cacheKey = `tenant_${tenantId}`
  const cached = tenantCache.get(cacheKey)
  if (cached) {
      return cached
  }
  return await refreshAndCache(cacheKey, tenantId)
}


async function refreshAndCache(cacheKey, tenantId) {
  const tenantDetails = await fetchPublicTenantDetails(tenantId)
  if (!tenantDetails.data || !tenantDetails.data.meta || !tenantDetails.success) {
      return { success: false, message: CONSTANTS.apiResponses.FAILED_TO_FETCH_TENANT_DETAILS }
  }
  tenantCache.set(cacheKey, tenantDetails, CACHE_TTL_SECONDS)
  return tenantDetails
}


function clearTenantCache(tenantId) {
  const cacheKey = `tenant_${tenantId}`
  const deleted = tenantCache.del(cacheKey)
  return {
      success: true,
      message: deleted ? `Cache cleared for tenant ${tenantId}` : `No cache found for tenant ${tenantId}`
  }
}
module.exports = {
  profile: profile,
  getOrgDetails,
  fetchTenantDetails,
  fetchPublicTenantDetails,
  getUserProfileByIdentifier,
  getTenantDetails,
  clearTenantCache

};
