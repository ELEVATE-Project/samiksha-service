/**
 * name : helper.js
 * author : Deepa
 * created-date : 0-Sep-2020
 * Description : Survey solutions helper functionality.
 */

// Dependencies
const solutionsHelper = require(MODULES_BASE_PATH + '/solutions/helper');
const assessmentsHelper = require(MODULES_BASE_PATH + '/assessments/helper');

/**
 * SurveyHelper
 * @class
 */
module.exports = class SurveyHelper {
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
   * @returns {Array} - Solution templates lists.
   * @returns {Object} returns list of survey solutions
   */

  static list(search, limit, pageNo, userId, token,categoryId ="",userDetails) {
    return new Promise(async (resolve, reject) => {
      try {
        let librarySolution = await solutionsHelper.templates(
          messageConstants.common.SURVEY,
          search,
          limit,
          pageNo,
          userId,
          token,
          categoryId,
          userDetails
        );

        return resolve({
          success: true,
          message: messageConstants.apiResponses.SURVEY_SOLUTIONS_LIST_FETCHED,
          data: librarySolution,
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
   * Survey solution details information
   * @method
   * @name details
   * @param {String} templateId - Template id.
   * @returns {Object} returns creator,about and questions of survey solutions.
   */

  static details(templateId) {
    return new Promise(async (resolve, reject) => {
      try {
        let surveySolutionDetails = await assessmentsHelper.templateDetails(templateId, false, false);

        surveySolutionDetails.allowImport = false;

        return resolve({
          success: true,
          message: messageConstants.apiResponses.SURVEY_SOLUTION_DETAILS_FETCHED,
          data: surveySolutionDetails,
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
};
