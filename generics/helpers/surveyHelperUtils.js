



const surveySubmissionsHelper = require(MODULES_BASE_PATH + '/surveySubmissions/helper');



 /**
   * List of user assigned surveys.
   * @method
   * @name userAssigned
   * @param {String} userId - Logged in user Id.
   * @param {String} pageSize - size of page.
   * @param {String} pageNo - page number.
   * @param {String} search - search text.
   * @param {String} filter - filter text.
   * @param {String} surveyReportPage - survey report page.
   * @param {Object} tenantFilter - tenant filter.
   * @returns {Object}
   */

 function userAssigned(userId, pageSize, pageNo, search = '', filter, surveyReportPage = '',tenantFilter) {
    return new Promise(async (resolve, reject) => {
      try {
        let surveySolutions = {
          success: false,
        };

        if (surveyReportPage === '' || gen.utils.convertStringToBoolean(surveyReportPage)) {
          // List of created survey solutions by user.
          surveySolutions = await surveySubmissionsHelper.surveySolutions(userId, pageNo, pageSize, search, filter,tenantFilter);
        }

        let totalCount = 0;
        let mergedData = [];

        if (surveySolutions.success && surveySolutions.data) {
          totalCount = surveySolutions.data.count;
          mergedData = surveySolutions.data.data;

          if (mergedData.length > 0) {
            mergedData.forEach((surveyData) => {
              surveyData.isCreator = true;
            });
          }
        }
        // Getting List of surveys for user
        let surveySubmissions = await surveySubmissionsHelper.surveyList(
          userId,
          pageNo,
          pageSize,
          search,
          filter,
          surveyReportPage,
          tenantFilter
        );

        if (surveySubmissions.success && surveySubmissions.data.data.length > 0) {
          totalCount += surveySubmissions.data.count;

          surveySubmissions.data.data.forEach((surveyData) => {
            surveyData.isCreator = false;
          });

          mergedData = [...mergedData, ...surveySubmissions.data.data];
        }

        return resolve({
          success: true,
          message: messageConstants.apiResponses.USER_ASSIGNED_SURVEY_FETCHED,
          data: {
            data: mergedData,
            count: totalCount,
          },
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: [],
        });
      }
    });
  }


  module.exports ={
    userAssigned:userAssigned
  }