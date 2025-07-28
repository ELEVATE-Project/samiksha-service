/**
 * name : userCoursesController.js
 * author : PraveenDass
 * created-date : 22-Jul-2025
 * Description : userCourses
 */

const userCoursesHelper = require(MODULES_BASE_PATH + '/userCourses/helper');

/**
 * userCourses
 * @class
 */
module.exports = class UserCourses extends Abstract {
  constructor() {
    super(userCoursesSchema);
  }

  static get name() {
    return 'userCourses';
  }

  /**
   * Create or update userCourses.
   * @method
   * @name createOrUpdate
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} Created solution data.
   */

  async createOrUpdate(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let userCoursesData = await userCoursesHelper.syncUserCourse(req.body, req.userDetails);
        userCoursesData['result'] = userCoursesData.data;

        return resolve(userCoursesData);
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
   * Create or update userCourses.
   * @method
   * @name delete
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} Created solution data.
   */

  async delete(req) {
    return new Promise(async (resolve, reject) => {
      try {
        //passing true for update userCourses doucment with isDeleted true
        let userCoursesData = await userCoursesHelper.update(req.body,req.userDetails, true);
        userCoursesData['result'] = userCoursesData.data;
        return resolve(userCoursesData);
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }
};
