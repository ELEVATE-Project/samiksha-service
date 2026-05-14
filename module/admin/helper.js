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

const configurationsHelper = require(MODULES_BASE_PATH + '/configurations/helper');
const userExtensionsQueries = require(DB_QUERY_BASE_PATH + '/userExtensions');
const programsQueries = require(DB_QUERY_BASE_PATH + '/programs');
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');
const surveyQueries = require(DB_QUERY_BASE_PATH + '/surveys');
const surveySubmissionQueries = require(DB_QUERY_BASE_PATH + '/surveySubmissions');
const projectService = require(ROOT_PATH + '/generics/services/project');
const deletionAuditQueries = require(DB_QUERY_BASE_PATH + '/deletionAuditLogs');
let kafkaClient = require(ROOT_PATH + '/generics/helpers/kafkaCommunications');
const observationQueries = require(DB_QUERY_BASE_PATH + '/observations');
const observationSubmissionsQueries = require(DB_QUERY_BASE_PATH + '/observationSubmissions');
const cacheHelper = require(ROOT_PATH + '/generics/helpers/cache');

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
    sortedData = ''
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
  static async createIndex(collection, keys) {
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
          .map((key) => key.split('scope.')[1]); // Extract the part after "scope."
        if (scopeKeys.length > 0) {
          await configurationsHelper.createOrUpdate('keysAllowedForTargeting', scopeKeys);
        }
      }

      return {
        message: messageConstants.apiResponses.KEYS_INDEXED_SUCCESSFULL,
        success: true,
      };
    } else {
      return {
        message: messageConstants.apiResponses.KEYS_ALREADY_INDEXED_SUCCESSFULL,
        success: true,
      };
    }
  }

  /**
   * Deletes a program or solution resource along with its associated dependencies.
   * @method
   * @name deletedResourceDetails
   * @param {String} resourceId - ID of the resource to delete.
   * @param {String} resourceType - Type of the resource ('program' or 'solution').
   * @param {Boolean} isAPrivateProgram - If Program is Private `true` else `false`.
   * @param {String} tenantId - Tenant identifier for multitenancy.
   * @param {String} orgId - Organization ID performing the operation.
   * @param {String} [deletedBy='SYSTEM'] - User ID or system name that triggered the deletion.
   *
   * @returns {Promise<Object>} - Result object summarizing deletion impact with IDs and counts.
   */

  static deletedResourceDetails(
    resourceId,
    resourceType,
    isAPrivateProgram = false,
    tenantId,
    orgId,
    deletedBy = 'SYSTEM'
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        // Track IDs and counts for every deleted resource type
        let deletedPrograms = { deletedProgramsIds: [], deletedProgramsCount: 0 };
        let deletedSolutions = { deletedSolutionsIds: [], deletedSolutionsCount: 0 };
        let deletedSurveys = { deletedSurveysIds: [], deletedSurveysCount: 0 };
        let deletedSurveySubmissions = { deletedSurveySubmissionsIds: [], deletedSurveySubmissionsCount: 0 };
        let deletedObservations = { deletedObservationsIds: [], deletedObservationsCount: 0 };
        let deletedObservationSubmissions = {
          deletedObservationSubmissionsIds: [],
          deletedObservationSubmissionsCount: 0,
        };
        let pullSolutionFromProgramComponent = 0;
        let pullProgramFromUserExtensionCount = 0;

        let resourceIdsWithType = [];

        // ─── PROGRAM DELETION ──────────────────────────────────────────────────────
        if (resourceType === messageConstants.common.PROGRAM_CHECK) {
          let ProgramFilter;
          if (isAPrivateProgram) {
            ProgramFilter = {
              _id: resourceId,
              tenantId,
              isAPrivateProgram: true,
            };
          } else {
            ProgramFilter = {
              _id: resourceId,
              tenantId,
              isAPrivateProgram: false,
            };
          }          
          // Fetch program details to ensure it exists and has components
          const programDetails = await programsQueries.programDocuments(ProgramFilter, ['components']);
          if (!programDetails?.length) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.PROGRAM_NOT_FOUND,
            };
          }
          const programObjectId = typeof resourceId === 'string' ? new ObjectId(resourceId) : resourceId;
          const programRoleMappingResult = await userExtensionsQueries.pullProgramIdFromProgramRoleMapping(
            programObjectId,
            tenantId,
          );
          pullProgramFromUserExtensionCount = programRoleMappingResult.modifiedCount || 0;

          // Extract solution IDs from program components
          const solutionComponents = programDetails[0]?.components || [];
          const solutionIds = solutionComponents.map((comp) => (typeof comp === 'object' ? comp._id : comp));

          const solutionFilter = { _id: { $in: solutionIds }, tenantId };

          // Fetch solution documents — we need _id and type before deleting
          const solutionDetails = await solutionsQueries.solutionDocuments(solutionFilter, ['_id', 'type']);

          if (solutionIds && solutionIds.length) {
            for (const Id of solutionIds) {
              resourceIdsWithType.push({ id: Id, type: messageConstants.common.SOLUTION_CHECK });
            }
          }
          // Track deleted resource IDs
          resourceIdsWithType.push({ id: resourceId, type: messageConstants.common.PROGRAM_CHECK });

          // Delete solutions and count
          await solutionsQueries.delete(solutionFilter);
          deletedSolutions.deletedSolutionsIds = solutionDetails.map((s) => s._id.toString());
          deletedSolutions.deletedSolutionsCount = deletedSolutions.deletedSolutionsIds.length;

          // Delete associated surveys/observations and collect their IDs
          const associatedDeleteResult = await this.deleteAssociatedResources(solutionDetails, tenantId);
          deletedSurveys.deletedSurveysIds = associatedDeleteResult.deletedSurveys.deletedSurveysIds;
          deletedSurveys.deletedSurveysCount = associatedDeleteResult.deletedSurveys.deletedSurveysCount;
          deletedSurveySubmissions.deletedSurveySubmissionsIds =
            associatedDeleteResult.deletedSurveySubmissions.deletedSurveySubmissionsIds;
          deletedSurveySubmissions.deletedSurveySubmissionsCount =
            associatedDeleteResult.deletedSurveySubmissions.deletedSurveySubmissionsCount;
          deletedObservations.deletedObservationsIds =
            associatedDeleteResult.deletedObservations.deletedObservationsIds;
          deletedObservations.deletedObservationsCount =
            associatedDeleteResult.deletedObservations.deletedObservationsCount;
          deletedObservationSubmissions.deletedObservationSubmissionsIds =
            associatedDeleteResult.deletedObservationSubmissions.deletedObservationSubmissionsIds;
          deletedObservationSubmissions.deletedObservationSubmissionsCount =
            associatedDeleteResult.deletedObservationSubmissions.deletedObservationSubmissionsCount;

          // Finally delete the program
          await programsQueries.delete(ProgramFilter);
          deletedPrograms.deletedProgramsIds.push(resourceId.toString());
          deletedPrograms.deletedProgramsCount++;

          // Push deletion event to Kafka
          // {
          // 	"topic": "RESOURCE_DELETION_TOPIC",
          // 	"messages": "{\"entity\":\"resource\",\"type\":\"solution\",\"eventType\":\"delete\",\"entityId\":\"682c1526ba875600144d93bc\",\"deleted_By\":1,\"tenant_code\":\"shikshagraha\",\"organization_id\":[\"blr\"]}"
          //   }
          await this.pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, orgId);

          // Log deletion
          await this.addDeletionLog(resourceIdsWithType, deletedBy);

          return resolve({
            success: true,
            message: messageConstants.apiResponses.PROGRAM_RESOURCE_DELETED,
            result: {
              deletedPrograms,
              deletedSolutions,
              deletedSurveys,
              deletedSurveySubmissions,
              deletedObservations,
              deletedObservationSubmissions,
              pullProgramFromUserExtensionCount,
            },
          });
        } else if (resourceType === messageConstants.common.SOLUTION_CHECK) {
          // Handle deletion of a SOLUTION
          const solutionFilter = { _id: resourceId, tenantId };
          const solutionDetails = await solutionsQueries.solutionDocuments(solutionFilter, [
            '_id',
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
            const pullRes = await projectService.pullSolutionsFromProgramComponents(resourceId, tenantId);
            if (pullRes.result.success) pullSolutionFromProgramComponent++;
          }

          // Pull the solution from other components (soft link cleanup)
          const pullResult = await programsQueries.pullSolutionsFromComponents(new ObjectId(resourceId), tenantId);
          pullSolutionFromProgramComponent = pullResult.modifiedCount || 0;

          // Delete the solution
          await solutionsQueries.delete(solutionFilter);
          deletedSolutions.deletedSolutionsIds.push(resourceId.toString());
          deletedSolutions.deletedSolutionsCount++;

          resourceIdsWithType.push({ id: resourceId, type: messageConstants.common.SOLUTION_CHECK });
          // Delete associated resources
          const associatedDeleteResult = await this.deleteAssociatedResources([solutionData], tenantId);
          deletedSurveys.deletedSurveysIds = associatedDeleteResult.deletedSurveys.deletedSurveysIds;
          deletedSurveys.deletedSurveysCount = associatedDeleteResult.deletedSurveys.deletedSurveysCount;
          deletedSurveySubmissions.deletedSurveySubmissionsIds =
            associatedDeleteResult.deletedSurveySubmissions.deletedSurveySubmissionsIds;
          deletedSurveySubmissions.deletedSurveySubmissionsCount =
            associatedDeleteResult.deletedSurveySubmissions.deletedSurveySubmissionsCount;
          deletedObservations.deletedObservationsIds =
            associatedDeleteResult.deletedObservations.deletedObservationsIds;
          deletedObservations.deletedObservationsCount =
            associatedDeleteResult.deletedObservations.deletedObservationsCount;
          deletedObservationSubmissions.deletedObservationSubmissionsIds =
            associatedDeleteResult.deletedObservationSubmissions.deletedObservationSubmissionsIds;
          deletedObservationSubmissions.deletedObservationSubmissionsCount =
            associatedDeleteResult.deletedObservationSubmissions.deletedObservationSubmissionsCount;

          // Push Kafka deletion event
          // {
          // 	"topic": "RESOURCE_DELETION_TOPIC",
          // 	"messages": "{\"entity\":\"resource\",\"type\":\"solution\",\"eventType\":\"delete\",\"entityId\":\"682c1526ba875600144d93bc\",\"deleted_By\":1,\"tenant_code\":\"shikshagraha\",\"organization_id\":[\"blr\"]}"
          //   }
          await this.pushResourceDeleteKafkaEvent(resourceType, resourceId, deletedBy, tenantId, orgId);
          // Log deletion
          await this.addDeletionLog(resourceIdsWithType, deletedBy);

          return resolve({
            success: true,
            message: messageConstants.apiResponses.SOLUTION_RESOURCE_DELETED,
            result: {
              deletedSolutions,
              deletedSurveys,
              deletedSurveySubmissions,
              deletedObservations,
              deletedObservationSubmissions,
              pullSolutionFromProgramComponent,
            },
          });
        } else {
          return resolve({
            success: false,
            message: messageConstants.apiResponses.INVALID_RESOURCE_TYPE,
          });
        }
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          status: error.status,
          data: false,
        });
      }
    });
  }

  /**
   * Deletes associated survey and observation resources based on solution details and tenant ID.
   * Fetches IDs before deleting
   * @method
   * @name deleteAssociatedResources
   * @param {Array<{ _id: string, type: string }>} solutionDetails - Solution objects with `_id` and `type`.
   * @param {string} tenantId - Tenant identifier.
   * @returns {Promise<Object>} - Nested objects with IDs and counts for each resource type.
   */
  static deleteAssociatedResources(solutionDetails, tenantId) {
    return new Promise(async (resolve, reject) => {
      try {
        let deletedSurveys = { deletedSurveysIds: [], deletedSurveysCount: 0 };
        let deletedSurveySubmissions = { deletedSurveySubmissionsIds: [], deletedSurveySubmissionsCount: 0 };
        let deletedObservations = { deletedObservationsIds: [], deletedObservationsCount: 0 };
        let deletedObservationSubmissions = {
          deletedObservationSubmissionsIds: [],
          deletedObservationSubmissionsCount: 0,
        };

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
        if (surveyIds.length > 0) {
          const surveyFilter = { solutionId: { $in: surveyIds }, tenantId };

          // Fetch IDs before deleting — deleteMany does not return them
          const surveysToDelete = await surveyQueries.surveyDocuments(surveyFilter, ['_id']);
          if (surveysToDelete?.length) {
            deletedSurveys.deletedSurveysIds = surveysToDelete.map((s) => s._id.toString());
            await surveyQueries.delete(surveyFilter);
            deletedSurveys.deletedSurveysCount = deletedSurveys.deletedSurveysIds.length;
          }

          // Survey submissions share the same solutionId filter
          const surveySubmissionsToDelete = await surveySubmissionQueries.surveySubmissionDocuments(surveyFilter, ['_id']);
          if (surveySubmissionsToDelete?.length) {
            deletedSurveySubmissions.deletedSurveySubmissionsIds = surveySubmissionsToDelete.map((s) =>
              s._id.toString(),
            );
            await surveySubmissionQueries.delete(surveyFilter);
            deletedSurveySubmissions.deletedSurveySubmissionsCount =
              deletedSurveySubmissions.deletedSurveySubmissionsIds.length;
          }
        }

        // Delete observation documents and submissions
        if (observationIds.length > 0) {
          const observationFilter = { solutionId: { $in: observationIds }, tenantId };

          // Fetch IDs before deleting
          const observationsToDelete = await observationQueries.observationDocuments(observationFilter, ['_id']);
          if (observationsToDelete?.length) {
            deletedObservations.deletedObservationsIds = observationsToDelete.map((o) => o._id.toString());
            await observationQueries.delete(observationFilter);
            deletedObservations.deletedObservationsCount = deletedObservations.deletedObservationsIds.length;
          }

          // Observation submissions share the same solutionId filter
          const observationSubmissionsToDelete = await observationSubmissionsQueries.observationSubmissionsDocuments(observationFilter, ['_id']);
          if (observationSubmissionsToDelete?.length) {
            deletedObservationSubmissions.deletedObservationSubmissionsIds = observationSubmissionsToDelete.map((o) =>
              o._id.toString(),
            );
            await observationSubmissionsQueries.delete(observationFilter);
            deletedObservationSubmissions.deletedObservationSubmissionsCount =
              deletedObservationSubmissions.deletedObservationSubmissionsIds.length;
          }
        }

        return resolve({
          success: true,
          deletedSurveys,
          deletedSurveySubmissions,
          deletedObservations,
          deletedObservationSubmissions,
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
        }));
        await deletionAuditQueries.create(logs);
        return resolve({ success: true });
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

  /**
   * Deletes multiple solution resources and aggregates IDs and counts across all of them.
   * @method
   * @name deleteSolutionResource
   * @param {Object} bodyData - Contains solutionIds, tenantId, orgId, userId, isAPrivateProgram.
   * @param {string[]} bodyData.solutionIds - Array of solution IDs to delete.
   * @param {string} bodyData.tenantId - Tenant identifier.
   * @param {string} bodyData.orgId - Organization identifier.
   * @param {string} bodyData.userId - Identifier of the user who triggered deletion.
   * @param {boolean} bodyData.isAPrivateProgram - Whether the parent program is private.
   * @param {string} resourceType - Type of the resource (e.g., 'solution').
   * @returns {Promise<Object>} - Aggregated IDs and counts across all deleted solutions.
   */
  static deleteSolutionResource(bodyData, resourceType) {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize finalResult to collect aggregated counts across all solutions
        const finalResult = {
          deletedSolutions: { deletedSolutionsIds: [], deletedSolutionsCount: 0 },
          deletedSurveys: { deletedSurveysIds: [], deletedSurveysCount: 0 },
          deletedSurveySubmissions: { deletedSurveySubmissionsIds: [], deletedSurveySubmissionsCount: 0 },
          deletedObservations: { deletedObservationsIds: [], deletedObservationsCount: 0 },
          deletedObservationSubmissions: {
            deletedObservationSubmissionsIds: [],
            deletedObservationSubmissionsCount: 0,
          },
          pullSolutionFromProgramComponent: 0,
        };

        // Iterate over each solution ID and delete its associated resources
        for (const solutionId of bodyData.solutionIds) {
          // Call internal method to handle deletion for a single solution
          const deleteResponse = await this.deletedResourceDetails(
            solutionId,
            resourceType,
            bodyData.isAPrivateProgram = false,
            bodyData.tenantId,
            bodyData.orgId,
            bodyData.userId
          );

          // If the deletion was successful, accumulate the returned stats
          if (deleteResponse?.success) {
            const resourceData = deleteResponse.result || {};

            // Merge solution IDs and count
            finalResult.deletedSolutions.deletedSolutionsIds.push(...(resourceData.deletedSolutions?.deletedSolutionsIds || []));
            finalResult.deletedSolutions.deletedSolutionsCount += resourceData.deletedSolutions?.deletedSolutionsCount || 0;

            // Merge survey IDs and count
            finalResult.deletedSurveys.deletedSurveysIds.push(...(resourceData.deletedSurveys?.deletedSurveysIds || []));
            finalResult.deletedSurveys.deletedSurveysCount += resourceData.deletedSurveys?.deletedSurveysCount || 0;

            // Merge survey submission IDs and count
            finalResult.deletedSurveySubmissions.deletedSurveySubmissionsIds.push(
              ...(resourceData.deletedSurveySubmissions?.deletedSurveySubmissionsIds || []),
            );
            finalResult.deletedSurveySubmissions.deletedSurveySubmissionsCount +=
              resourceData.deletedSurveySubmissions?.deletedSurveySubmissionsCount || 0;

            // Merge observation IDs and count
            finalResult.deletedObservations.deletedObservationsIds.push(
              ...(resourceData.deletedObservations?.deletedObservationsIds || []),
            );
            finalResult.deletedObservations.deletedObservationsCount +=
              resourceData.deletedObservations?.deletedObservationsCount || 0;

            // Merge observation submission IDs and count
            finalResult.deletedObservationSubmissions.deletedObservationSubmissionsIds.push(
              ...(resourceData.deletedObservationSubmissions?.deletedObservationSubmissionsIds || []),
            );
            finalResult.deletedObservationSubmissions.deletedObservationSubmissionsCount +=
              resourceData.deletedObservationSubmissions?.deletedObservationSubmissionsCount || 0;

            finalResult.pullSolutionFromProgramComponent += resourceData.pullSolutionFromProgramComponent || 0;
          }
        }

        return resolve({
          success: true,
          message: messageConstants.apiResponses.SOLUTION_RESOURCE_DELETED,
          result: finalResult,
        });
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

   /**
   * clearTenantCache  based on tenantId 
   * @method
   * @name clearTenantCache
   * @param {String} tenantId - tenant id
   * @returns {Object} returns a object.
   */clearTenantCache
   static async clearTenantCache(tenantId) {
     
    try{

      let removeTenantCache = await cacheHelper.clearCache(`tenant_${tenantId}`);
      if(removeTenantCache.success){
        return {
          message: removeTenantCache.message,
          success: true,
        };
      }  
      return {
        message: removeTenantCache.message,
        success: false,
      }
     
    }catch(error){
      return {
        message: error.message,
        success: false,
      };
    }
  }
};
