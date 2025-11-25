/**
 * name : project.js
 * author : Mallanagouda R Biradar
 * Date : 11-Apr-2025
 * Description : Projcet service related information.
 */

const request = require('request');
const projectServiceUrl = process.env.IMPROVEMENT_PROJECT_BASE_URL;

/**
 * Fetches the project template(s) based on the given externalId(s).
 *
 * @param {string} userToken - The user's authentication token.
 * @param {string[]|string} externalId - One or more external IDs of the project templates to fetch.
 * @returns {Promise<Object>} A promise that resolves to an object indicating success and containing the fetched data if successful.
 */

// Function to fetch the project template based on the given externalId
const templateLists = function (externalId,userDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.PROJECT_LIST_BY_ID}`;

      // Set the options for the HTTP GET request
      const options = {
        headers: {
          'content-type': 'application/json',
          'X-auth-token': userDetails.userToken,
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: {
          externalIds: externalId,
        },
      };
       //add  tenant and orgId in the header if role issuper admin
       if (userDetails?.roles && userDetails.roles.includes(messageConstants.common.ADMIN)) {
        _.assign(options.headers, {
          'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
          tenantId: userDetails.tenantAndOrgInfo.tenantId,
          orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
        });
      }
      request.post(url, options, projectServiceCallback);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function projectServiceCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;
          if (response.status === httpStatusCode['ok'].status) {
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
 * Fetches the program Details based on the given Id.
 * @param {string} userToken - The user's authentication token.
 * @param {string[]|string} programId - ProgramId
 * @param {Object} userDetails -userInfo
 * @param {Object} payload - tenant and org info on reqbody
 * @returns {Promise<Object>} A promise that resolves to an object indicating success and containing the fetched data if successful.
 */

const programDetails = function (userToken, programId, userDetails, payload = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      let url;
      // Construct the URL for the project service
      if ((userDetails && userDetails?.roles?.includes(messageConstants.common.ADMIN)) || !userToken) {
        url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.EXTERNAL_PROGRAM_READ}/${programId}`;
      } else {
        url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.EXTERNAL_PROGRAM_DETAILS}/${programId}`;
      }
      // Set the options for the HTTP GET request
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: { tenantData: payload },
      };

      if (userToken) {
        _.assign(options.headers, {
          'X-auth-token': userToken,
        });
      }
      //add  tenant and orgId in the header if role issuper admin
      if (userDetails?.roles && userDetails.roles.includes(messageConstants.common.ADMIN)) {
        _.assign(options.headers, {
          'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
          tenantId: userDetails.tenantAndOrgInfo.tenantId,
          orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
        });
      }
      request.get(url, options, projectServiceCallback);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function projectServiceCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;
          if (typeof response === messageConstants.common.OBJECT) {
            result = response;
          } else {
            result = JSON.parse(response);
          }
          if (result.status === httpStatusCode['ok'].status) {
            return resolve(result);
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
 * update the program  based on the given Id.
 * This functionality helps add survey and observation solutions to the components array of a program
 * This function will be called when creating child solution for survey and observation
 * @param {string} userToken - The user's authentication token.
 * @param {string[]|string} programId - ProgramId
 * @param {object} reqBody - update query
 * @returns {Promise<Object>} update success message
 */
const programUpdate = function (userToken, programId, reqBody, tenantData, userDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.EXTERNAL_PROGRAM_UPDATE}/${programId}`;
      // Set the options for the HTTP GET request
      const options = {
        headers: {
          'content-type': 'application/json',
          'X-auth-token': userToken,
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: reqBody,
      };
      //add super admin details if role is not has orgadmin
      if (userDetails?.roles && !userDetails.roles.includes(messageConstants.common.ORG_ADMIN)) {
        _.assign(options.headers, {
          'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
          tenantId: tenantData.tenantId,
          orgId: tenantData.orgId.join(','),
        });
      }
      request.post(url, options, projectServiceCallback);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function projectServiceCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;

          if (response.status === httpStatusCode['ok'].status) {
            return resolve(result);
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
 * pushSubmissionToTask on based on given project and taskId.
 * Updates the status of a survey or observation task in the project service based on the given project and task ID.
 * It will be called when start and complete the observation/survey
 * @param {string} projectId - projectId
 * @param {string} taskId     - taskId
 * @param {object} reqBody    - task Submission to update
 * @returns {Promise<Object>} update success message
 */
const pushSubmissionToTask = function (projectId, taskId, reqBody) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.PUSH_SUBMISSION_TO_TASK}/${projectId}?taskId=${taskId}`;

      // Set the options for the HTTP GET request
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: reqBody,
      };
      request.post(url, options, projectServiceCallback);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function projectServiceCallback(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;

          if (response.status === httpStatusCode['ok'].status) {
            return resolve(result);
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
 * @function pullSolutionsFromProgramComponents
 * @description Sends a POST request to the project service to remove the given solutionId
 *              from all program components that reference it.
 *
 * @param {String} solutionId - The ID of the solution to be pulled (removed) from programs.
 * @returns {Promise<Object>} - Resolves with success status and message from the project service.
 */
const pullSolutionsFromProgramComponents = function (solutionId,tenantId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.PULL_SOLUTION_ID_FROM_PROGRAM}/${solutionId}?tenantId=${tenantId}`;

      // Set the options for the HTTP GET request
      let options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,		
				},
			}	      
      request.post(url, options, pullSolutionFromProgram);
      let result = {
        success: true,
      };      
      // Handle callback fucntion
      function pullSolutionFromProgram(err, data) {
        if (err) {          
          result.success = false;
        } else {
          let response = data.body;  
          result = JSON.parse(response);                            
          if (result.status === httpStatusCode['ok'].status) {
            return resolve(result);
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
 * @function createChildProjectTemplate
 * @description Creates a child project template by calling the Project Service API.
 *              Sends the project template external IDs, user details, and program info.
 *
 * @param {Array<string>} projectTemplateExternalIds - List of project template external IDs.
 * @param {Object} userDetails - Information about the user making the request.
 * @param {string} programId - External ID of the program.
 * @param {boolean} isExternalProgram - Whether the program is external (true/false).
 * @param {string} entityType - The type of entity (e.g., "state" or "school").
 * @returns {Promise<Object>} Resolves with the API response if successful,
 *                            or with `{ success: false }` in case of errors or timeouts.
 */
const createChildProjectTemplate = function (projectTemplateExternalIds,userDetails,programId,isExternalProgram,entityType) {
  return new Promise(async (resolve, reject) => {
    try {

      // isExternalProgram - We have to negate this boolean before sending to project service . 
      //                     if isExternalProgram true for samiksha service, for project service it is false

      // Ensure isExternalProgram is always false if passed as true
      let IsExternalProgramFalse = !isExternalProgram;
      
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.CREATE_CHILD_PROJECT_TEMPLATE}?programExternalId=${programId}&isExternalProgram=${IsExternalProgramFalse}&entityType=${entityType}`;

      // Setup request options (headers + body)
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: {
          projectTemplateExternalIds:projectTemplateExternalIds,
          userDetails:userDetails
        },
      };

      // If user has a token, add it to headers
      if (userDetails.userToken) {
        _.assign(options.headers, {
          'X-auth-token': userDetails.userToken,
        });
      }
      //add  tenant and orgId in the header if role issuper admin
      if (userDetails?.roles && userDetails.roles.includes(messageConstants.common.ADMIN)) {
        _.assign(options.headers, {
          'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
          tenantId: userDetails.tenantAndOrgInfo.tenantId,
          orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
        });
      }
      
      // Make POST request to Project Service
      request.post(url, options, createProjectTemplate);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function createProjectTemplate(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;          
          if (response.status === httpStatusCode['ok'].status) {
            return resolve(response);
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
      }, 100000);   // limiting the timeout because lot of resource creation is happening internally, will be optimised later
    } catch (error) {
      return reject(error);
    }
  });
};


/**
 * @function createProgram
 * @description
 * Creates a new program by making a POST request to the Project Service.
 *
 * @param {Object} bodyData - The payload to be sent in the POST request body.
 * @param {Object} userDetails - Information about the user performing the action.
 * @returns {Promise<Object>} Promise that resolves with:
 * - `{ success: true, result: <programData> }` on success
 * - `{ success: false }` on failure
 */
const createProgram = function (bodyData, userDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.CREATE_PROGRAM}`;
      // Setup request options (headers + body)
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: bodyData,
      };
      // If user has a token, add it to headers
      if (userDetails.userToken) {
        _.assign(options.headers, {
          'X-auth-token': userDetails.userToken,
        });
      }
      //add  tenant and orgId in the header if role issuper admin
      if (userDetails?.roles && userDetails.roles.includes(messageConstants.common.ADMIN)) {
        _.assign(options.headers, {
          'admin-auth-token': process.env.ADMIN_AUTH_TOKEN,
          tenantId: userDetails.tenantAndOrgInfo.tenantId,
          orgId: userDetails.tenantAndOrgInfo.orgId.join(','),
        });
      }

      // Make POST request to Project Service
      request.post(url, options, createProgram);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function createProgram(err, data) {
        if (err) {
          result.success = false;
        } else {
          let response = data.body;
          if (response.status === httpStatusCode['ok'].status) {
            return resolve(response.result);
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
 * @function ProgramUpdateForLibrary
 * @description Updates a program record in the library via the Project Service.
 * @param {string} userToken - The authentication token of the user making the request.
 * @param {string} programId - The unique identifier of the program to be updated.
 * @param {object} reqBody - The request payload containing program update data.
 * @returns {Promise<object>} - Resolves with `{ success: true | false }` based on update status.
 */
const ProgramUpdateForLibrary = function (userToken, programId, reqBody) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the project service
      let url = `${projectServiceUrl}${process.env.PROJECT_SERVICE_NAME}${messageConstants.endpoints.LIBRARY_PROGRAM_UPDATE}/${programId}`;
      // Set the options for the HTTP GET request
      const options = {
        headers: {
          'content-type': 'application/json',
          'X-auth-token': userToken,
        },
        json: reqBody,
      };
      request.post(url, options, projectServiceCallback);
      let result = {
        success: true,
      };
      // Handle callback fucntion
      function projectServiceCallback(err, data) {
        if (err) {          
          result.success = false;
        } else {
          let response = data.body;          
          if (response.status === httpStatusCode['ok'].status) {
            return resolve(result);
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

module.exports = {
  templateLists: templateLists,
  programDetails: programDetails,
  programUpdate: programUpdate,
  pushSubmissionToTask: pushSubmissionToTask,
  pullSolutionsFromProgramComponents:pullSolutionsFromProgramComponents,
  createChildProjectTemplate:createChildProjectTemplate,
  createProgram: createProgram,
  ProgramUpdateForLibrary:ProgramUpdateForLibrary
};
