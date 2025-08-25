/**
 * name : organizationExtension.js
 * author : Praveen Dass
 * Date : 21-July-2025
 * Description:
 * This file contains organizationExtension dbRelated helper functions 
 *  @class
  */



module.exports = class organizationExtension {

    /**
     * find organizationExtensions
     * @method
     * @name organizationExtensionDocuments
     * @param {Array} [organizationExtensionFilter = "all"] - organizationExtension ids.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [sortedData = "all"] - sorted field.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} List of organizationExtension documents.
     */
  
    static organizationExtensionDocuments(
      organizationExtensionFilter = 'all',
      fieldsArray = 'all',
      sortedData = 'all',
      skipFields = 'none'
    ) {
      return new Promise(async (resolve, reject) => {
        try {
          let queryObject = organizationExtensionFilter != 'all' ? organizationExtensionFilter : {};
  
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
  
          let organizationExtensionDocuments;
  
          if (sortedData !== 'all') {
            organizationExtensionDocuments = await database.models.organizationExtension
              .find(queryObject, projection)
              .sort(sortedData)
              .lean();
          } else {
            organizationExtensionDocuments = await database.models.organizationExtension.find(queryObject, projection).lean();
          }
  
          return resolve(organizationExtensionDocuments);
        } catch (error) {
          return resolve({
            success: false,
            message: error.message,
            data: false,
          });
        }
      });
    }
  
   /**
     * Update organizationExtension
     * @method
     * @name updateMany
     * @param {Object} query 
     * @param {Object} update 
     * @returns {JSON} - update response
    */
  
    static updateMany(query, update) {
      return new Promise(async (resolve, reject) => {
        try {
          let organizationExtensionDocuments = await database.models.organizationExtension.updateMany(query, update);
          return resolve(organizationExtensionDocuments);
        } catch (error) {
          return reject(error);
        }
      });
    }
  
     /**
     * Update organizationExtension
     * @method
     * @name update
     * @param {Object} query 
     * @param {Object} updateObject 
     * @param {Object} returnData 
     * @returns {JSON} - update response
    */
  
     static update(query, updateObject,returnData = { new: false }) {
      return new Promise(async (resolve, reject) => {
        try {
          let organizationExtensionDocuments = await database.models.organizationExtension.findOneAndUpdate(query, updateObject, returnData).lean();;
          return resolve(organizationExtensionDocuments);
        } catch (error) {
          return reject(error);
        }
      });
    }
  
     /**
     * create organizationExtension
     * @method
     * @name create
     * @param {Object} courseData - organizationExtension data.
     * @returns {Object} organizationExtension object.
     */
     static create(courseData) {
      return new Promise(async (resolve, reject) => {
        try {
          let organizationExtensionDocument = await database.models.organizationExtension.create(courseData);
          return resolve(organizationExtensionDocument);
        } catch (error) {
          return reject(error);
        }
      });
    }
  
  
  }