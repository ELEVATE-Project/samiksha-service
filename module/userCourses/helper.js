/**
 * name : helper.js
 * author : Praveen Dass
 * Date : 21-July-2025
 *  @class
 */

const userCoursesQueries = require(DB_QUERY_BASE_PATH + '/userCourses');
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');

module.exports = class UserCoursesHelper {
  /**
   * create ot update userCourses
   * @method
   * @name syncUserCourse
   * @param {Object} [userCoursesData] - kafka event for sync userCourses.
   * @returns {Object} - response with status
   */
  static async syncUserCourse(userCoursesData) {
    try {
      // Query to get the userCourses document
      let coursesfilter = {
        solutionId: new ObjectId(userCoursesData.entityId),
        userId: userCoursesData.userId,
        tenantId: userCoursesData.tenantId,
      };
      // Check for solutions in solutionDocuments
      let solutionDocument = await solutionsQueries.solutionDocuments({
        _id: new ObjectId(userCoursesData.entityId),
        tenantId: userCoursesData.tenantId,
        type: userCoursesData.type,
        isDeleted: false,
        status:{$ne:messageConstants.COMMON.INACTIVE_STATUS}
      });

      if (!solutionDocument || !solutionDocument.length > 0) {
        return {
          status: httpStatusCode.bad_request.status,
          message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
        };
      }
      solutionDocument = solutionDocument[0];
      // get the userCourses document
      let courseDocument = await userCoursesQueries.userCoursesDocuments(coursesfilter);

      const timestamp = new Date();

      let createOrUpdateCourse;
      //If userCourse already exist update the status
      if (courseDocument.length > 0) {
        //update query
        let updateCourseData = {
          status: userCoursesData.status,
          updatedAt: timestamp,
          ...(userCoursesData.status.toLowerCase() === messageConstants.common.SUBMISSION_STATUS_COMPLETED && { completedAt: timestamp }),
        };

        let updateObject = { $set: updateCourseData };

        createOrUpdateCourse = await userCoursesQueries.updateMany(coursesfilter, updateObject, { new: true });
        if (!createOrUpdateCourse || createOrUpdateCourse.modifiedCount === 0) {
          return {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.USER_COURSES_NOT_UPDATED,
          };
        }
      } else {
        //userCourse not exist create the courses document
        createOrUpdateCourse = await userCoursesQueries.createuserCourses({
          solutionId: new ObjectId(userCoursesData.entityId),
          userId: userCoursesData.userId,
          status: userCoursesData.status,
          createdAt: timestamp,
          updatedAt: timestamp,
          tenantId: userCoursesData.tenantId,
          orgId: userCoursesData.organization_id,
        });

        if (!createOrUpdateCourse || !createOrUpdateCourse._id) {
          return {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.USER_COURSES_NOT_CREATED,
          };
        }
      }

      return {
        success: true,
        data: createOrUpdateCourse,
      };
    } catch (error) {
      throw {
        success: false,
        message: error.message
      };
    }
  }
};
