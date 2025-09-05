/**
 * name : admin.js
 * author : Ankit Shahu
 * created-date : 20-09-2023
 * Description : Admin Related information.
 */


// Dependencies
const adminHelper = require(MODULES_BASE_PATH + '/admin/helper');

module.exports = class Admin {
  static get name() {
    return 'admin';
  }

  /**
     * @api {post} /kendra/api/v1/admin/dbFind/:collectionName
     * List of data based on collection
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /kendra/api/v1/admin/dbFind/projects
     * @param {json} Request-Body:
     * {
     * "query" : {
          "userId": "18155ae6-493d-4369-9668-165eb6dcaa2a",
          "_id": "601921116ffa9c5e9d0b53e5"
        },
       "projection" : ["title"],
       "limit": 100,
       "skip": 2
      }
     * @apiParamExample {json} Response:
     * {
          "message": "Data Fetched Or Updated Successfully",
          "status": 200,
          "result": [
              {
                  "_id": "601921e86ffa9c5e9d0b53e7",
                  "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
              },
              {
                  "_id": "60193ce26ffa9c5e9d0b53fe",
                  "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
              }
          ]
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

  /**
   * List of data based on collection
   * @method
   * @name dbFind
   * @param {String} _id - MongoDB Collection Name
   * @param {Object} req - Req Body
   * @returns {JSON} list of data.
   */

  async dbFind(req) {
    return new Promise(async (resolve, reject) => {
      try {
        if (req.body.mongoIdKeys) {
          req.body.query = await adminHelper.convertStringToObjectIdInQuery(req.body.query, req.body.mongoIdKeys);
        }

        let mongoDB = await adminHelper.list(
          req.params._id,
          req.body.query,
          req.body.projection ? req.body.projection : [],
          'none',
          req.body.limit ? req.body.limit : 100,
          req.body.skip ? req.body.skip : 0,
        );
        let mongoDBDocuments = await database.models[req.params._id]
          .find(mongoDB.queryObject, mongoDB.projectionObject)
          .skip(mongoDB.skippingValue)
          .limit(mongoDB.limitingValue);

        // finding document count from db. We can't get it from result array length because a limiting value is passed
        let docCount = await database.models[req.params._id].countDocuments(mongoDB.queryObject);
        return resolve({
          message: messageConstants.apiResponses.DATA_FETCHED_SUCCESSFULLY,
          success: true,
          result: mongoDBDocuments ? mongoDBDocuments : [],
          count: docCount ? docCount : 0,
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
     * @api {post} /survey/v1/admin/createIndex/:collectionName
     * List of data based on collection
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /survey/v1/admin/createIndex/projects
     * @param {json} Request-Body:
      {
          "keys": ["scope.state","name","description"]
          
      }
     * @apiParamExample {json} Response:
      {
          "message": "Keys indexed successfully",
          "status": 200
      }
     * @apiUse successBody
     * @apiUse errorBody
     */

  /**
   * Indexes keys based on the collection name and passed key 
   * @method
   * @name createIndex
   * @param {String} _id - MongoDB Collection Name
   * @param {Object} req - Req Body
   * @returns {JSON} list of data.
   */
  async createIndex(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let collection = req.params._id;
        let keys = req.body.keys;
        let result = await adminHelper.createIndex(collection,keys);
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

  /**
   * @api {post} /survey/v1/admin/deleteResource/:resourceId?type=solution
   * Deletes a resource (program/solution) after validating admin access.
   * @apiVersion 1.0.0
   * @apiGroup Admin
   * @apiSampleRequest /survey/v1/admin/deleteResource/683867e60f8595db9c1b6c26?type=solution
    * @apiParamExample {json} Response:
   {
    "message": "Solution and associated resources deleted successfully",
    "status": 200,
    "result": {
        "deletedSolutionsCount": 1,
        "deletedSurveysCount": 1,
        "deletedSurveySubmissionsCount": 1,
        "deletedObservationsCount": 0,
        "deletedObservationSubmissionsCount": 0,
        "pullSolutionFromProgramComponent": 1
    }
  }
    * @apiUse successBody
    * @apiUse errorBody
  */
  /**
   * Deletes a resource (program/solution) after validating admin access.
   *
   * @param {Object} req - Express request object containing user details, params, and query.
   * @param {Object} req.params - Contains route parameters, specifically `_id` of the resource.
   * @param {Object} req.query - Contains query parameters, specifically `type` (program/solution).
   * @param {Object} req.userDetails - Contains user roles and tenant/org info.
   * @returns {Promise<Object>} - Returns a success or failure response from the adminHelper.
   * @throws {Object} - Throws an error object with status, message, and error details if validation or deletion fails.
   */
  async deleteResource(req) {
    return new Promise(async (resolve, reject) => {
      try {
          // Call adminHelper's deletedResourceDetails with required identifiers
         let deleteResource = await adminHelper.deletedResourceDetails(
            req.params._id,
            req.query.type,
            req.userDetails.tenantAndOrgInfo.tenantId,
            req.userDetails.tenantAndOrgInfo.orgId,
            req.userDetails.userId
          );
        return resolve(deleteResource);
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
   * @api {post} /survey/v1/admin/deleteSolutionResource/:resourceId?type=solution
   * Deletes a resource (program/solution) after validating admin access.
   * @apiVersion 1.0.0
   * @apiGroup Admin
   * @apiSampleRequest /survey/v1/admin/deleteSolutionResource/683867e60f8595db9c1b6c26?type=solution
    * @apiParamExample {json} Response:
    {
    "message": "Solution and associated resources deleted successfully",
    "status": 200,
    "result": {
        "deletedSolutionsCount": 1,
        "deletedSurveysCount": 1,
        "deletedSurveySubmissionsCount": 1,
        "deletedObservationsCount": 0,
        "deletedObservationSubmissionsCount": 0,
        "pullSolutionFromProgramComponent": 1
    }
  }
    * @apiUse successBody
    * @apiUse errorBody
    */
  /**
   * Controller method to handle solution resource deletion request.
   * Delegates deletion logic to the adminHelper and returns the result to the client.
   *
   * @param {Object} req - The Express request object containing:
   *   - body: { solutionIds, tenantId, orgId, deletedBy }
   *   - query: { type } – The type of resource being deleted (e.g., 'solution')
   *
   * @returns {Promise<Object>} Deletion result including summary of affected records
   */
  async deleteSolutionResource(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Call the helper function to perform deletion logic
        let deleteSolutionResource = await adminHelper.deleteSolutionResource(req.body, req.query.type);
        // Return the result from the helper
        return resolve(deleteSolutionResource);
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
     * @api {post} /survey/v1/admin/updateRelatedOrgs
     * update related organizations for solutions (visibleToOrganizations).     
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /survey/v1/admin/updateRelatedOrgs
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
        let result = await adminHelper.updateRelatedOrgs(req.body,req.userDetails);
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
