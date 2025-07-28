/**
 * name : admin/helper.js
 * author : Ankit Shahu
 * created-date : 20-09-2023
 * Description : All admin related helper functions.
 */

//Dependencies

/**
 * adminHelper
 * @class
 */


const ConfigurationsHelper = require(MODULES_BASE_PATH+"/configurations/helper");
const userExtensionsQueries = require(DB_QUERY_BASE_PATH + '/userExtensions');
const programsQueries = require(DB_QUERY_BASE_PATH + '/programs');
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');
const surveyQueries = require(DB_QUERY_BASE_PATH + '/surveys');
const surveySubmissionQueries = require(DB_QUERY_BASE_PATH + '/surveySubmissions');
const projectService = require(ROOT_PATH + '/generics/services/project')
const deletionAuditQueries = require(DB_QUERY_BASE_PATH + '/deletionAuditLogs')
let kafkaClient = require(ROOT_PATH + '/generics/helpers/kafkaCommunications');
const observationQueries = require(DB_QUERY_BASE_PATH + '/observations');
const observationSubmissionsQueries = require(DB_QUERY_BASE_PATH + '/observationSubmissions');

module.exports = class adminHelper {
  /**
   * List of data based on collection.
   * @method
   * @name list
   * @param {Object} filterQueryObject - filter query data.
   * @param {Object} [projection = {}] - projected data.
   * @returns {Promise} returns a promise.
   */

  static list(
    collection,
    query = 'all',
    fields = 'all',
    skipFields = 'none',
    limitingValue = 100,
    skippingValue = 0,
    sortedData = '',
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = {};

        if (query != 'all') {
          queryObject = query;
        }

        let projectionObject = {};

        if (fields != 'all') {
          fields.forEach((element) => {
            projectionObject[element] = 1;
          });
        }

        if (skipFields != 'none') {
          skipFields.forEach((element) => {
            projectionObject[element] = 0;
          });
        }

        return resolve({
          collection: collection,
          queryObject: queryObject,
          projectionObject: projectionObject,
          limitingValue: limitingValue,
          skippingValue: skippingValue,
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: false,
        });
      }
    });
  }

  static convertStringToObjectIdInQuery(query, mongoIdKeys) {
    for (let pointerToArray = 0; pointerToArray < mongoIdKeys.length; pointerToArray++) {
      let eachKey = mongoIdKeys[pointerToArray];
      let currentQuery = query[eachKey];

      if (typeof currentQuery === 'string') {
        query[eachKey] = gen.utils.convertStringToObjectId(currentQuery);
      } else if (typeof currentQuery === 'object') {
        let nestedKey = Object.keys(query[eachKey]);
        if (nestedKey) {
          let convertedIds = [];
          nestedKey = nestedKey[0];
          query[eachKey][nestedKey] = gen.utils.arrayIdsTobjectIds(currentQuery[nestedKey]);
        }
      }
    }

    return query;
  }

  /**
   * creates indexes based on collection and keys
   * @method
   * @name list
   * @param {String} collection - name of the collection.
   * @param {Array} [keys] - keys in array to be indexed.
   * @returns {Object} returns a object.
   */
  static async createIndex(collection,keys){
    let presentIndex = await database.models[collection].listIndexes({}, { key: 1 });
    let indexes = presentIndex.map((indexedKeys) => {
      return Object.keys(indexedKeys.key)[0];
    });
    let indexNotPresent = _.differenceWith(keys, indexes);
    if (indexNotPresent.length > 0) {
      indexNotPresent.forEach(async (key) => {
        await database.models.solutions.db.collection(collection).createIndex({ [key]: 1 });
      });

      if (collection === messageConstants.common.SOLUTION_MODEL_NAME) {
        // Filter keys that start with "scope." and extract the part after "scope."
        const scopeKeys = keys
          .filter((key) => key.startsWith('scope.')) // Filter out keys that start with "scope."
          .map((key) => key.split('scope.')[1]) // Extract the part after "scope."
        if (scopeKeys.length > 0) {
           await ConfigurationsHelper.createOrUpdate('keysAllowedForTargeting', scopeKeys)
        }
      }

      return {
        message: messageConstants.apiResponses.KEYS_INDEXED_SUCCESSFULL,
        success: true,
      }

  }else{
    return {
      message: messageConstants.apiResponses.KEYS_ALREADY_INDEXED_SUCCESSFULL,
      success: true,
    }
  }

}


