/**
 * name : categoriesController.js
 * author : Aman
 * created-date : 23-Jun-2020
 * Description : All library categories related information.
 */

// Dependencies

const libraryCategoriesHelper = require(MODULES_BASE_PATH + '/library/categories/helper');

/**
 * LibraryCategories
 * @class
 */

module.exports = class LibraryCategories extends Abstract {
  constructor() {
    super(libraryCategoriesSchema);
  }

  static get name() {
    return 'LibraryCategories';
  }

  /**
    * @api {get} /survey/v1/library/categories/list List of library categories.
    * @apiVersion 1.0.0
    * @apiName List of library categories
    * @apiGroup Library Categories
    * @apiSampleRequest /survey/v1/library/categories/list
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    * "message": "Library categories fetched successfully",
    * "status": 200,
    * "result": [
        {
            "name": "Drafts",
            "type": "drafts",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Flibrary%2Fcategories%2Fdrafts.png?generation=1593680944065555&alt=media",
            "updatedAt" : "2020-07-02T12:54:04.355Z"
        },{
            "name": "Individual Assessments",
            "type": "individual",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Flibrary%2Fcategories%2FindividualAssessments.png?generation=1593680941650219&alt=media",
            "updatedAt" : "2020-07-02T12:54:04.355Z"
        },{
            "name": "Observation Solutions",
            "type": "observation",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Flibrary%2Fcategories%2FobservationSolutions.png?generation=1593680943321398&alt=media",
            "updatedAt" : "2020-07-02T12:54:04.355Z"
        },{
            "name": "Institutional Assessments",
            "type": "institutional",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Flibrary%2Fcategories%2FinstitutionalAssessments.png?generation=1593680942514300&alt=media",
            "updatedAt" : "2020-07-02T12:54:04.355Z"
        },{
            "name": "Survey and Feedback",
            "type": "survey",
            "updatedAt": "2020-09-09T17:39:52.101Z",
            "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Flibrary%2FsurveyAndFeedback.png?alt=media"
        }
    ]}
    */

  /**
   * List of library categories
   * @method
   * @name list
   * @param {Object} req - requested data
   * @returns {JSON} returns a list of library categories.
   */

  async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let libraryCategories = await libraryCategoriesHelper.list(req);
        return resolve(libraryCategories);
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
	 * @api {post} /survey/api/v1/library/categories/create
	 * List of library projects.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Categories
	 * @apiSampleRequest /survey/api/v1/library/categories/create
	 * {json} Request body
	 * @apiParamExample {json} Response:
	 *   
   * {
       "message": "Library categories Added successfully",
       "status": 200,
       "result": "68935c603f35011fa5f76fee"
    }
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 *Create new library-category.
	 * @method
	 * @name create
	 * @param {Object} req - requested data
	 * @returns {Object} Library project category details .
	 */

	async create(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const libraryProjectcategory = await libraryCategoriesHelper.create(
					req.body,
					req.files,
					req.userDetails
				)
				return resolve({
					message: libraryProjectcategory.message,
					result: libraryProjectcategory.data,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

  
  	/**
	 * @api {post} /survey/v1/library/categories/update/_id
	 * List of library projects.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Categories
	 * @apiSampleRequest /survey/api/v1/library/categories/update
	 * {json} Request body
	 * @apiParamExample {json} Response:
	 *
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

	/**
	 *Create new project-category.
	 * @method
	 * @name update
	 * @param {Object} req - requested data
	 * @returns {Array} Library Categories project.
	 */

	async update(req) {
		return new Promise(async (resolve, reject) => {
			try {
				const findQuery = {
					_id: req.params._id,
				}
				const libraryProjectcategory = await libraryCategoriesHelper.update(
					findQuery,
					req.body,
					req.files,
					req.userDetails
				)

				return resolve({
					message: libraryProjectcategory.message,
					result: libraryProjectcategory.data,
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	async importFromLibrary(req) {
		return new Promise(async (resolve, reject) => {
			try {
				if(req?.query?.isATargetedSolution) {
                  req.query.isATargetedSolution =  gen.utils.convertStringToBoolean(req.query.isATargetedSolution)
				}
				const privateSolutions = await libraryCategoriesHelper.importFromLibrary(
					req.params._id,
					req.body,
					req.query.isATargetedSolution ? req.query.isATargetedSolution : false,
					req.userDetails
				)

				return resolve (privateSolutions)
			} catch (error) {
				return reject(error)
			}
		})
	}};
