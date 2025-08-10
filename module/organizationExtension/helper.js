/**
 * name : helper.js
 * author : Praveen Dass
 * Date : 07-Aug-2025
 *  @class
 */

const organizationExtensionQueries = require(DB_QUERY_BASE_PATH + '/organizationExtension');

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
   * createOrgExtension
   * @method
   * @name createOrgExtension
   * @param {Object} [eventBody] -  eventBody .
   * @returns {Object} - response with status
   */
  static async createOrgExtension(eventBody) {
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
  /**
   * org eventListener
   * @method
   * @name eventListener
   * @param {Object} [eventBody] -  eventBody .
   * @returns {Object} - response with status
   */
  static async eventListener(eventBody) {
    try {
      //EventBody Validation - TODO: Check if this should be a middleware
      /* const { entity, eventType, entityId } = eventBody
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')
			return await eventListenerRouter(eventBody, {
				createFn: this.createOrgExtension,
			}) */
      return this.createOrgExtension(eventBody);
    } catch (error) {
      throw {
        success: false,
        message: error.message,
        data: false,
      };
    }
  }
};
