/**
 * name : deletionAuditLogs.js.
 * author : Mallanagouda R Biradar
 * created-date : 25-July-2025
 * Description : deletionAuditLogs related db queries
 */

module.exports = class deletionAuditLogs {
  /**
   * Inserts deletion audit logs into the deletionAuditLogs collection.
   *
   * @method
   * @name create
   * @param {Array<Object>} logs - Array of log objects containing:
   *  - entityId: ObjectId (ID of the deleted entity)
   *  - deletedBy: String | Number (User who deleted the entity)
   *  - deletedAt: String (ISO date string of when deletion occurred)
   * @returns {Promise<Array<Object>>} - Inserted log documents on success.
   * @throws {Object} - On failure, returns an error object with status and message.
   */
  static create(logs) {
    return new Promise(async (resolve, reject) => {
      try {        
        let deletedData = await database.models.deletionAuditLogs.insertMany(logs);        
        return resolve(deletedData);
      } catch (error) {
        console.log(error);
        return reject(error);
      }
    });
  }
};
