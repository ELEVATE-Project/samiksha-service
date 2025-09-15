
/**
 * name : organizationExtension.js
 * author : PraveenDass
 * created-date : 07-Aug-2025
 * Description : organizationExtension
 */

const organizationHelper = require(MODULES_BASE_PATH + '/organizationExtension/helper');

/**
 * userCourses
 * @class
 */
module.exports = class  OrganizationExtension extends Abstract {
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
    * {   
      "observationResourceVisibilityPolicy": "ALL"    
       }
    * @apiParamExample {json} Response:
      {
        "message": "Organization extension Updated successfully",
        "status": 200,
        "result": {
        "_id": "689c4b1d3752d47770713d97",
        "orgId": "mys",
        "observationResourceVisibilityPolicy": "ALL",
        "externalObservationResourceVisibilityPolicy": "CURRENT",
        "surveyResourceVisibilityPolicy": "CURRENT",
        "externalSurveyResourceVisibilityPolicy": "CURRENT",
        "createdBy": "SYSTEM",
        "updatedBy": "1",
        "tenantId": "shikshagraha",
        "deleted": false,
        "updatedAt": "2025-09-02T07:06:53.661Z",
        "createdAt": "2025-08-13T08:21:49.524Z",
        "__v": 0
       }
      }
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   * update  organizationExtension.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @returns {JSON} update organizationExtension data.
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let organizationExtensionData = await organizationHelper.update(req.body,req.params._id, req.userDetails);
        organizationExtensionData['result'] = organizationExtensionData.data;
        return resolve(organizationExtensionData);
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
    * @api {post} /survey/v1/organizationExtension/create
    * Create  organizationExtension.
    * @apiVersion 1.0.0
    * @apiGroup organizationExtension
    * @apiSampleRequest /survey/v1/organizationExtension/create
    * @apiParamExample {json} Request:
    * {   
         "externalId": "test_green_school_yojane_03_556789",
          "name": "Test courses",
         "description": "Leveraging the huge number of private schools to show the significance of the financial problem by creating a petition and presenting to the authorities.",
         "tenantId":"shikshalokam",
         "entityId":"SLOrg3"
       }

    * @apiParamExample {json} Response:
      {
       "status": 200,
        "result": {
        "orgId": "SLOrg3",
        "observationResourceVisibilityPolicy": "CURRENT",
        "externalObservationResourceVisibilityPolicy": "CURRENT",
        "surveyResourceVisibilityPolicy": "CURRENT",
        "externalSurveyResourceVisibilityPolicy": "CURRENT",
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "tenantId": "shikshalokam",
        "_id": "68b698cc000046ee20489fbc",
        "deleted": false,
        "updatedAt": "2025-09-02T07:12:12.279Z",
        "createdAt": "2025-09-02T07:12:12.279Z",
        "__v": 0
      }
     }
   
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   * organizationExtension create.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @returns {JSON}  Created organizationExtension data.
   */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {
        //passing true for update userCourses doucment with isDeleted true
        let organizationExtensionData = await organizationHelper.create(req.body,req.userDetails);
        organizationExtensionData['result'] = organizationExtensionData.data;
        return resolve(organizationExtensionData);
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
     * @api {post} /survey/v1/organizationExtension/updateRelatedOrgs
     * update related organizations for solutions (visibleToOrganizations).     
     * @apiVersion 1.0.0
     * @apiGroup organizationExtension
     * @apiSampleRequest /survey/v1/organizationExtension/updateRelatedOrgs
     * @param {json} Request-Body:
      {
   
        "changes": {
          "related_org_details" :[
                {
                   id:"2",
                   code:"mys"
                } ,
                {
                   id:"2",
                   code:"SLOrg"
                } 
         ]         
        },
        "code": "blr",
        "tenant_code": "shikshagraha",
      }
     * @apiParamExample {json} Response:
      {
          "message": "Solution updated successfully",
          "status": 200
      }
     * @apiUse successBody
     * @apiUse errorBody
     */

  /**
   * Solutions visibleToOrganization key update
   * @method
   * @name updateRelatedOrgs
   * @param {Object} req - Req Body
   * @returns {JSON} list of data.
   */
  async updateRelatedOrgs(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await organizationHelper.updateRelatedOrgs(req.body,req.userDetails);
        resolve(result);
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