/**
 * Deletes a program or solution resource along with its associated dependencies.
 *
 * @param {String} resourceId - ID of the resource to delete.
 * @param {String} resourceType - Type of the resource ('program' or 'solution').
 * @param {String} tenantId - Tenant identifier for multitenancy.
 * @param {String} orgId - Organization ID performing the operation.
 * @param {String} [deletedBy='SYSTEM'] - User ID or system name that triggered the deletion.
 * @param {String} userToken - Auth token used for downstream service calls (e.g., survey service).
 *
 * @returns {Promise<Object>} - Result object summarizing deletion impact.
 */
static deleteResource(resourceId, resourceType, tenantId,orgId,deletedBy = 'SYSTEM'){
  return new Promise (async (resolve,reject)=>{
    try{

      let programDeletedCount = 0
      let solutionDeletedCount = 0
      let surveyCount = 0
      let surveySubmissionCount = 0
      let observationCount = 0
      let observationSubmissionCount = 0
      let pullSolutionFromProgramComponent = 0
      let deletedResourceIds = []
      const deleteAssociatedResources = async (solutionDoc) => {
        if (solutionDoc.type === messageConstants.common.SURVEY) {
          const surveyId = solutionDoc._id;
          if (!surveyId) return;
      
          const surveyFilter = {
            solutionId: surveyId,
            tenantId,
          };                    
          // Fetch and count before deleting
          const surveyDocs = await surveyQueries.surveyDocuments(surveyFilter, ['_id']); 
                   
          if (surveyDocs?.length > 0) {
            surveyCount += surveyDocs.length;            
            await surveyQueries.removeDocuments(surveyFilter);
          }
      
          const surveySubmissionDocs = await surveySubmissionQueries.surveySubmissionDocuments(surveyFilter, ['_id']);          
          if (surveySubmissionDocs?.length > 0) {
            surveySubmissionCount += surveySubmissionDocs.length;            
            await surveySubmissionQueries.removeDocuments(surveyFilter);
          }
        }
      
        if (solutionDoc.type === messageConstants.common.OBSERVATION) {
          const observationId = solutionDoc._id;
          if (!observationId) return;
      
          const observationFilter = {
            solutionId: observationId,
            tenantId,
          };          
          // Fetch and count before deleting
          const observationDocs = await observationQueries.observationDocuments(observationFilter, ['_id']);
          
          if (observationDocs?.length > 0) {
            observationCount += observationDocs.length;
            await observationQueries.removeDocuments(observationFilter);
          }
      
          const observationSubmissionDocs = await observationSubmissionsQueries.observationSubmissionsDocuments(observationFilter, ['_id']);          
          if (observationSubmissionDocs?.length > 0) {
            observationSubmissionCount += observationSubmissionDocs.length;
            await observationSubmissionsQueries.removeDocuments(observationFilter);
          }
        }
      };
      
      if (resourceType === messageConstants.common.PROGRAM_CHECK) {
        const filter = {
          _id: resourceId,
          tenantId: tenantId,
          isAPrivateProgram: false,
        }

        const programDoc = await programsQueries.programDocuments(filter, 'all')        
        if (!programDoc || !programDoc.length) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.PROGRAM_NOT_FOUND,
          }
        }

        const programComponents = programDoc[0].components
        if (!Array.isArray(programComponents) || programComponents.length === 0) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          }
        }
        deletedResourceIds.push(resourceId)
        for (const id of programComponents) {
          const solutionFilter = {
            _id: id,
            tenantId:tenantId,
          }
          
          const solutionDoc = await solutionsQueries.solutionDocuments(solutionFilter, [
          'type'
          ])
          
          if (!solutionDoc || !solutionDoc.length) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
            }
          }          
          await solutionsQueries.removeDocuments(solutionFilter)
          solutionDeletedCount++
          deletedResourceIds.push(id)
          await deleteAssociatedResources(solutionDoc[0])
        }

        await programsQueries.removeDocuments(filter)
        await this.pushResourceDeleteKafkaEvent(
          messageConstants.common.PROGRAM_CHECK,
          resourceId,
          deletedBy,
          tenantId,
          orgId
        )
        programDeletedCount++
        await this.logDeletion(deletedResourceIds, deletedBy)
        return resolve({
          success: true,
          message: messageConstants.apiResponses.PROGRAM_RESOURCE_DELETED,
          result: {
            programDeletedCount,
            solutionDeletedCount,
            surveyCount ,
            surveySubmissionCount,
            observationCount,
            observationSubmissionCount,
          },
        })
      } else if (resourceType === messageConstants.common.SOLUTION_CHECK) {
        const solutionFilter = {
          _id: resourceId,
          tenantId,
        }
        
        const solutionDoc = await solutionsQueries.solutionDocuments(solutionFilter, ['type','isExternalProgram','isReusable','programId'])
        if(!solutionDoc[0].isReusable && solutionDoc[0].isExternalProgram){
          let pullSolutionId = await projectService.pullSolutionIdFromProgram(resourceId);          
          if(pullSolutionId.result.success){
            pullSolutionFromProgramComponent++
          }
        }
        if (!solutionDoc || !solutionDoc.length) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          }
        }

        const solutionId = new ObjectId(resourceId)
        await programsQueries.pullSolutionsFromComponents(solutionId)

        await solutionsQueries.removeDocuments(solutionFilter)
        solutionDeletedCount++
        await this.pushResourceDeleteKafkaEvent('solution', resourceId, deletedBy, tenantId, orgId)
        deletedResourceIds.push(resourceId)
        await deleteAssociatedResources(solutionDoc[0])
        await this.logDeletion(deletedResourceIds, deletedBy)
        return resolve({
          success: true,
          message: messageConstants.apiResponses.SOLUTION_RESOURCE_DELETED,
          result: {
            programDeletedCount,
            solutionDeletedCount,
            surveyCount ,
            surveySubmissionCount,
            observationCount,
            observationSubmissionCount,
            pullSolutionFromProgramComponent
          },
        })
      } else {
        return resolve({
          success: false,
          message: messageConstants.apiResponses.INVALID_RESOURCE_TYPE,
          result: false,
        })
      }
    }catch(error){
      return resolve({
        success: false,
        message: error.message,
        data: false,
      });
    }
  })
}

