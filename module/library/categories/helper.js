/**
 * name : helper.js
 * author : Aman
 * created-date : 23-Jun-2020
 * Description : Library categories helper functionality.
 */


// Dependencies
let kendraService = require(ROOT_PATH + '/generics/services/kendra');
let sessionHelpers = require(ROOT_PATH + '/generics/helpers/sessions');
const libraryCategoriesQueries = require(DB_QUERY_BASE_PATH + '/libraryCategories');
const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');
const solutionsHelper = require(MODULES_BASE_PATH + '/solutions/helper');


/**
 * libraryCategoriesHelper
 * @class
 */

module.exports = class libraryCategoriesHelper {

  /**
   * List of library categories.
   * @method
   * @name list
   * @returns {Object} Library categories lists.
   */

  static list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = '';
        let libraryData = sessionHelpers.get('libraryCategories');

        if (libraryData && libraryData.length > 0) {
          result = libraryData;
        } else {
          result = await this.setLibraryCategories(req);
        }

        return resolve({
          message: messageConstants.apiResponses.LIBRARY_CATEGORY_FETCHED,
          result: result,
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
   * @returns {Object} Set library categories lists.
   */

  static setLibraryCategories(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = {};

        // create query to fetch assets
        query['tenantId'] = req.userDetails.tenantData.tenantId;
        query['visibleToOrganizations'] = { $in: ['ALL', req.userDetails.tenantData.orgId] };
        
        // handle currentOrgOnly filter
        if (req.query['currentOrgOnly']) {
          let currentOrgOnly = gen.utils.convertStringToBoolean(req.query['currentOrgOnly']);
          if (currentOrgOnly) {
            query['orgId'] = { $in: ['ALL', req.userDetails.userInformation.organizationId] };
          }
        }
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

        let result = await sessionHelpers.set('libraryCategories', libraryCategories);

        return resolve({
          message: messageConstants.apiResponses.LIBRARY_CATEGORY_FETCHED,
          result: result,
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
        // Check if the category already exists
        let filterQuery = {};
        filterQuery['externalId'] = categoryData.externalId.toString();
        filterQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId;

        const checkIfCategoryExist = await libraryCategoriesQueries.categoryDocuments(filterQuery, [
          '_id',
          'externalId',
        ]);

        // Throw error if the category already exists
        if (
          checkIfCategoryExist.length > 0 &&
          Object.keys(checkIfCategoryExist[0]).length > 0 &&
          checkIfCategoryExist[0]._id != ''
        ) {
          throw {
            success: false,
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.CATEGORY_ALREADY_EXISTS,
          };
        }

        // Fetch the signed urls from handleEvidenceUpload function
        // Commented for now as not required
        // const evidences = await handleEvidenceUpload(files, userDetails.userInformation.userId)
        // categoryData['evidences'] = evidences.data

        // add tenantId and orgId
        categoryData['tenantId'] = userDetails.tenantAndOrgInfo.tenantId;
        categoryData['orgId'] = userDetails.tenantAndOrgInfo.orgId[0];
        categoryData['visibleToOrganizations'] = userDetails.tenantAndOrgInfo.visibleToOrganizations;
        categoryData["updatedBy"] = userDetails.userId
        categoryData['createdBy'] = userDetails.userId
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
				let matchQuery = { _id: filterQuery._id }
				matchQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
				matchQuery['visibleToOrganizations'] = {$in:userDetails.tenantAndOrgInfo.visibleToOrganizations}
				let categoryData = await libraryCategoriesQueries.categoryDocuments(matchQuery, 'all')
				// Throw error if category is not found
				if (
					!categoryData ||
					!(categoryData.length > 0) ||
					!(Object.keys(categoryData[0]).length > 0) ||
					categoryData[0]._id == ''
				) {
					throw {
						status: httpStatusCode.bad_request.status,
						message:messageConstants.apiResponses.LIBRARY_CATEGORIES_NOT_FOUND,
					}
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
				delete updateData.tenantId
				delete updateData.orgId

				filterQuery['tenantId'] = userDetails.tenantAndOrgInfo.tenantId
        updateData["updatedBy"] = userDetails.userId
				// Update the category
				let categoriesUpdated = await libraryCategoriesQueries.updateMany(filterQuery, updateData)

				if (!categoriesUpdated) {
					throw {
						status: httpStatusCode.bad_request.status,
						message: messageConstants.apiResponses.LIBRARY_CATEGORY_NOT_UPDATED,
					}
				}

				return resolve({
					success: true,
					message: messageConstants.apiResponses.LIBRARY_CATEGORY_UPDATED_SUCCESSFULLY,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

  static importFromLibrary (parentSolutionId , reqBody , isATargetedSolution , userDetails) {
    return new Promise(async (resolve, reject) => {

    try {
        
      let tenantId = userDetails.tenantData.tenantId
      let orgId = userDetails. tenantData.orgId
      let solutionDocument = await solutionsQueries.solutionDocuments({ _id: parentSolutionId ,isReusable:true ,tenantId:tenantId})

      if (!solutionDocument || solutionDocument.length == 0) {
        throw {
          status: httpStatusCode.bad_request.status,
          message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
        }
      }
      solutionDocument = solutionDocument[0]
      solutionDocument.programName = reqBody?.programName? reqBody.programName :"PRIVATEPROGRAM"
      solutionDocument.solutionName = reqBody?.solutionName? reqBody.solutionName : solutionDocument.name
      solutionDocument ={...solutionDocument ,reqBody}
      let createProgramAndSolution = await solutionsHelper.createProgramAndSolution(userDetails.userId,solutionDocument,true,userDetails.tenantData)
      if (!createProgramAndSolution.success) {
        throw {
          status: httpStatusCode.bad_request.status,
          message: messageConstants.apiResponses.SOLUTION_PROGRAMS_NOT_CREATED,
        };
      }
      return resolve(createProgramAndSolution)
    }catch (error) {
      return resolve({
        success: false,
        message: error.message,
        data: {},
      })

    }
  })
  }

};
