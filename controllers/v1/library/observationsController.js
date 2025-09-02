/**
 * name : observationsController.js
 * author : Aman
 * created-date : 04-Jun-2020
 * Description : Observations library related information.
 */

const libraryObservationsHelper = require(MODULES_BASE_PATH + '/library/observations/helper');

/**
 * Observations
 * @class
 */
module.exports = class Observations {
  constructor() {}

  static get name() {
    return 'Observations';
  }

  /**
    * @api {get} /assessment/api/v1/library/observations/list?search=:searchText&page=:page&limit=:limit List of observation solutions
    * @apiVersion 1.0.0
    * @apiName List of observation solutions
    * @apiGroup Observation Solutions Library
    * @apiSampleRequest /assessment/api/v1/library/observations/list?search=A&page=1&limit=1
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully fetched observations solutions list",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5d15b0d7463d3a6961f91746",
                "externalId": "AFRICA-ME-TEST-FRAMEWORK-TEMPLATE",
                "name": "AFRICA-ME-TEST-FRAMEWORK",
                "description": "AFRICA-ME-TEST-FRAMEWORK"
            }
        ],
        "count": 29
    }}
    */

  /**
   * List of observation solutions
   * @method
   * @name list
   * @param {Object} req - All requested Data.
   * @returns {JSON} returns a list of templates observation solution.
   */

  async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let observationSolutions = await libraryObservationsHelper.list(
          req.searchText,
          req.pageSize,
          req.pageNo,
          req.userDetails.userId,
          req.userDetails.userToken,
          req.query.categoryId,
          req.userDetails
        );

        return resolve(observationSolutions);
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
    * @api {get} /assessment/api/v1/library/observations/details/:librarySolutionId Details of observation solution.
    * @apiVersion 1.0.0
    * @apiName Details of observation solution
    * @apiGroup Observation Solutions Library
    * @apiSampleRequest /assessment/api/v1/library/observations/details/5ed5ec4dd2afa80d0f616460
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully fetched observation solution details",
    "status": 200,
    "result": {
        "name": "AFRICA-ME-TEST-FRAMEWORK",
        "creator": "",
        "description": "AFRICA-ME-TEST-FRAMEWORK",
        "linkTitle": "",
        "linkUrl": "",
        "questions": [
            "What about any awareness sessions for students and staff on things like personal safety, health, hygiene, and disaster management?",
            "How often do these sessions happen?",
            "What topics are generally covered in these sessions?",
            "Who participated in these sessions?"
        ]
    }}
    */

  /**
   * Details of library solution
   * @method
   * @name details
   * @param {Object} req - All requested Data.
   * @returns {JSON} returns creator,about and questions details.
   */

  async details(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let observationSolution = await libraryObservationsHelper.details(req.params._id);

        return resolve(observationSolution);
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
	 * @api {post} /survey/v1/library/observations/importFromLibrary/_id
	 * create observationa dn survey solutions from Library template.
	 * @apiVersion 1.0.0
	 * @apiGroup Library Observations
	 * @apiSampleRequest /survey/api/v1/library/observations/importFromLibrary/_id
	 * {json} Request body
   * 
   {
      "state": "67c82d0c538125889163f197",
      "district": "67c82d37bad58c889bc5a5de",
      "block": "67c82d7abad58c889bc5a643",
      "cluster": "67c82d53538125889163f3cd",
      "school": "67c82d985381258891643d0b",
      "professional_role": "681b076ef21c88cef9517e0a",
      "professional_subroles": "681b0894f21c88cef9517e12,681b0a369c57cdcf03c79ae7,681b0af29c57cdcf03c79aeb,6822fd5f4e2812081f342608,6822fdd94e2812081f34260f,6822fdf64e2812081f342613,6822fe0d4e2812081f342617,6822fe2a4e2812081f34261b,6822fe4d4e2812081f34261f,6822fe774e2812081f342623",
      "organizations": "[object Object]",
      "programName":"test",
      "solutionName":"test123"
    }
	 * @apiParamExample {json} Response:
	 * {
      "message": "User program and solution created successfully",
      "status": 200,
      "result": {
        "program": {
            "externalId": "test-1756108031820",
            "name": "test",
            "description": "test",
            "owner": "251",
            "createdBy": "",
            "updatedBy": "251",
            "status": "active",
            "startDate": "2025-08-25T07:47:11.820Z",
            "endDate": "2026-08-25T07:47:11.820Z",
            "resourceType": [
                "Program"
            ],
            "language": [
                "English"
            ],
            "keywords": [
                "keywords 1",
                "keywords 2"
            ],
            "concepts": [],
            "imageCompression": {
                "quality": 10
            },
            "components": [],
            "isAPrivateProgram": true,
            "isDeleted": false,
            "rootOrganisations": [],
            "createdFor": [],
            "orgId": "blr",
            "tenantId": "shikshagraha",
            "_id": "68ac14ff17a160d43101d234",
            "deleted": false,
            "updatedAt": "2025-08-25T07:47:11.825Z",
            "createdAt": "2025-08-25T07:47:11.825Z",
            "__v": 0
          },
        "solution": {
            "externalId": "d3532558-315b-11f0-9c57-c52e41ff5959-OBSERVATION-TEMPLATE-1756108031820",
            "isReusable": false,
            "name": "DEV OBS - 1 may 14 2250",
            "description": "Observation Without Rubric",
            "author": "251",
            "parentSolutionId": "682593a3cfa7cfe32cd833da",
            "resourceType": [],
            "language": [],
            "keywords": [],
            "concepts": [],
            "themes": [
                {
                    "name": "Observation Theme",
                    "type": "theme",
                    "label": "theme",
                    "externalId": "OB",
                    "weightage": 40,
                    "criteria": [
                        {
                            "criteriaId": "682593a3cfa7cfe32cd833d6",
                            "weightage": 40
                        },
                        {
                            "criteriaId": "682593a3cfa7cfe32cd833d7",
                            "weightage": 40
                        }
                    ]
                }
            ],
            "flattenedThemes": [],
            "entityType": "state",
            "type": "observation",
            "subType": "",
            "entities": [
                "67c82d0c538125889163f197"
            ],
            "programId": "68ac14ff17a160d43101d234",
            "programExternalId": "test-1756108031820",
            "programName": "test",
            "programDescription": "test",
            "status": "active",
            "evidenceMethods": {
                "OB": {
                    "externalId": "OB",
                    "tip": null,
                    "name": "Observation",
                    "description": null,
                    "modeOfCollection": "onfield",
                    "canBeNotApplicable": false,
                    "notApplicable": false,
                    "canBeNotAllowed": false,
                    "remarks": null
                }
            },
            "sections": {
                "S1": "Observation Question"
            },
            "registry": [],
            "isRubricDriven": false,
            "enableQuestionReadOut": false,
            "updatedBy": "251",
            "captureGpsLocationAtQuestionLevel": false,
            "isAPrivateProgram": true,
            "allowMultipleAssessemts": false,
            "isDeleted": false,
            "pageHeading": "Domains",
            "minNoOfSubmissionsRequired": 1,
            "availableForPrivateConsumption": false,
            "rootOrganisations": [],
            "createdFor": [],
            "orgId": "blr",
            "tenantId": "shikshagraha",
            "isExternalProgram": false,
            "parentEntityKey": null,
            "visibleToOrganizations": [],
            "visibility": "CURRENT",
            "_id": "68ac150017a160d43101d237",
            "deleted": false,
            "categories": [],
            "updatedAt": "2025-08-25T07:47:12.084Z",
            "createdAt": "2025-08-25T07:47:12.084Z",
            "__v": 0
        },
        "parentSolutionInformation": {
            "solutionId": "682593a3cfa7cfe32cd833da"
         }
      }
    }
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

  async importFromLibrary(req) {
    return new Promise(async (resolve, reject) => {
      try {
        if (req?.query?.isATargetedSolution) {
          req.query.isATargetedSolution = gen.utils.convertStringToBoolean(req.query.isATargetedSolution);
        }
        const privateSolutions = await libraryObservationsHelper.importFromLibrary(
          req.params._id,
          req.body,
          req.query.isATargetedSolution ? req.query.isATargetedSolution : false,
          req.userDetails
        );

        return resolve(privateSolutions);
      } catch (error) {
        return reject(error);
      }
    });
  }
};
