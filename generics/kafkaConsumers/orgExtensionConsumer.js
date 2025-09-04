/**
 * name : orgExtensionConsumer.js
 * author : PraveenDass
 * created-date : 22-Jul-2025
 * Description : orgExtension consumer.
 */
const organizationExtensionUtils = require(ROOT_PATH + '/generics/helpers/organizationExtensionUtils');
const adminHelper = require(MODULES_BASE_PATH + '/admin/helper');

/**
 * orgExtension message received.
 * @function
 * @name messageReceived
 * @param {Object} message - consumer data
 * {
 *   highWaterOffset:63
 *   key:null
 *   offset:62
 *   partition:0
 *   topic:'elevate-user-courses-dev'
 *   value:{
        "entity": "organization",
        "eventType": "create",
        "entityId": "<org_id>",
        "changes": {},
        "id": "<org_id>",
        "name": "<org_name>",
        "code": "<org_code>",
        "description": "<org_description>",
        "related_orgs": [],
        "tenant_code": "<tenant_code>",
        "meta": {},
        "status": "ACTIVE",
        "deleted": false,
        "created_by": "<user_id>",
        "created_at": "<timestamp>",
        "updated_at": "<timestamp>"
    }
 * }
 * @returns {Promise} return a Promise.
 */
var messageReceived = function (message) {
  return new Promise(async function (resolve, reject) {
    try {
      console.log(message,"this is message")
      let parsedMessage = JSON.parse(message.value);
      let orgExtensionStatus;
      if (parsedMessage.eventType && parsedMessage.eventType === 'create') {
         orgExtensionStatus = await organizationExtensionUtils.createOrgExtension(parsedMessage);
      }
      if (parsedMessage.eventType && parsedMessage.eventType === 'update') {
         orgExtensionStatus = await adminHelper.updateRelatedOrgs(parsedMessage);
      }
      if (orgExtensionStatus?.status === 200) {
        return resolve('Message Processed.');
      } else {
        return resolve('Message Processed.');
      }
    } catch (error) {
      return reject(error);
    }
  });
};

var errorTriggered = function (error) {
  return new Promise(function (resolve, reject) {
    try {
      return resolve('Error Processed');
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  messageReceived: messageReceived,
  errorTriggered: errorTriggered,
};
