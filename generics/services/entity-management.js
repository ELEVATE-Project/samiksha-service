/**
 * name : entity-management.js
 * author : Praveen
 * Date : 13-Jun-2024
 * Description : Entity service related information.
 */

//dependencies
const request = require('request');

const entityManagementServiceUrl = process.env.ENTITY_MANAGEMENT_SERVICE_URL;
const validateEntity = process.env.VALIDATE_ENTITIES;
/**
 * List of entity data.
 * @function
 * @name entityDocuments
 * @param {Object} filterData - Filter data.
 * @param {Array} projection - Projected data.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The maximum number of results per page.
 * @returns {JSON} - List of entity data.
 */

// Function to find entity documents based on the given filter and projection
const entityDocuments = function (filterData = 'all', projection = 'all',page = null,limit = null) {
  return new Promise(async (resolve, reject) => {
    try {
      // Function to find entity documents based on the given filter and projection
      const url = entityManagementServiceUrl+ messageConstants.endpoints.FIND_ENTITY_DOCUMENTS;
      let requestJSON = {
        query: filterData,
        projection: projection,
      }
     // Include pagination if pageNumber and pageLimit are explicitly provided
      if (page !== null && limit !== null) {
        requestJSON.query.page = page;
        requestJSON.query.limit = limit;
      }

      // Set the options for the HTTP POST request
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: requestJSON
      };

      // Make the HTTP POST request to the entity management service
      request.post(url, options, requestCallBack);

      // Callback functioCopy as Expressionn to handle the response from the HTTP POST request
      function requestCallBack(err, data) {
		
        let result = {
          success: true,
        };

        if (err) {
          result.success = false;
        } else {
          let response = data.body;
          // Check if the response status is OK (HTTP 200)
          if (response.status === httpStatusCode['ok'].status) {
            result['data'] = response.result;
          } else {
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
 * List of entityType data.
 * @function
 * @name entityTypeDocuments
 * @param {Object} filterData - Filter data.
 * @param {Array} projection - Projected data.
 * @returns {JSON} - List of entity data.
 */

// Function to find entity type documents based on the given filter, projection
const entityTypeDocuments = function (filterData = 'all', projection = 'all', ) {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL for the entity management service
      const url = entityManagementServiceUrl + messageConstants.endpoints.FIND_ENTITY_TYPE_DOCUMENTS;
      // Set the options for the HTTP POST request
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: {
          query: filterData,
          projection: projection,
        },
      };

      // Make the HTTP POST request to the entity management service
      request.post(url, options, requestCallBack);

      // Callback function to handle the response from the HTTP POST request
      function requestCallBack(err, data) {
        let result = {
          success: true,
        };

        if (err) {
          result.success = false;
        } else {
          let response = data.body;
          // Check if the response status is OK (HTTP 200)
          if (response.status === httpStatusCode['ok'].status) {
            result['data'] = response.result;
          } else {
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
 * Validates entities based on provided entity IDs and entity type ID.
 * @param {string[]} entityIds - An array of entity IDs to validate.
 * @param {string} entityTypeId - The ID of the entity type to check against.
 * @returns {Promise<{entityIds: string[]}>} A promise that resolves to an object containing validated entity IDs.
 * @throws {Error} If there's an error during validation.
 */
const validateEntities = async function (entityIds, entityTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        let ids = [];
        let isObjectIdArray = entityIds.every(gen.utils.isValidMongoId);

      if(validateEntity == 'ON' && entityIds.length >0){
        let bodyData = {
          _id : isObjectIdArray ? {$in: gen.utils.arrayIdsTobjectIdsNew(entityIds)} : { $in: entityIds },
          entityTypeId: entityTypeId,
          };
       
          let entitiesDocumentsAPIData = await this.entityDocuments(bodyData);
          let entitiesDocuments = entitiesDocumentsAPIData.data;
            if (entitiesDocuments.length > 0) {
              ids = entitiesDocuments.map((entityId) => entityId._id);
            }
    
            return resolve({
              entityIds: ids,
            });
      }else {
            return resolve({
             entityIds: entityIds,
            });

      }

      } catch (error) {
        return reject(error);
      }
    });
  }
/**
 * Lists entities by entity type with pagination.
 * @param {string} entityTypeId - The ID of the entity type to list.
 * @param {string} userToken - The authentication token of the user making the request.
 * @param {number} pageSize - The number of items per page.
 * @param {number} pageNo - The page number to retrieve.
 * @returns {Promise<{success: boolean, data?: any}>} A promise that resolves to an object containing the success status and, if successful, the retrieved data.
 * @throws {Error} If there's an error during the request.
 */
const listByEntityType = async function (entityTypeId,userToken,pageSize,pageNo) {
    return new Promise(async (resolve, reject) => {
      try {
        // Function to find entity documents based on the given filter and projection
        const url = entityManagementServiceUrl + messageConstants.endpoints.LIST_BY_ENTITY_TYPE+'/'+entityTypeId + `?page=${pageNo}&limit=${pageSize}`;
        // Set the options for the HTTP POST request
        const options = {
          headers: {
            'content-type': 'application/json',
            'x-auth-token':userToken
          },
          json: {
            type:entityTypeId
          },
        };
      
        // Make the HTTP POST request to the entity management service
        request.post(url, options, requestCallBack);
  
        // Callback functioCopy as Expressionn to handle the response from the HTTP POST request
        function requestCallBack(err, data) {
      
          let result = {
            success: true,
          };
  
          if (err) {
            result.success = false;
          } else {
            let response = data.body;
            // Check if the response status is OK (HTTP 200)
            if (response.status === httpStatusCode['ok'].status) {
              result['data'] = response.result;
            } else {
              result.success = false;
            }
          }
  
          return resolve(result);
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

/**
 * List of user role extension data.
 * @function
 * @name userRoleExtension
 * @param {Object} filterData - Filter data.
 * @param {Array} projection - Projected data.
 * @param {String} authToken - Authentication token.
 * @returns {JSON} - List of user role extension data.
 */

// Function to find user role extension documents based on the given filter and projection
const userRoleExtension = function (filterData = 'all', projection = 'all') {
  
  return new Promise(async (resolve, reject) => {
    try {
      // Define the URL for the user role extension API
      const url = entityManagementServiceUrl+messageConstants.endpoints.USER_ROLE_EXTENSION;

      // Set the options for the HTTP POST request
      const options = {
        headers: {
          'content-type': 'application/json',
          'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
        },
        json: {
          query: filterData,
          projection: projection,
        },
      };

      // Make the HTTP POST request to the user role extension API
      request.post(url, options, requestCallBack);

      // Callback function to handle the response from the HTTP POST request
      function requestCallBack(err, data) {
        let result = {
          success: true,
        };

        if (err) {
          result.success = false;
        } else {

          let response = data.body;

          
          // Check if the response status is OK (HTTP 200)
          if (response.status === httpStatusCode['ok'].status) {
            result['data'] = response.result;
          } else {
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
 * get subEntities of matching type by recursion.
 * @method
 * @name getSubEntitiesBasedOnEntityType
 * @param {Array} entityIds - Array of entity Ids - parent entities.
 * @param {String} entityType - Entity type.
 * @param {Array} result - subentities of type {entityType} of {entityIds}
 * @returns {Array} - Sub entities matching the type.
 */

async function getSubEntitiesBasedOnEntityType(parentIds, entityType, result) {
  if (!parentIds.length > 0) {
    return result;
  }
  let bodyData = {
    parentId: parentIds,
  };

  let entityDetails = await entityDocuments(bodyData);
  if (!entityDetails.success) {
    return result;
  }

  let entityData = entityDetails.data;
  let parentEntities = [];
  entityData.map((entity) => {
    if (entity.type == entityType) {
      result.push(entity.id);
    } else {
      parentEntities.push(entity.id);
    }
  });

  if (parentEntities.length > 0) {
    await getSubEntitiesBasedOnEntityType(parentEntities, entityType, result);
  }

  let uniqueEntities = _.uniq(result);
  return uniqueEntities;
}

module.exports = {
  entityDocuments: entityDocuments,
  entityTypeDocuments: entityTypeDocuments,
  validateEntities:validateEntities,
  listByEntityType:listByEntityType,
  userRoleExtension:userRoleExtension,
  getSubEntitiesBasedOnEntityType:getSubEntitiesBasedOnEntityType
};