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
    * {json} Request body
	  * { }        
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    * "message": "Library categories fetched successfully",
    * "status": 200,
    * "result": [
          {
                "_id": "689361aabfaffc768be24950",
                "name": "Test courses",
                "icon": "",
                "externalId": "test_green_school_yojane_03_55678",
                "noOfSolutions": 0,
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
	 * @api {post} /survey/v1/library/categories/create
	 * create  library categories.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Categories
	 * @apiSampleRequest /survey/v1/library/categories/create
	 * {json} Request body
	 * {   
         "externalId": "test_green_school_yojane_03_556789",
         "name": "Test courses",
         "description": "Leveraging the huge number of private schools to show the significance of the financial problem by creating a petition and presenting to the authorities."
      }
	 * @apiParamExample {json} Response:
   * {
    "message": "Library categories added successfully",
    "status": 200,
    "result": {
        "name": "Test courses2",
        "icon": "",
        "description": "Leveraging the huge number of private schools to show the significance of the financial problem by creating a petition and presenting to the authorities.",
        "isDeleted": false,
        "externalId": "test_green_school_yojane_03_556",
        "isVisible": false,
        "status": "active",
        "updatedBy": "18",
        "createdBy": "18",
        "noOfSolutions": 0,
        "tenantId": "shikshagraha",
        "orgId": "blr",
        "visibleToOrganizations": [
            "blr"
        ],
        "_id": "68c9a64315ef3104cb039119",
        "deleted": false,
        "updatedAt": "2025-09-16T18:02:43.224Z",
        "createdAt": "2025-09-16T18:02:43.224Z",
        "__v": 0
      }
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
        const libraryProjectcategory = await libraryCategoriesHelper.create(req.body, req.files, req.userDetails);
        return resolve({
          message: libraryProjectcategory.message,
          result: libraryProjectcategory.data,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
	 * @api {post} /survey/v1/library/categories/update/_id
	 * update library categories.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Categories
	 * @apiSampleRequest /survey/v1/library/categories/update
	 * {json} Request body
	 * @apiParamExample {json} Response:
	 * {   
         "name": "Test courses2",
         "description": "Summa ulalali."    
       }
	* @apiParamExample {json} Response:
	*   {
        success: true,
        message: "Library categories updated successfully" ",
        }
	 * @apiUse successBody
	 * @apiUse errorBody
	 */

  /**
   * update library-category.
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
        };
        const libraryProjectcategory = await libraryCategoriesHelper.update(
          findQuery,
          req.body,
          req.files,
          req.userDetails
        );

        return resolve({
          message: libraryProjectcategory.message,
          result: libraryProjectcategory.data,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }
};
