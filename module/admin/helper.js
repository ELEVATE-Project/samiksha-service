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

  static deletedResourceDetails(resourceId, resourceType, tenantId, orgId, deletedBy = 'SYSTEM', userToken) {
    return new Promise(async (resolve, rejects) => {
      try {
        // Track counters for deleted resource
        let programDeletedCount = 0;
        let solutionDeletedCount = 0;
        let surveyCount = 0;
        let surveySubmissionCount = 0;
        let observationCount = 0;
        let observationSubmissionCount = 0;
        let pullSolutionFromProgramComponent = 0;
        let pullProgramFromUserExtensionCount =0;

        let resourceIdsWithType = []
        // Handle deletion of a PROGRAM
        if (resourceType === messageConstants.common.PROGRAM_CHECK) {
          const filter = {
            _id: resourceId,
            tenantId,
            isAPrivateProgram: false,
          };

          // Fetch program details to ensure it exists and has components
          const programDetails = await programsQueries.programDocuments(filter, ['components']);
          if (!programDetails?.length) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.PROGRAM_NOT_FOUND,
            };
          }
          const programObjectId = typeof resourceId === 'string' ? new ObjectId(resourceId) : resourceId
					let programRoleMappingId = await userExtensionsQueries.pullProgramIdFromTheProgramRoleMapping(
						programObjectId
					)

					if (programRoleMappingId.modifiedCount > 0) {
						pullProgramFromUserExtensionCount = programRoleMappingId.modifiedCount
					}

          // Extract solution IDs from components
          const solutionComponents = programDetails[0].components;
          if (!Array.isArray(solutionComponents) || solutionComponents.length === 0) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
            };
          }

          const solutionIds = solutionComponents.map((comp) => (typeof comp === 'object' ? comp._id : comp));
          const solutionFilter = { _id: { $in: solutionIds }, tenantId };
          // Fetch solution documents for deletion
          const solutionDetails = await solutionsQueries.solutionDocuments(solutionFilter, ['_id', 'type']);

          if (!solutionDetails?.length) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
            };
          }

          if (solutionIds && solutionIds.length) {
            for (const Id of solutionIds) {
              resourceIdsWithType.push({ id: Id, type: messageConstants.common.SOLUTION_CHECK })
            }
          }
          // Track deleted resource IDs
          resourceIdsWithType.push({ id: resourceId, type: messageConstants.common.PROGRAM_CHECK })

          // Delete solutions and count
          await solutionsQueries.deleteSolutions(solutionFilter);
          solutionDeletedCount += solutionDetails.length;

          // Delete associated resources (survey, observation) related to solutions
          const associatedDeleteResult = await this.deleteAssociatedResources(
            solutionDetails,
            tenantId
          );
          surveyCount = associatedDeleteResult.surveyCount;
          surveySubmissionCount = associatedDeleteResult.surveySubmissionCount;
          observationCount = associatedDeleteResult.observationCount;
          observationSubmissionCount = associatedDeleteResult.observationSubmissionCount;

          // Finally delete the program
          await programsQueries.deletePrograms(filter);
          // Push deletion event to Kafka
          await this.pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, orgId);
          programDeletedCount++;

          // Log deletion
          await this.addDeletionLog(resourceIdsWithType, deletedBy, resourceType);

          return resolve({
            success: true,
            message: messageConstants.apiResponses.PROGRAM_RESOURCE_DELETED,
            result: {
              programDeletedCount,
              solutionDeletedCount,
              surveyCount,
              surveySubmissionCount,
              observationCount,
              observationSubmissionCount,
              pullProgramFromUserExtensionCount
            },
          });
        } else if (resourceType === messageConstants.common.SOLUTION_CHECK) {
          // Handle deletion of a SOLUTION
          const solutionFilter = { _id: resourceId, tenantId };
          const solutionDetails = await solutionsQueries.solutionDocuments(solutionFilter, [
            'type',
            'isExternalProgram',
            'isReusable',
          ]);

          if (!solutionDetails?.length) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
            };
          }

          const solutionData = solutionDetails[0];
          // Remove solution from components if not reusable and is external
          if (!solutionData.isReusable && solutionData.isExternalProgram) {
            const pullRes = await projectService.pullSolutionsFromProgramComponents(resourceId);
            if (pullRes.result.success) pullSolutionFromProgramComponent++;
          }

          // Pull the solution from other components (soft link cleanup)
          await programsQueries.pullSolutionsFromComponents(new ObjectId(resourceId));
          // Delete the solution
          await solutionsQueries.deleteSolutions(solutionFilter);
          solutionDeletedCount++;
          resourceIdsWithType.push({ id: resourceId, type: messageConstants.common.SOLUTION_CHECK })
          // Delete associated resources
          const associatedDeleteResult = await this.deleteAssociatedResources([solutionData], tenantId);

          surveyCount = associatedDeleteResult.surveyCount;
          surveySubmissionCount = associatedDeleteResult.surveySubmissionCount;
          observationCount = associatedDeleteResult.observationCount;
          observationSubmissionCount = associatedDeleteResult.observationSubmissionCount;

          // Push Kafka deletion event
          await this.pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, orgId);
          // Log deletion
          await this.addDeletionLog(resourceIdsWithType, deletedBy, resourceType);

          return resolve({
            success: true,
            message: messageConstants.apiResponses.SOLUTION_RESOURCE_DELETED,
            result: {
              solutionDeletedCount,
              surveyCount,
              surveySubmissionCount,
              observationCount,
              observationSubmissionCount,
              pullSolutionFromProgramComponent,
            },
          });
        } else {
          return {
            success: false,
            message: messageConstants.apiResponses.INVALID_RESOURCE_TYPE,
          };
        }
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: false,
        });
      }
    });
  }

  static deleteAssociatedResources(solutionDetails, tenantId) {
    return new Promise(async (resolve, rejects) => {
      try {
        let surveyCount = 0;
        let surveySubmissionCount = 0;
        let observationCount = 0;
        let observationSubmissionCount = 0;

        const surveyIds = [];
        const observationIds = [];
        // Categorize solution types into survey/observation
        for (const solutionType of solutionDetails) {
          if (solutionType.type === messageConstants.common.SURVEY) {
            surveyIds.push(solutionType._id);
          } else if (solutionType.type === messageConstants.common.OBSERVATION) {
            observationIds.push(solutionType._id);
          }
        }
        // Delete survey documents and submissions
        if (surveyIds.length) {
          const surveyFilter = { solutionId: { $in: surveyIds }, tenantId };
          const surveyDetails = await surveyQueries.surveyDocuments(surveyFilter, ['_id']);

          if (surveyDetails?.length) {
            surveyCount = surveyDetails.length;
            await surveyQueries.deleteSurveys(surveyFilter);
          }

          const surveySubmissionDetails = await surveySubmissionQueries.surveySubmissionDocuments(surveyFilter, [
            '_id',
          ]);

          if (surveySubmissionDetails?.length) {
            surveySubmissionCount = surveySubmissionDetails.length;
            await surveySubmissionQueries.deleteSurveySubmissions(surveyFilter);
          }
        }

        // Delete observation documents and submissions
        if (observationIds.length) {
          const observationFilter = { solutionId: { $in: observationIds }, tenantId };
          const observationDetails = await observationQueries.observationDocuments(observationFilter, ['_id']);

          if (observationDetails?.length) {
            observationCount = observationDetails.length;
            await observationQueries.deleteObservations(observationFilter);
          }

          const observationSubmissionsDetails = await observationSubmissionsQueries.observationSubmissionsDocuments(
            observationFilter,
            ['_id']
          );

          if (observationSubmissionsDetails?.length) {
            observationSubmissionCount = observationSubmissionsDetails.length;
            await observationSubmissionsQueries.deleteObservationSubmissions(observationFilter);
          }
        }

        return resolve({
          success: true,
          surveyCount,
          surveySubmissionCount,
          observationCount,
          observationSubmissionCount,
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

  /**
   * Logs deletion entries for one or more entities into the `deletionAuditLogs` collection.
   *
   * @method
   * @name addDeletionLog
   * @param {Array<String|ObjectId>} entityIds - Array of entity IDs (as strings or ObjectIds) to log deletion for.
   * @param {String|Number} deletedBy - User ID (or 'SYSTEM') who performed the deletion.
   *
   * @returns {Promise<Object>} - Returns success status or error information.
   */
  static addDeletionLog(resourceIdsWithType = [], userId = 'SYSTEM') {
		return new Promise(async (resolve, reject) => {
			try {
				const logs = resourceIdsWithType.map(({ id, type }) => ({
					resourceId: typeof id === 'string' ? new ObjectId(id) : id,
					resourceType: type,
					deletedBy: userId,
					deletedAt: new Date().toISOString(),
				}))
				await deletionAuditQueries.createDeletionLog(logs)
				return resolve({ success: true })
			} catch (error) {
				return resolve({
          success: false,
          message: error.message,
          data: false,
        });
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
  static pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, organizationId = null) {
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
        };
        await kafkaClient.pushResourceDeleteKafkaEvent(kafkaMessage);
        return resolve();
      } catch (error) {
        console.error(`Kafka push failed for ${resourceType} ${resourceId}:`, error.message);
      }
    });
  }
}