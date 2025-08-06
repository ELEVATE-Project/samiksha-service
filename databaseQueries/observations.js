/**
 * name : observations.js
 * author : Mallanagouda R Biradar
 * created-date : 28-July-2025
 * Description : Observation helper for DB interactions.
 */

// Dependencies

/**
 * observations
 * @class
 */

module.exports = class Observations {
  /**
   * Delete observations documents based on the provided MongoDB filter.
   * @param {Object} filter - MongoDB query filter to match documents for deletion.
   * @returns {Promise<Object>} - MongoDB deleteMany result containing deleted count.
   */
  static deleteObservations(filter) {
    return new Promise(async (resolve, reject) => {
      try {
        let deleteDocuments = await database.models.observations.deleteMany(filter);
        return resolve(deleteDocuments);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * find observations
   * @method
   * @name observationDocuments
   * @param {Array} [observationFilter = "all"] - observation ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [sortedData = "all"] - sorted field.
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of observations.
   */

  static observationDocuments(observationFilter = 'all', fieldsArray = 'all', sortedData = 'all', skipFields = 'none') {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = observationFilter != 'all' ? observationFilter : {};

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

        let observationDocuments;

        if (sortedData !== 'all') {
          observationDocuments = await database.models.observations
            .find(queryObject, projection)
            .sort(sortedData)
            .lean();
        } else {
          observationDocuments = await database.models.observations.find(queryObject, projection).lean();
        }

        return resolve(observationDocuments);
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
