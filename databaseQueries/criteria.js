/**
 * name : criteria.js
 * author : Mallanagouda R Biradar
 * created-date : 28-July-2025
 * Description : criteria helper for DB interactions.
 */

// Dependencies

/**
 * criteria
 * @class
 */

module.exports = class criteria {
  /**
   * create criteria
   * @method
   * @name create
   * @param {Object} criteriaData - criteria data.
   * @returns {Object} criteria object.
   */
  static create(criteriaData) {
    return new Promise(async (resolve, reject) => {
      try {
        let criteriaDocument = await database.models.criteria.create(criteriaData);

        return resolve(criteriaDocument);
      } catch (error) {
        return reject(error);
      }
    });
  }
};
