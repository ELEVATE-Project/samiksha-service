/**
 * name : helper.js
 * author : Praveen Dass
 * Date : 07-Aug-2025
 *  @class
 */

const organizationExtensionQueries = require(DB_QUERY_BASE_PATH + '/organizationExtension');
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');

module.exports = class organisationExtensionHelper {
  /**
   * update OrgExtension
   * @method
   * @name update
   * @param {Object} [eventBody] - req body data to update .
   * @param {String} [orgExtensionId] - orgExtensionId .
   * @param {userDetails} [userDetails] - userDetails .
   * @returns {Object} - response with status
   */
  static async update(bodyData, orgExtensionId, userDetails) {
    try {
      // Query to get the orgExternsion document
      let orgExternsionfilter = {
        _id: new ObjectId(orgExtensionId),
        tenantId: userDetails.tenantAndOrgInfo.tenantId,
        orgId: userDetails.tenantAndOrgInfo.orgId,
      };
      // Getting organizationExtension document to update
      let organizationExtensionDocuments = await organizationExtensionQueries.organizationExtensionDocuments(
        orgExternsionfilter
      );
      if (!(organizationExtensionDocuments.length > 0)) {
        return {
          status: httpStatusCode.bad_request.status,
          message: messageConstants.apiResponses.ORGANIZATION_EXTENSION_NOT_FOUND,
        };
      }

      let updateObject = {
        $set: {},
      };
      //get update object
      Object.keys(_.omit(bodyData, ['tenantId', 'orgId'])).forEach((updationData) => {
        updateObject['$set'][updationData] = bodyData[updationData];
      });
      updateObject['$set']['updatedBy'] = userDetails.userId;

      const orgExtension = await organizationExtensionQueries.update(orgExternsionfilter, updateObject, { new: true });

      if (!orgExtension || !orgExtension._id) {
        return {
          status: httpStatusCode.bad_request.status,
          message: messageConstants.apiResponses.ORGANIZATION_EXTENSION_NOT_UPDATED,
        };
      }
      return {
        success: true,
        message: messageConstants.apiResponses.ORGANIZATION_EXTENSION_UPDATED_SUCCESSFULLY,
        data: orgExtension,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
 
  /**
   * orgExtension create
   * @method
   * @name create
   * @param {Object} [eventBody] -  eventBody .
   * @returns {Object} - response with status and orgExtensionData
   */
  static async create(eventBody) {
    try {
      if (!eventBody || !eventBody.code || !eventBody.tenant_code) {
        return {
          status: httpStatusCode.bad_request.status,
          message: messageConstants.apiResponses.MISSING_TENANT_AND_ORG_FIELDS,
        };
      }
      
       // Query to get the orgExtension document
       let orgExtensionFilter = {
        tenantId: eventBody.tenant_code,
        orgId: eventBody.code,
      };
  
      // Getting organizationExtension document 
      let organizationExtensionDocuments = await organizationExtensionQueries.organizationExtensionDocuments(
        orgExtensionFilter
      );
       
      //Check orgExtension already exists or else create new one
      if(organizationExtensionDocuments.length > 0) {
        return {
          success: false,
          status: httpStatusCode.bad_request.status,
          message:messageConstants.apiResponses.ORGANIZATION_EXTENSION_ALREADY_EXISTS,
        };
  
      }
      let extensionData = {
        orgId: eventBody.code,
        created_by: eventBody.created_by,
        updated_by: eventBody.created_by,
        name: eventBody.name,
        tenantId: eventBody.tenant_code,
      };
      let orgExtension = await organizationExtensionQueries.create(extensionData);
      return {
        success: true,
        data: orgExtension,
      };
    } catch (error) {
      throw {
        success: false,
        message: error.message,
        data: false,
      };
    }
  }

    /**
   * update multiple library solutions resources based on related_orgs changes.
   * @method
   * @name updateRelatedOrgs
   * @param {Object} bodyData - Contains the  tenantId, orgId, and userId.
   * @param {string} bodyData.tenant_code - Tenant identifier.
   * @param {string} bodyData.code - Organization identifier.
   * @param {string} bodyData.updated_by - Identifier of the user who triggered deletion.
   * @param {Object} userDetails - logged in userDetails
   * @returns {Promise<Object>} - Returns success status with solutionUpdateData or error information.
   */
    static updateRelatedOrgs(bodyData, userDetails) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!bodyData || !bodyData.code || !bodyData.tenant_code) {
            return {
              status: httpStatusCode.bad_request.status,
              message: messageConstants.apiResponses.MISSING_TENANT_AND_ORG_FIELDS,
            };
          }
          //get org and tenantId for userDetails if its admin updating relatedOrgs
          let org_code = userDetails?.tenantAndOrgInfo?.orgId?.[0] || bodyData.code;
          let tenant_code = userDetails?.tenantAndOrgInfo?.tenantId || bodyData.tenant_code;
          let userId = userDetails?.userId || bodyData.updated_by;
          let solutionUpdate = {};
          if (
            bodyData?.changes?.hasOwnProperty('related_orgs') &&
            bodyData?.hasOwnProperty('related_org_details')
          ) {
            //get the code to store it in  visibleToOrganizations key
            let visibleOrg = bodyData.related_org_details?.map((eachValue) => {
              return eachValue.code;
            });
  
            //  update query
            const filterQuery = { orgId: org_code, tenantId: tenant_code, isReusable: true };
            const updateQuery = {
              $set: { visibleToOrganizations: visibleOrg, updatedAt: new Date(), updatedBy: userId },
            };
  
            //update the solutions
            solutionUpdate = await solutionsQueries.update(filterQuery, updateQuery);
  
            if (!solutionUpdate || !solutionUpdate.acknowledged) {
              return resolve({
                status: httpStatusCode.internal_server_error.status,
                message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
                result: solutionUpdate,
              });
            }
          }
  
          return resolve({
            success: true,
            message: messageConstants.apiResponses.SOLUTION_UPDATED,
            result: solutionUpdate,
          });
        } catch (error) {
          console.log(error,"this is error")
          return reject({
            status: error.status || httpStatusCode.internal_server_error.status,
            message: error.message || httpStatusCode.internal_server_error.message,
            errorObject: error,
          });
        }
      });
    }
};
