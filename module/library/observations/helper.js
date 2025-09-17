/**
 * name : helper.js
 * author : Aman
 * created-date : 04-Jun-2020
 * Description : Observation solutions helper functionality.
 */

// Dependencies
const solutionsHelper = require(MODULES_BASE_PATH + '/solutions/helper');
const assessmentsHelper = require(MODULES_BASE_PATH + '/assessments/helper');
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');

/**
 * ObservationHelper
 * @class
 */
module.exports = class ObservationHelper {
  /**
   * List of library solution
   * @method
   * @name list
   * @param {String} search - Search Data.
   * @param {Number} limit - limitting value.
   * @param {Number} pageNo
   * @param {String} userId - Logged in user id.
   * @param {String} token - User token.
   * @param {String} categoryId - Category Id.
   * @param {Object} userDetails - User details.
   * @returns {Object} returns list of observation solutions
   */

  static list(search, limit, pageNo, userId, token,categoryId ="",userDetails) {
    return new Promise(async (resolve, reject) => {
      try {
        let observationSolution = await solutionsHelper.templates(
          messageConstants.common.OBSERVATION,
          search,
          limit,
          pageNo,
          userId,
          token,
          categoryId,
          userDetails
        );

        return resolve({
          message: messageConstants.apiResponses.OBSERVATION_SOLUTIONS_LIST,
          result: observationSolution,
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
   * Observation solution details information
   * @method
   * @name details
   * @param {String} templateId - Template id.
   * @returns {Object} returns creator,about and questions of observation solutions.
   */

  static details(templateId) {
    return new Promise(async (resolve, reject) => {
      try {
        let observationSolutionDetails = await assessmentsHelper.templateDetails(templateId, false, false);

        return resolve({
          message: messageConstants.apiResponses.OBSERVATION_SOLUTION_DETAILS,
          result: observationSolutionDetails,
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
   * create child solution 
   * @method
   * @name import
   * @param {String} parentSolutionId - parentSolution id.
   * @param {Object} reqBody - request body.
   * @param {Object} userDetails - User details.
   * @returns {Object} returns creator,about and questions of observation solutions.
   */

  static import(parentSolutionId, reqBody, userDetails) {
    return new Promise(async (resolve, reject) => {
      try {
        let tenantId = userDetails.tenantData.tenantId;
        let orgId = userDetails.tenantData.orgId;
        let solutionDocument = await solutionsQueries.solutionDocuments({
          _id: parentSolutionId,
          isReusable: true,
          tenantId: tenantId,
        });

        if (!solutionDocument || solutionDocument.length == 0) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          };
        }
        solutionDocument = solutionDocument[0];
        solutionDocument.programName = reqBody?.programName ? reqBody.programName : messageConstants.common.PRIVATE_PROGRAM;
        solutionDocument.solutionName = reqBody?.solutionName ? reqBody.solutionName : solutionDocument.name;
        solutionDocument.solutionId = solutionDocument._id;
        // passing reqBody to add entities for solutinons based on entityType
        if (reqBody) {
          solutionDocument.reqBody = reqBody;
        }

        let createProgramAndSolution = await solutionsHelper.createProgramAndSolution(
          userDetails.userId,
          solutionDocument,
          "true",
          userDetails.tenantData
        );
        if (!createProgramAndSolution.success) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED,
          };
        }
        return resolve(createProgramAndSolution);
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {},
        });
      }
    });
  }
};
