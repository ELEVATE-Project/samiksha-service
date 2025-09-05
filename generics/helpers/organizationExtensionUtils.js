/**
 * name : organizationExtensionUtils.js
 * author : Praveen Dass
 * Date : 11-Aug-2025
 * Description:
 * This file contains organizationExtension helper functions that were extracted
 * from organizationExtension module to resolve circular dependency issues.
 *
 * Only use this file for shared logic that leads to
 * circular dependencies when placed in the organizationExtension module.
 */

const organizationExtensionQueries = require(DB_QUERY_BASE_PATH + '/organizationExtension');

/**
 * createOrgExtension
 * @method
 * @name createOrgExtension
 * @param {Object} [eventBody] -  eventBody .
 * @returns {Object} - response with status
 */
async function createOrgExtension(eventBody) {
  try {
    if (!eventBody || !eventBody.code || !eventBody.tenant_code) {
      return {
        status: httpStatusCode.bad_request.status,
        message: messageConstants.apiResponses.MISSING_TENANT_AND_ORG_FIELDS,
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

async function getOrgExtension(userDetails) {
 try {
      // Query to get the orgExtension document
      let orgExtensionFilter = {
        tenantId: userDetails.tenantAndOrgInfo.tenantId,
        orgId: userDetails.tenantAndOrgInfo.orgId[0],
      };

      // Getting organizationExtension document 
      let organizationExtensionDocuments = await organizationExtensionQueries.organizationExtensionDocuments(
        orgExtensionFilter
      );

      // Check if the organizationExtension document exists or else create new one
      if (organizationExtensionDocuments.length > 0) {
        return {
          success: true,
          data: organizationExtensionDocuments[0],
        };
      } else {
        return {
          success: false,
          status: httpStatusCode.bad_request.status,
          message:messageConstants.apiResponses.ORGANIZATION_EXTENSION_NOT_FOUND,
          data:false
        };

      }

 } catch (error) {
    throw {
        success: false,
        message: error.message,
        data: false,
      };
 }
}

module.exports = {
  createOrgExtension: createOrgExtension,
  getOrgExtension: getOrgExtension,
};
