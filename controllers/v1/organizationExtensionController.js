
/**
 * name : organizationExtension.js
 * author : PraveenDass
 * created-date : 07-Aug-2025
 * Description : organizationExntension
 */

const organizationHelper = require(MODULES_BASE_PATH + '/organizationExtension/helper');

/**
 * userCourses
 * @class
 */
module.exports = class  OrganizationExntension extends Abstract {
  constructor() {
    super(organizationExtensionSchema);
  }

  static get name() {
    return 'organizationExtension';
  }
  /**
    * @api {post} /survey/v1/organizationExtension/update
    * update organizationExtension.
    * @apiVersion 1.0.0
    * @apiGroup organizationExtension
    * @apiSampleRequest /survey/v1/organizationExtension/update
    * @apiParamExample {json} Request:
    * 

    * @apiParamExample {json} Response:
   
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   * update  organizationExtension.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @returns {JSON} update  organizationExtension data.
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let userCoursesData = await organizationHelper.update(req.body,req.params._id, req.userDetails);
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
    * @api {post} /survey/v1/organizationExtension/eventListener
    * Create  organizationExtension.
    * @apiVersion 1.0.0
    * @apiGroup organizationExtension
    * @apiSampleRequest /survey/v1/organizationExtension/eventListener
    * @apiParamExample {json} Request:
    *

    * @apiParamExample {json} Response:
   
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   *  Create  organizationExtension.
   * @method
   * @name delete
   * @param {Object} req - requested data.
   * @returns {JSON}  Created organizationExtension data.
   */

  async eventListener(req) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('CONTROLLER REQUEST BODY: ', req.body)
        //passing true for update userCourses doucment with isDeleted true
        let userCoursesData = await organizationHelper.createOrgExtension(req.body,req.userDetails);
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
