/**
 * name : helper.js
 * author : Aman
 * created-date : 23-Jun-2020
 * Description : Library categories helper functionality.
 */

// Dependencies
let sessionHelpers = require(ROOT_PATH + '/generics/helpers/sessions');
const libraryCategoriesQueries = require(DB_QUERY_BASE_PATH + '/libraryCategories');

/**
 * libraryCategoriesHelper
 * @class
 */

module.exports = class LibraryCategoriesHelper {
  /**
   * List of library categories.
   * @method
   * @name list
   * @returns {Object} Library categories lists.
   */

  static list(req) {
    return new Promise(async (resolve, reject) => {
      try {

        // let result = '';
        // let libraryData = sessionHelpers.get(`libraryCategories-${req.userDetails.userId}`);

        // if (libraryData && libraryData.length > 0) {
        //   result = libraryData;
        // } else {
        //   result = await this.setLibraryCategories(req);
        // }

        let query = {};

        // create query to fetch assets
        query['tenantId'] = req.userDetails.tenantData.tenantId;
        query['visibleToOrganizations'] = { $in: ['ALL', req.userDetails.tenantData.orgId] };

        query['status'] = messageConstants.common.ACTIVE_STATUS;

        let libraryCategories = await libraryCategoriesQueries.categoryDocuments(query, [
          'externalId',
          'name',
          'icon',
          'updatedAt',
          'noOfSolutions',
        ]);

        if (!libraryCategories.length > 0) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND,
            result: [],
          };
        }

        return resolve({
          message: messageConstants.apiResponses.LIBRARY_CATEGORY_FETCHED,
          result: libraryCategories,
        });
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

  /**
   * Set library categories.
   * @method
   * @name setLibraryCategories
   * @param {Object} req - request object.
   * @param {Object} req.userDetails - loggedIn user Details.
   * 
   * @returns {Object} Set library categories lists.
   */

  static setLibraryCategories(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = {};

        // create query to fetch assets
        query['tenantId'] = req.userDetails.tenantData.tenantId;
        query['visibleToOrganizations'] = { $in: ['ALL', req.userDetails.tenantData.orgId] };

        query['status'] = messageConstants.common.ACTIVE_STATUS;
        let libraryCategories = await libraryCategoriesQueries.categoryDocuments(query, [
          'externalId',
          'name',
          'icon',
          'updatedAt',
          'noOfSolutions',
        ]);

        if (!libraryCategories.length > 0) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND,
            result: [],
          };
        }

        // let categories = {};

        // let libraryCategoriesIcon = libraryCategories.map((category) => {
        //   categories[category.icon] = {
        //     name: category.name,
        //     type: category.externalId,
        //     updatedAt: category.updatedAt,
        //   };

        //   return category.icon;
        // });

        // let result = await kendraService.getDownloadableUrl({
        //   filePaths: libraryCategoriesIcon,
        // });

        // if (result.status !== httpStatusCode.ok.status) {
        //   throw {
        //     status: httpStatusCode.bad_request.status,
        //     message: messageConstants.apiResponses.URL_COULD_NOT_BE_FOUND,
        //   };
        // }

        // result = result.result.map((downloadableImage) => {
        //   return _.merge(categories[downloadableImage.filePath], { url: downloadableImage.url });
        // });

        // result = result.sort((a, b) => (a.name.toString() > b.name.toString() ? 1 : -1));

        let result = await sessionHelpers.set(`libraryCategories-${req.userDetails.userId}`, libraryCategories);

        return resolve(result);
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

  /**
   * create categories
   * @method
   * @name create
   * @param categoryData - categoryData.
   * @param files - files.
   * @param userDetails - user decoded token details.
   * @returns {Object} category details
   */

  static create(categoryData, files, userDetails) {
    return new Promise(async (resolve, reject) => {
      try {
        // add tenantId , orgId and visibleToOrganizations 
        categoryData['tenantId'] = userDetails.tenantAndOrgInfo.tenantId;
        categoryData['orgId'] = userDetails.tenantAndOrgInfo.orgId[0];
        categoryData['visibleToOrganizations'] = userDetails.tenantAndOrgInfo.orgId;
        categoryData['updatedBy'] = userDetails.userId;
        categoryData['createdBy'] = userDetails.userId;
        let libraryCategoriesData = await libraryCategoriesQueries.create(categoryData);

        if (!libraryCategoriesData._id) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.LIBRARY_CATEGORIES_NOT_ADDED,
          };
        }

        return resolve({
          success: true,
          message: messageConstants.apiResponses.LIBRARY_CATEGORY_ADDED,
          data: libraryCategoriesData._id,
        });
      } catch (error) {
        return reject({
          status: error.status ? error.status : httpStatusCode.internal_server_error.status,
          success: false,
          message: error.message,
          data: {},
        });
      }
    });
  }

  /**
   * Update categories
   * @method
   * @name update
   * @param filterQuery - Filter query.
   * @param updateData - Update data.
   * @param files - files
   * @param userDetails - user related information
   * @returns {Object} updated data
   */

  static update(filterQuery, updateData, files, userDetails) {
    return new Promise(async (resolve, reject) => {
      try {
        let matchQuery = { _id: new ObjectId(filterQuery._id) };
        matchQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId;
        matchQuery['visibleToOrganizations'] = { $in: userDetails.tenantAndOrgInfo.visibleToOrganizations };
        let categoryData = await libraryCategoriesQueries.categoryDocuments(matchQuery, 'all');
        // Throw error if category is not found
        if (
          !categoryData ||
          !(categoryData.length > 0) ||
          !(Object.keys(categoryData[0]).length > 0) ||
          categoryData[0]._id == ''
        ) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND,
          };
        }
        // Commenting evidence for now may be in future it might needed
        // let evidenceUploadData = await handleEvidenceUpload(files, userDetails.userInformation.userId)
        // evidenceUploadData = evidenceUploadData.data

        // // Update the sequence numbers
        // updateData['evidences'] = []

        // if (categoryData[0].evidences && categoryData[0].evidences.length > 0) {
        // 	for (const evidence of evidenceUploadData) {
        // 		evidence.sequence += categoryData[0].evidences.length
        // 		categoryData[0].evidences.push(evidence)
        // 	}
        // 	updateData['evidences'] = categoryData[0].evidences
        // } else {
        // 	updateData['evidences'] = evidenceUploadData
        // }

        // delete tenantId & orgId attached in req.body to avoid adding manupulative data
        delete updateData.tenantId;
        delete updateData.orgId;

        filterQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId;
        updateData['updatedBy'] = userDetails.userId;
        // Update the category
        let categoriesUpdated = await libraryCategoriesQueries.updateMany(filterQuery, updateData);

        if (!categoriesUpdated) {
          throw {
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.LIBRARY_CATEGORY_NOT_UPDATED,
          };
        }

        return resolve({
          success: true,
          message: messageConstants.apiResponses.LIBRARY_CATEGORY_UPDATED_SUCCESSFULLY,
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {},
        });
      }
    });
  }

};
