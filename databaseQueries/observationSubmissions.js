/**
 * name : observationSubmissions.js
 * author : Mallanagouda R Biradar
 * created-date : 28-July-2025
 * Description : Observation helper for DB interactions.
 */

// Dependencies

/**
 * observationSubmissions
 * @class
 */

module.exports = class observationSubmissions {
  /**
   * Delete observationSubmissions documents based on the provided MongoDB filter.
   *entities
   * @param {Object} filter - MongoDB query filter to match documents for deletion.
   * @returns {Promise<Object>} - MongoDB deleteMany result containing deleted count.
   */
  static deleteObservationSubmissions(filter) {
    return new Promise(async (resolve, reject) => {
      try {
        let deleteDocuments = await database.models.observationSubmissions.deleteMany(filter);
        return resolve(deleteDocuments);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * find observationSubmissions
   * @method
   * @name observationSubmissionsDocuments
   * @param {Array} [observationSubmissionsFilter = "all"] - observationSubmissions ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [sortedData = "all"] - sorted field.
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of observationSubmissions.
   */

  static observationSubmissionsDocuments(
    observationSubmissionsFilter = 'all',
    fieldsArray = 'all',
    sortedData = 'all',
    skipFields = 'none'
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = observationSubmissionsFilter != 'all' ? observationSubmissionsFilter : {};

        let projection = {};

        if (fieldsArray != 'all') {
          fieldsArray.forEach((field) => {
            projection[field] = 1;
          });
        }

        if (skipFields !== 'none') {
          skipFields.forEach((field) => {
            projection[field] = 0;
          });
        }

        let observationSubmissionsDocuments;

        if (sortedData !== 'all') {
          observationSubmissionsDocuments = await database.models.observationSubmissions
            .find(queryObject, projection)
            .sort(sortedData)
            .lean();
        } else {
          observationSubmissionsDocuments = await database.models.observationSubmissions
            .find(queryObject, projection)
            .lean();
        }

        return resolve(observationSubmissionsDocuments);
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: false,
        });
      }
    });
  }
};