/**
	 * Logs deletion entries for one or more entities into the `deletionAuditLogs` collection.
	 *
	 * @method
	 * @name logDeletion
	 * @param {Array<String|ObjectId>} entityIds - Array of entity IDs (as strings or ObjectIds) to log deletion for.
	 * @param {String|Number} deletedBy - User ID (or 'SYSTEM') who performed the deletion.
	 *
	 * @returns {Promise<Object>} - Returns success status or error information.
	 */
static logDeletion(resourceId, deletedBy) {
  return new Promise(async (resolve, reject) => {
    try {
      // Prepare log entries
      const logs = resourceId.map((id) => ({
        resourceId: new ObjectId(id),
        deletedBy: deletedBy || 'SYSTEM',
        deletedAt: new Date().toISOString(),
      }))
      // Insert logs into deletionAuditLogs collection
      await deletionAuditQueries.deletionAuditLogs(logs)
      return resolve({ success: true })
    } catch (error) {
      resolve({
        status: error.status || httpStatusCode.internal_server_error.status,
        success: false,
        message: error.message,
        data: {},
      })
    }
  })
}

/**
 * Pushes a Kafka event for resource deletion (program/solution).
 *
 * @param {string} resourceType - Type of the resource ('program' or 'solution').
 * @param {ObjectId|string} resourceId - ID of the deleted resource.
 * @param {string|number} deletedBy - User ID or 'SYSTEM'.
 * @param {string} tenantId - Tenant code.
 * @param {string|number|null} [organizationId=null] - Organization ID (optional).
 */
static async pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, organizationId = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const kafkaMessage = {
        entity: 'resource',
        type: resourceType,
        eventType: 'delete',
        entityId: resourceId.toString(),
        deleted_By: parseInt(deletedBy) || deletedBy,
        tenant_code: tenantId,
        organization_id: organizationId,
      }
      const pushMessageToKafka = await kafkaClient.pushResourceDeleteKafkaEvent(kafkaMessage);      
      return resolve()
    } catch (error) {
      console.error(`Kafka push failed for ${resourceType} ${resourceId}:`, error.message)
    }
  })
}
}