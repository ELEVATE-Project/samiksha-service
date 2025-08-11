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
    console.log('EVENT BODY: ', eventBody);
    if (!eventBody || !eventBody.entityId || !eventBody.tenantId) {
      return {
        status: httpStatusCode.bad_request.status,
        message: messageConstants.apiResponses.MISSING_TENANT_AND_ORG_FIELDS,
      };
    }
    let extensionData = {
      orgId: eventBody.entityId,
      created_by: eventBody.created_by,
      updated_by: eventBody.created_by,
      name: eventBody.name,
      tenantId: eventBody.tenantId,
    };
    console.log('EXTENSION DATA BEFORE INSERT: ', extensionData);
    let orgExtension = await organizationExtensionQueries.create(extensionData);
    console.log('EXTENSION DATA AFTER INSERT: ', orgExtension);
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

async function getOrCreateOrgExtension(userDetails) {
 try {
      // Query to get the orgExternsion document
      let orgExternsionfilter = {
        tenantId: userDetails.tenantAndOrgInfo.tenantId,
        orgId: userDetails.tenantAndOrgInfo.orgId[0],
      };

      // Getting organizationExtension document 
      let organizationExtensionDocuments = await organizationExtensionQueries.organizationExtensionDocuments(
        orgExternsionfilter
      );
      // Check if the organizationExtension document exists or else create new one
      if (organizationExtensionDocuments.length > 0) {
        return {
          success: true,
          data: organizationExtensionDocuments[0],
        };
      } else {
        let extensionData = {
            entityId: userDetails.tenantAndOrgInfo.orgId[0],
            created_by: userDetails.userId,
            updated_by: userDetails.userId,
            tenantId: userDetails.tenantAndOrgInfo.tenantId,
          };

          let orgExtension = await createOrgExtension(extensionData);
          return {
            success: true,
            data: orgExtension.data,
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
  getOrCreateOrgExtension: getOrCreateOrgExtension,
};
