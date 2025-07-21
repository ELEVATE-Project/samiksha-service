
/**
 * name : surveySubmissionUtils.js
 * author : Praveen Dass
 * Date : 18-July-2025
 * Description:
 * This file contains surveySubmission helper functions that were extracted
 * from surveySubmission module to resolve circular dependency issues.
 *
 * Only use this file for shared logic that leads to
 * circular dependencies when placed in the surveySubmission module.
 */

const surveySubmissionQueries = require(DB_QUERY_BASE_PATH + '/surveySubmissions');
const entityManagementService = require(ROOT_PATH + '/generics/services/entity-management');
const projectService = require(ROOT_PATH + '/generics/services/project');
const kafkaClient = require(ROOT_PATH + '/generics/helpers/kafkaCommunications');


  // /**
  //  * Push incomplete survey submission for reporting.
  //  * @method
  //  * @name pushInCompleteSurveySubmissionForReporting
  //  * @param {String} surveySubmissionId - survey submission id.
  //  * @returns {JSON} consists of kafka message whether it is pushed for reporting
  //  * or not.
  //  */

  function pushInCompleteSurveySubmissionForReporting(surveySubmissionId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (surveySubmissionId == '') {
          throw new Error(messageConstants.apiResponses.SURVEY_SUBMISSION_ID_REQUIRED);
        }

        if (typeof surveySubmissionId == 'string') {
          surveySubmissionId = new ObjectId(surveySubmissionId);
        }

        let surveySubmissionsDocument = await surveySubmissionQueries.surveySubmissionDocuments({
          _id: surveySubmissionId,
          status: { $ne: 'completed' },
        });

        if (!surveySubmissionsDocument.length) {
          throw (
            messageConstants.apiResponses.SUBMISSION_NOT_FOUND +
            'or' +
            messageConstants.apiResponses.SUBMISSION_STATUS_NOT_COMPLETE
          );
        }

        if (surveySubmissionsDocument[0].programId && surveySubmissionsDocument[0].programInformation) {
          surveySubmissionsDocument[0]['programInfo'] = surveySubmissionsDocument[0].programInformation;
        }
        
        let entityTypeDocumentsAPICall = await entityManagementService.entityTypeDocuments({
          name: surveySubmissionsDocument[0].entityType,
        });

        if (
          entityTypeDocumentsAPICall?.success &&
          Array.isArray(entityTypeDocumentsAPICall?.data) &&
          entityTypeDocumentsAPICall.data.length > 0
        ) {
          surveySubmissionsDocument[0]['entityTypeId'] = entityTypeDocumentsAPICall.data[0]._id;
        }

        if (surveySubmissionsDocument[0].referenceFrom === messageConstants.common.PROJECT) {
          await pushSubmissionToProjectService(
            _.pick(surveySubmissionsDocument[0], ['project', 'status', '_id', 'completedDate'])
          );
        }
        const kafkaMessage = await kafkaClient.pushInCompleteSurveySubmissionToKafka(surveySubmissionsDocument[0]);

        if (kafkaMessage.status != 'success') {
          let errorObject = {
            formData: {
              surveySubmissionId: surveySubmissionsDocument[0]._id.toString(),
              message: kafkaMessage.message,
            },
          };
        }

        return resolve(kafkaMessage);
      } catch (error) {
        return reject(error);
      }
    });
  }
  
   /**
   * Push observation submission to improvement service.
   * @method
   * @name pushSubmissionToProjectService
   * @param {String} observationSubmissionDocument - observation submission document.
   * @returns {JSON} consists of kafka message whether it is pushed for reporting
   * or not.
   */

   function pushSubmissionToProjectService(surveySubmissionDocument) {
    return new Promise(async (resolve, reject) => {
      try {
        let surveySubmissionData = {
          taskId: surveySubmissionDocument.project.taskId,
          projectId: surveySubmissionDocument.project._id,
          _id: surveySubmissionDocument._id,
          status: surveySubmissionDocument.status,
        };

        if (surveySubmissionDocument.completedDate) {
          surveySubmissionData['submissionDate'] = surveySubmissionDocument.completedDate;
        }
        let pushSubmissionToProject;
        if (
          process.env.SUBMISSION_UPDATE_KAFKA_PUSH_ON_OFF === 'ON' &&
          process.env.IMPROVEMENT_PROJECT_SUBMISSION_TOPIC
        ) {
          pushSubmissionToProject = await kafkaClient.pushSubmissionToProjectService(surveySubmissionData);

          if ((pushSubmissionToProject.status != messageConstants.common.SUCCESS)) {
            throw new Error(
              `Failed to push submission to project. Submission ID: ${surveySubmissionDocument._id.toString()}, Message: ${
                pushSubmissionToProject.message
              }`
            );
          }
        } else {
          pushSubmissionToProject = await projectService.pushSubmissionToTask(
            surveySubmissionData.projectId,
            surveySubmissionData.taskId,
            surveySubmissionData
          );
          if (!pushSubmissionToProject.success) {
            throw {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.PUSH_SUBMISSION_FAILED,
            };
          }
        }
        return resolve(pushSubmissionToProject);
      } catch (error) {
        return reject(error);
      }
    });
  }
  module.exports = {
    pushInCompleteSurveySubmissionForReporting:pushInCompleteSurveySubmissionForReporting,
    pushSubmissionToProjectService:pushSubmissionToProjectService
  }