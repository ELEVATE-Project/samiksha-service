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
    * @api {post} /survey//v1/userCourses/createOrUpdate
    * Create or Update userCourses.
    * @apiVersion 1.0.0
    * @apiGroup userCourses
    * @apiSampleRequest /survey//v1/userCourses/createOrUpdate
    * @apiParamExample {json} Request:
    * {
        "type": "course",
        "eventType": "update",
        "status": "STATRTED",
        "entityId": "688355c4db1ac95f8206f567",
        "userId": 4,
        "organization_id": 22,
        "tenant_code": "shikshagraha"
      }

    * @apiParamExample {json} Response:
    {
       "status": 200,
       "result": {
         "success": true,
         "message": "User course created successfully",
         "data": {
            "status": "STATRTED",
            "userId": "5",
            "solutionId": "688355c4db1ac95f8206f567",
            "orgId": "blr",
            "tenantId": "shikshagraha",
            "solutionInformation": {
                "_id": "688355c4db1ac95f8206f567",
                "externalId": "TN-Program-15973018307477",
                "isReusable": false,
                "name": "Improvement Project 3",
                "description": "Leveraging the huge number of private schools to show the significance of the financial problem by creating a petition and presenting to the authorities.",         
            },
            "isDeleted": false,
            "_id": "6887b7652a120de289152e6c",
            "deleted": false,
            "updatedAt": "2025-07-28T17:46:13.450Z",
            "createdAt": "2025-07-28T17:46:13.450Z",
            "__v": 0
          }
        }
     }
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   * Create or update userCourses.
   * @method
   * @name createOrUpdate
   * @param {Object} req - requested data.
   * @returns {JSON} Created or updated userCourses data.
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
    * @api {post} /survey//v1/userCourses/delete
    * Create or Update userCourses.
    * @apiVersion 1.0.0
    * @apiGroup userCourses
    * @apiSampleRequest /survey//v1/userCourses/delete
    * @apiParamExample {json} Request:
    * {
        "type": "course",
        "eventType": "update",
        "status": "STATRTED",
        "entityId": "688355c4db1ac95f8206f567",
        "userId": 4,
        "organization_id": 22,
        "tenant_code": "shikshagraha"
      }

    * @apiParamExample {json} Response:
    {
      "message": "User course updated successfully",
      "status": 200,
      "result": "688753ba5a6f859a65af03b4"
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   * delete userCourses.
   * @method
   * @name delete
   * @param {Object} req - requested data.
   * @returns {JSON} Deleted userCourses data.
   */

  async delete(req) {
    return new Promise(async (resolve, reject) => {
      try {
        //passing true for update userCourses doucment with isDeleted true
        let userCoursesData = await userCoursesHelper.update(req.body, req.userDetails, true);
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
