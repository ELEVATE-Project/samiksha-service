/**
 * name : solutionsController.js
 * author : Akash
 * created-date : 22-feb-2019
 * Description : Solution related information.
 */

// Dependencies
const csv = require('csvtojson');
const solutionsHelper = require(MODULES_BASE_PATH + '/solutions/helper');
const criteriaHelper = require(MODULES_BASE_PATH + '/criteria/helper');
const questionsHelper = require(MODULES_BASE_PATH + '/questions/helper');
const FileStream = require(ROOT_PATH + '/generics/fileStream');
const observationsHelper = require(MODULES_BASE_PATH + '/observations/helper');

/**
 * Solutions
 * @class
 */
module.exports = class Solutions extends Abstract {
  constructor() {
    super(solutionsSchema);
  }

  static get name() {
    return 'solutions';
  }

  /**
    * @api {post} /assessment/api/v1/solutions/targetedSolutions?type=:solutionType&page=:page&limit=:limit&search=:search&filter=:filter
    * List of assigned solutions and targetted ones.
    * @apiVersion 1.0.0
    * @apiGroup Solutions
    * @apiSampleRequest /assessment/api/v1/solutions/targetedSolutions?type=observation&page=1&limit=10&search=a&filter=assignedToMe
    * @apiParamExample {json} Request:
    * {
    *   "roles" : ["HM","DEO"],
   		  "entities" : ["236f5cff-c9af-4366-b0b6-253a1789766a"],
        "recommendedFor" : ["Teacher"],
        "factors" : ["roles"],
    }
    * @apiParamExample {json} Response:
    {
    "message": "Solutions fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5f9288fd5e25636ce6dcad66",
                "name": "obs1",
                "description": "observation1",
                "solutionId": "5f9288fd5e25636ce6dcad65",
            },
            {
                "_id": "5fc7aa9e73434430731f6a10",
                "solutionId": "5fb4fce4c7439a3412ff013b",
                "name": "My Solution",
                "description": "My Solution Description"
            }
        ],
        "count": 2
    }}
    * @apiUse successBody
    * @apiUse errorBody
    */

  /**
   * List of solutions and targetted ones.
   * @method
   * @name targetedSolutions
   * @param {Object} req - request data.
   * @returns {JSON} List of solutions with targetted ones.
   */

  async targetedSolutions(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let observations = await solutionsHelper.targetedSolutions(
          req.body,
          req.query.type,
          req.userDetails.userToken,
          req.pageSize,
          req.pageNo,
          req.searchText,
          req.query.filter,
          // req.query.surveyReportPage ? req.query.surveyReportPage : '',
        );

        observations['result'] = observations.data;

        return resolve(observations);
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
   * @api {get} /assessment/api/v1/solutions/details/:solutionInternalId Framework & Rubric Details
   * @apiVersion 1.0.0
   * @apiName Framework & Rubric Details of a Solution
   * @apiGroup Solutions
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /assessment/api/v1/solutions/details/5b98fa069f664f7e1ae7498c
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   * "result":{
   * "heading":"Solution Framework + rubric for - DCPCR Assessment Framework 2018",
   * "sections": [
   * {
   *  "table": true,
   * "data": [
   * {
   * "criteriaName": "Availability of School Leadership",
   * "L1": "School does not have a principal or vice-principal; there is  a teacher in-charge of the post",
   * "L2": "The school principal is not available only vice principal is available or vice principal has assumed charge as principal.  Most teachers are involved in administrative work along with principal / vice principal",
   * "L3": "The school has full time principal but no vice principal and some teachers are involved in administrative work along with principal / vice principal.",
   * "L4": "School has a full-time principal and vice principal as per norms (if applicable) or in case where vice principal is not mandated, Only principal and vice principal are involved in administrative work."
   * }
   * ]
   * }
   * ]
   * }
   * }
   */

  /**
   * Solution details
   * @method
   * @name details
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution external id.
   * @returns {JSON} consists of criteriaName and rubric levels.
   */

  async details(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let findQuery = {
          _id: req.params._id,
        };

        let solutionDocument = await database.models.solutions
          .findOne(findQuery, { themes: 1, levelToScoreMapping: 1, name: 1 })
          .lean();

        let criteriasIdArray = gen.utils.getCriteriaIds(solutionDocument.themes);
        let criteriaDocument = await database.models.criteria
          .find({ _id: { $in: criteriasIdArray } }, { name: 1, 'rubric.levels': 1 })
          .lean();

        let criteriaObject = {};

        criteriaDocument.forEach((eachCriteria) => {
          let levelsDescription = {};

          for (let k in eachCriteria.rubric.levels) {
            levelsDescription[k] = eachCriteria.rubric.levels[k].description;
          }

          criteriaObject[eachCriteria._id.toString()] = _.merge(
            {
              name: eachCriteria.name,
            },
            levelsDescription,
          );
        });

        let responseObject = {};
        responseObject.heading = 'Solution Framework + rubric for - ' + solutionDocument.name;

        responseObject.sections = new Array();

        let levelValue = {};

        let sectionHeaders = new Array();

        sectionHeaders.push({
          name: 'criteriaName',
          value: 'Domain',
        });

        for (let k in solutionDocument.levelToScoreMapping) {
          levelValue[k] = '';
          sectionHeaders.push({
            name: k,
            value: solutionDocument.levelToScoreMapping[k].label,
          });
        }

        let generateCriteriaThemes = function (themes, parentData = []) {
          themes.forEach((theme) => {
            if (theme.children) {
              let hierarchyTrackToUpdate = [...parentData];
              hierarchyTrackToUpdate.push(_.pick(theme, ['type', 'label', 'externalId', 'name']));

              generateCriteriaThemes(theme.children, hierarchyTrackToUpdate);
            } else {
              let tableData = new Array();
              let levelObjectFromCriteria = {};

              let hierarchyTrackToUpdate = [...parentData];
              hierarchyTrackToUpdate.push(_.pick(theme, ['type', 'label', 'externalId', 'name']));

              theme.criteria.forEach((criteria) => {
                if (criteriaObject[criteria.criteriaId.toString()]) {
                  Object.keys(levelValue).forEach((eachLevel) => {
                    levelObjectFromCriteria[eachLevel] = criteriaObject[criteria.criteriaId.toString()][eachLevel];
                  });

                  tableData.push(
                    _.merge(
                      {
                        criteriaName: criteriaObject[criteria.criteriaId.toString()].name,
                      },
                      levelObjectFromCriteria,
                    ),
                  );
                }
              });

              let eachSection = {
                table: true,
                data: tableData,
                tabularData: {
                  headers: sectionHeaders,
                },
                summary: hierarchyTrackToUpdate,
              };

              responseObject.sections.push(eachSection);
            }
          });
        };

        generateCriteriaThemes(solutionDocument.themes);

        let response = {
          message: 'Solution framework + rubric fetched successfully.',
          result: responseObject,
        };

        return resolve(response);
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
   * @api {get} /assessment/api/v1/solutions/importFromFramework/?frameworkId:frameworkExternalId&entityType:entityType Create solution from framework.
   * @apiVersion 1.0.0
   * @apiName Create solution from framework.
   * @apiGroup Solutions
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParam {String} frameworkId Framework External ID.
   * @apiParam {String} entityType Entity Type.
   * @apiSampleRequest /assessment/api/v1/solutions/importFromFramework?frameworkId=EF-SMC&entityType=school
   * @apiUse successBody
   * @apiUse errorBody
   *
   */

  /**
   * Import solution from framework and mapped to the programs
   * @method
   * @name details
   * @param {Object} req - requested data.
   * @param {String} req.query.frameworkId - framework external id.
   * @param {String} req.query.entityType - entity type.
   * @returns {JSON} consists of solution created id.
   */

  async importFromFramework(req) {
    return new Promise(async (resolve, reject) => {
      try {
        if (
          !req.query.frameworkId ||
          req.query.frameworkId == '' ||
          !req.query.entityType ||
          req.query.entityType == ''
        ) {
          throw messageConstants.apiResponses.INVALID_PARAMETER;
        }

        let frameworkDocument = await database.models.frameworks
          .findOne({
            externalId: req.query.frameworkId,
          })
          .lean();

        if (!frameworkDocument._id) {
          throw messageConstants.apiResponses.INVALID_PARAMETER;
        }

        let entityTypeDocument = await database.models.entityTypes
          .findOne(
            {
              name: req.query.entityType,
            },
            {
              _id: 1,
              name: 1,
            },
          )
          .lean();

        if (!entityTypeDocument._id) {
          throw messageConstants.apiResponses.INVALID_PARAMETER;
        }

        let criteriasIdArray = gen.utils.getCriteriaIds(frameworkDocument.themes);

        let frameworkCriteria = await database.models.criteria.find({ _id: { $in: criteriasIdArray } }).lean();

        let solutionCriteriaToFrameworkCriteriaMap = {};

        await Promise.all(
          frameworkCriteria.map(async (criteria) => {
            criteria.frameworkCriteriaId = criteria._id;
            let newCriteriaId = await database.models.criteria.create(_.omit(criteria, ['_id']));
            if (newCriteriaId._id) {
              solutionCriteriaToFrameworkCriteriaMap[criteria._id.toString()] = newCriteriaId._id;
            }
          }),
        );

        let updateThemes = function (themes) {
          themes.forEach((theme) => {
            let criteriaIdArray = new Array();
            let themeCriteriaToSet = new Array();
            if (theme.children) {
              updateThemes(theme.children);
            } else {
              criteriaIdArray = theme.criteria;
              criteriaIdArray.forEach((eachCriteria) => {
                eachCriteria.criteriaId = solutionCriteriaToFrameworkCriteriaMap[eachCriteria.criteriaId.toString()]
                  ? solutionCriteriaToFrameworkCriteriaMap[eachCriteria.criteriaId.toString()]
                  : eachCriteria.criteriaId;
                themeCriteriaToSet.push(eachCriteria);
              });
              theme.criteria = themeCriteriaToSet;
            }
          });
          return true;
        };

        let newSolutionDocument = _.cloneDeep(frameworkDocument);

        updateThemes(newSolutionDocument.themes);

        newSolutionDocument.externalId = frameworkDocument.externalId + '-TEMPLATE';

        newSolutionDocument.frameworkId = frameworkDocument._id;
        newSolutionDocument.frameworkExternalId = frameworkDocument.externalId;

        newSolutionDocument.entityTypeId = entityTypeDocument._id;
        newSolutionDocument.entityType = entityTypeDocument.name;
        newSolutionDocument.isReusable = true;

        let newBaseSolutionId = await database.models.solutions.create(_.omit(newSolutionDocument, ['_id']));

        let response = {
          message: messageConstants.apiResponses.SOLUTION_GENERATED,
          result: newBaseSolutionId._id,
        };

        return resolve(response);
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
   * @api {post} /assessment/api/v1/solutions/mapEntityToSolution/:solutionExternalId Map entity id to solution
   * @apiVersion 1.0.0
   * @apiName Map entity id to solution
   * @apiGroup Solutions
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParam {String} solutionId solution id.
   * @apiParam {File} entities Mandatory entities file of type CSV.
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Map entity to solution.
   * @method
   * @name details
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution external id.
   * @param {CSV} req.files.entities - entities ids to be mapped to solution.
   * @returns {JSON} consists message of successfully mapped entities
   */

  async mapEntityToSolution(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let entityIdsFromCSV = await csv().fromString(req.files.entities.data.toString());

        entityIdsFromCSV = entityIdsFromCSV.map((entity) => new ObjectId(entity.entityIds));

        let entityData = await solutionsHelper.addEntityToSolution(req.params._id, entityIdsFromCSV);

        return resolve(entityData);
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
   * @api {post} /assessment/api/v1/solutions/uploadThemes/{solutionsExternalID} Upload Themes For Solutions
   * @apiVersion 1.0.0
   * @apiName Upload Themes in Solutions
   * @apiGroup Solutions
   * @apiParam {File} themes Mandatory file upload with themes data.
   * @apiSampleRequest /assessment/api/v1/solutions/uploadThemes/EF-DCPCR-2018-001
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Upload themes in solution.
   * @method
   * @name uploadThemes
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution external id.
   * @param {CSV} req.files.themes - themes to be uploaded to solution.
   * csv consists of ### seperated data for theme,aoi,indicators field.
   * ex: Theme1###T1###10(nameOfTheme###externalIdOfTheme###weightageOfTheme)
   * @returns {CSV}
   */

  async uploadThemes(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileName = `Solution-Upload-Result`;
        let fileStream = new FileStream(fileName);
        let input = fileStream.initStream();

        (async function () {
          await fileStream.getProcessorPromise();
          return resolve({
            isResponseAStream: true,
            fileNameWithPath: fileStream.fileNameWithPath(),
          });
        })();

        let solutionDocument = await database.models.solutions
          .findOne({ externalId: req.params._id }, { _id: 1 })
          .lean();

        if (!solutionDocument) {
          return resolve({
            status: httpStatusCode.not_found.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        let headerSequence;
        let themes = await csv()
          .fromString(req.files.themes.data.toString())
          .on('header', (headers) => {
            headerSequence = headers;
          });

        let solutionThemes = await solutionsHelper.uploadTheme(
          'solutions',
          solutionDocument._id,
          themes,
          headerSequence,
        );

        for (let pointerToEditTheme = 0; pointerToEditTheme < solutionThemes.length; pointerToEditTheme++) {
          input.push(solutionThemes[pointerToEditTheme]);
        }

        input.push(null);
      } catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

  /**
   * @api {post} /assessment/api/v1/solutions/update?solutionExternalId={solutionExternalId} Update Solutions
   * @apiVersion 1.0.0
   * @apiName update Solutions
   * @apiGroup Solutions
   * @apiParam {File} Mandatory solution file of type json.
   * @apiSampleRequest /assessment/api/v1/solutions/update
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Update solution.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {String} req.query.solutionExternalId - solution external id.
   * @param {JSON} req.files.solution - solution data to be updated.
   * @returns {JSON}
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.update(req.params._id, req.body, req.userDetails.userId);

        return resolve(solutionData);
      } catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }
  // async update(req) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let solutionData = JSON.parse(req.files.solution.data.toString());

  //       let queryObject = {
  //         externalId: req.query.solutionExternalId,
  //       };

  //       let solutionDocument = await database.models.solutions.findOne(queryObject, { themes: 0 }).lean();

  //       if (!solutionDocument) {
  //         return resolve({
  //           status: httpStatusCode.bad_request.status,
  //           message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
  //         });
  //       }

  //       let solutionMandatoryField = solutionsHelper.mandatoryField();

  //       Object.keys(solutionMandatoryField).forEach((eachSolutionMandatoryField) => {
  //         if (
  //           solutionDocument[eachSolutionMandatoryField] === undefined &&
  //           solutionData[eachSolutionMandatoryField] === undefined
  //         ) {
  //           solutionData[eachSolutionMandatoryField] = solutionMandatoryField[eachSolutionMandatoryField];
  //         }
  //       });

  //       let updateObject = _.merge(_.omit(solutionDocument, 'createdAt'), solutionData);

  //       updateObject.updatedBy = req.userDetails.id;

  //       await database.models.solutions.findOneAndUpdate(
  //         {
  //           _id: solutionDocument._id,
  //         },
  //         updateObject,
  //       );

  //       return resolve({
  //         status: httpStatusCode.ok.status,
  //         message: messageConstants.apiResponses.SOLUTION_UPDATED,
  //       });
  //     } catch (error) {
  //       reject({
  //         status: error.status || httpStatusCode.internal_server_error.status,
  //         message: error.message || httpStatusCode.internal_server_error.message,
  //         errorObject: error,
  //       });
  //     }
  //   });
  // }

  /**
   * @api {post} /assessment/api/v1/solutions/updateSolutions?solutionExternalId={solutionExternalId} Update Solutions
   * @apiVersion 1.0.0
   * @apiName updateSolutions Solutions
   * @apiGroup Solutions
   * @apiSampleRequest /assessment/api/v1/solutions/updateSolutions
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Update solution.
   * @method
   * @name updateSolutions
   * @param {Object} req - requested data.
   * @param {String} req.query.solutionExternalId -  solution external id.
   * @returns {JSON}
   */

  async updateSolutions(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = {
          externalId: req.query.solutionExternalId,
        };

        let solutionDocument = await database.models.solutions.findOne(queryObject, { _id: 1 }).lean();

        if (!solutionDocument) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        let updateObject = {
          $set: {},
        };

        let solutionUpdateData = req.body;

        Object.keys(solutionUpdateData).forEach((solutionData) => {
          updateObject['$set'][solutionData] = solutionUpdateData[solutionData];
        });

        updateObject['$set']['updatedBy'] = req.userDetails.id;

        await database.models.solutions.findOneAndUpdate(
          {
            _id: solutionDocument._id,
          },
          updateObject,
        );

        return resolve({
          status: httpStatusCode.ok.status,
          message: messageConstants.apiResponses.SOLUTION_UPDATED,
        });
      } catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

  /**
   * @api {post} /assessment/api/v1/solutions/uploadThemesRubricExpressions/{{solutionsExternalID}} Upload Rubric For Themes Of Solutions
   * @apiVersion 1.0.0
   * @apiName Upload Rubric For Themes Of Solutions
   * @apiGroup Solutions
   * @apiParam {File} themes Mandatory file upload with themes data.
   * @apiSampleRequest /assessment/api/v1/solutions/uploadThemesRubricExpressions/EF-DCPCR-2018-001
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Upload themes rubric
   * @method
   * @name uploadThemesRubricExpressions
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution external id.
   * @returns {CSV}
   */

  async uploadThemesRubricExpressions(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionDocument = await database.models.solutions
          .findOne(
            {
              externalId: req.params._id,
              scoringSystem: 'pointsBasedScoring',
            },
            { themes: 1, levelToScoreMapping: 1 },
          )
          .lean();

        if (!solutionDocument) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        let themeData = await csv().fromString(req.files.themes.data.toString());

        if (!themeData.length > 0) {
          throw new Error('Bad data.');
        }

        let solutionLevelKeys = new Array();

        Object.keys(solutionDocument.levelToScoreMapping).forEach((level) => {
          solutionLevelKeys.push(level);
        });

        const themesWithRubricDetails = await solutionsHelper.setThemeRubricExpressions(
          solutionDocument.themes,
          themeData,
          solutionLevelKeys,
        );

        if (themesWithRubricDetails.themes) {
          await database.models.solutions.findOneAndUpdate(
            { _id: solutionDocument._id },
            {
              themes: themesWithRubricDetails.themes,
              flattenedThemes: themesWithRubricDetails.flattenedThemes,
            },
          );
        }

        const fileName = `Solution-Theme-Rubric-Upload-Result`;
        let fileStream = new FileStream(fileName);
        let input = fileStream.initStream();

        (async function () {
          await fileStream.getProcessorPromise();
          return resolve({
            isResponseAStream: true,
            fileNameWithPath: fileStream.fileNameWithPath(),
          });
        })();

        if (!themesWithRubricDetails.csvData) {
          throw new Error(messageConstants.apiResponses.SOMETHING_WENT_WRONG + 'No CSV Data found.');
        }

        for (
          let pointerToThemeRow = 0;
          pointerToThemeRow < themesWithRubricDetails.csvData.length;
          pointerToThemeRow++
        ) {
          input.push(themesWithRubricDetails.csvData[pointerToThemeRow]);
        }

        input.push(null);
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
    * @api {get} /assessment/api/v1/solutions/getDetails/:solutionId Solution details
    * @apiVersion 1.0.0
    * @apiName Details of the solution.
    * @apiGroup Solutions
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/solutions/getDetails/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Solution details fetched successfully",
    "status": 200,
    "result": {
        "_id": "601bc17489149727d7d70bbd",
        "resourceType": [
            "Observations Framework"
        ],
        "language": [
            "English"
        ],
        "keywords": [
            "Framework",
            "Observation",
            "Challenges",
            " Enrollment",
            " Parents",
            " Courses "
        ],
        "concepts": [],
        "themes": [
            {
                "type": "theme",
                "label": "theme",
                "name": "Observation Theme",
                "externalId": "OB",
                "weightage": 100,
                "criteria": [
                    {
                        "criteriaId": "601bc17489149727d7d70bbb",
                        "weightage": 50
                    },
                    {
                        "criteriaId": "601bc17489149727d7d70bbc",
                        "weightage": 50
                    }
                ]
            }
        ],
        "flattenedThemes": [],
        "entities": [],
        "registry": [],
        "isRubricDriven": false,
        "enableQuestionReadOut": false,
        "captureGpsLocationAtQuestionLevel": false,
        "isAPrivateProgram": false,
        "allowMultipleAssessemts": false,
        "isDeleted": false,
        "deleted": false,
        "externalId": "99199aec-66b8-11eb-b81d-a08cfd79f8b7-OBSERVATION-TEMPLATE",
        "name": "Enrollment challenges in DIKSHA Courses",
        "description": "Survey Form to understand the challenges that the parents are facing in getting their children enrolled in DIKSHA courses ",
        "author": "",
        "levelToScoreMapping": {
            "L1": {
                "points": 100,
                "label": "Good"
            }
        },
        "scoringSystem": null,
        "noOfRatingLevels": 1,
        "entityTypeId": "5f32d8228e0dc83124040567",
        "entityType": "school",
        "updatedBy": "INITIALIZE",
        "createdAt": "2021-02-04T07:14:19.353Z",
        "updatedAt": "2021-02-04T09:42:12.853Z",
        "__v": 0,
        "type": "observation",
        "subType": "school",
        "frameworkId": "601bbed689149727d7d70bba",
        "frameworkExternalId": "99199aec-66b8-11eb-b81d-a08cfd79f8b7",
        "isReusable": true,
        "evidenceMethods": {
            "OB": {
                "externalId": "OB",
                "tip": "",
                "name": "Observation",
                "description": "",
                "modeOfCollection": "onfield",
                "canBeNotApplicable": 0,
                "notApplicable": 0,
                "canBeNotAllowed": 0,
                "remarks": ""
            }
        },
        "sections": {
            "S1": "Start Survey"
        }
    }}
    */

  /**
   * Details of the solution.
   * @method
   * @name getDetails
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {Object} Solution details
   */

  async getDetails(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.getDetails(req.params._id);

        solutionData['result'] = solutionData.data;

        return resolve(solutionData);
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
   * @api {post} /assessment/api/v1/solutions/uploadCriteriaRubricExpressions/{{solutionsExternalID}} Upload Rubric For Criteria Of Solutions
   * @apiVersion 1.0.0
   * @apiName Upload Rubric For Criteria Of Solutions
   * @apiGroup Solutions
   * @apiParam {File} criteria Mandatory file upload with criteria data.
   * @apiSampleRequest /assessment/api/v1/solutions/uploadCriteriaRubricExpressions/EF-DCPCR-2018-001
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Upload criteria rubric
   * @method
   * @name uploadCriteriaRubricExpressions
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution external id.
   * @returns {CSV}
   */

  async uploadCriteriaRubricExpressions(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionDocument = await database.models.solutions
          .findOne(
            {
              externalId: req.params._id,
            },
            { themes: 1, levelToScoreMapping: 1, type: 1, subType: 1 },
          )
          .lean();

        if (!solutionDocument) {
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        let criteriaData = await csv().fromString(req.files.criteria.data.toString());

        if (!criteriaData.length > 0) {
          throw new Error('Bad data.');
        }

        let solutionLevelKeys = new Array();

        Object.keys(solutionDocument.levelToScoreMapping).forEach((level) => {
          solutionLevelKeys.push(level);
        });

        let allCriteriaIdInSolution = new Array();
        let allCriteriaIdWithWeightageInSolution = {};
        let allCriteriaExternalIdToInternalIdMap = {};
        let allCriteriaInSolution = gen.utils.getCriteriaIdsAndWeightage(solutionDocument.themes);

        allCriteriaInSolution.forEach((eachCriteria) => {
          allCriteriaIdInSolution.push(eachCriteria.criteriaId);
          allCriteriaIdWithWeightageInSolution[eachCriteria.criteriaId.toString()] = {
            criteriaId: eachCriteria.criteriaId,
            weightage: eachCriteria.weightage,
          };
        });

        let allCriteriaDocuments = await database.models.criteria
          .find(
            {
              _id: {
                $in: allCriteriaIdInSolution,
              },
            },
            {
              _id: 1,
              externalId: 1,
              name: 1,
              description: 1,
              criteriaType: 1,
              rubric: 1,
            },
          )
          .lean();

        if (!allCriteriaDocuments || allCriteriaDocuments.length < 1) {
          criteriaData = criteriaData.map(function (criteriaRow) {
            criteriaRow.status = messageConstants.apiResponses.CRITERIA_NOT_FOUND;
            return criteriaRow;
          });
        } else {
          allCriteriaDocuments.forEach((criteriaDocument) => {
            allCriteriaExternalIdToInternalIdMap[criteriaDocument.externalId] = criteriaDocument;
          });
        }

        let allCriteriaRubricUpdatedSuccessfully = true;

        let criteriaWeightageToUpdate = new Array();

        if (Object.keys(allCriteriaExternalIdToInternalIdMap).length > 0) {
          criteriaData = await Promise.all(
            criteriaData.map(async (criteriaRow) => {
              criteriaRow = gen.utils.valueParser(criteriaRow);

              if (!allCriteriaExternalIdToInternalIdMap[criteriaRow.externalId]) {
                criteriaRow.status = messageConstants.apiResponses.INVALID_CRITERIA_ID;
                allCriteriaRubricUpdatedSuccessfully = false;
                return criteriaRow;
              }

              const criteriaId = allCriteriaExternalIdToInternalIdMap[criteriaRow.externalId]._id;

              let criteriaRubricUpdation = await criteriaHelper.setCriteriaRubricExpressions(
                criteriaId,
                allCriteriaExternalIdToInternalIdMap[criteriaRow.externalId],
                criteriaRow,
                solutionLevelKeys,
              );

              if (criteriaRubricUpdation.success) {
                criteriaRow.status = 'Success.';
              }

              if (
                criteriaRow.hasOwnProperty('weightage') &&
                allCriteriaIdWithWeightageInSolution[criteriaId.toString()].weightage != criteriaRow.weightage
              ) {
                criteriaWeightageToUpdate.push({
                  criteriaId: criteriaId,
                  weightage: criteriaRow.weightage,
                });
                allCriteriaIdWithWeightageInSolution[criteriaId.toString()] = {
                  criteriaId: criteriaId,
                  weightage: criteriaRow.weightage,
                };
              }

              return criteriaRow;
            }),
          );
        }

        let updateSubmissions = false;
        if (allCriteriaRubricUpdatedSuccessfully) {
          if (Object.keys(criteriaWeightageToUpdate).length > 0) {
            const solutionThemes = await solutionsHelper.updateCriteriaWeightageInThemes(
              solutionDocument.themes,
              criteriaWeightageToUpdate,
            );

            if (solutionThemes.success && solutionThemes.themes) {
              await database.models.solutions.findOneAndUpdate(
                { _id: solutionDocument._id },
                {
                  themes: solutionThemes.themes,
                  flattenedThemes: solutionThemes.flattenedThemes,
                  isRubricDriven: true,
                },
              );
              updateSubmissions = true;
            }
          } else {
            updateSubmissions = true;
          }
        }

        if (updateSubmissions) {
          let criteriaQuestionDocument = await database.models.criteriaQuestions.find({
            _id: { $in: allCriteriaIdInSolution },
          });

          let submissionDocumentCriterias = new Array();

          criteriaQuestionDocument.forEach((criteria) => {
            criteria.weightage = allCriteriaIdWithWeightageInSolution[criteria._id.toString()].weightage;
            submissionDocumentCriterias.push(
              _.omit(criteria._doc, ['resourceType', 'language', 'keywords', 'concepts', 'createdFor', 'evidences']),
            );
          });

          let updatedCriteriasObject = {};

          if (submissionDocumentCriterias.length > 0) {
            updatedCriteriasObject.$set = {
              criteria: submissionDocumentCriterias,
            };
          }

          let submissionCollectionToUpdate = '';

          if (updatedCriteriasObject.$set.criteria) {
            if (solutionDocument.type == 'observation') {
              submissionCollectionToUpdate = 'observationSubmissions';
            } else if (solutionDocument.type == 'assessment') {
              submissionCollectionToUpdate = 'submissions';
            }
          }

          if (submissionCollectionToUpdate != '') {
            await database.models[submissionCollectionToUpdate].updateMany(
              { solutionId: solutionDocument._id },
              updatedCriteriasObject,
            );
          }
        }

        const fileName = `Solution-Criteria-Rubric-Upload-Result`;
        let fileStream = new FileStream(fileName);
        let input = fileStream.initStream();

        (async function () {
          await fileStream.getProcessorPromise();
          return resolve({
            isResponseAStream: true,
            fileNameWithPath: fileStream.fileNameWithPath(),
          });
        })();

        for (let pointerToCriteriaRow = 0; pointerToCriteriaRow < criteriaData.length; pointerToCriteriaRow++) {
          input.push(criteriaData[pointerToCriteriaRow]);
        }

        input.push(null);
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
  * @api {get} /assessment/api/v1/solutions/questionList/:solutionInternalId Question List of a Solution
  * @apiVersion 1.0.0
  * @apiName Question List of a Solution
  * @apiGroup Solutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /assessment/api/v1/solutions/questionList/5b98fa069f664f7e1ae7498c
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Question list for solution fetched successfully.",
    "status": 200,
    "result": {
        "questions": [
            {
                "_id": "5be2b39789cc9c64df3efdd3",
                "question": [
                    "Are there any unnamed bottles lying around in school that may be harmful?",
                    "Some hindi text"
                ],
                "options": [
                    {
                        "value": "R1",
                        "label": "Yes"
                    },
                    {
                        "value": "R2",
                        "label": "No"
                    }
                ],
                "children": [],
                "questionGroup": [
                    "A1","A2","A4"
                ],
                "fileName": [],
                "instanceQuestions": [],
                "deleted": false,
                "tip": "",
                "externalId": "LW/SS/01",
                "visibleIf": "",
                "file": {
                    "required": "",
                    "type": [
                        ""
                    ],
                    "minCount": "",
                    "maxCount": "",
                    "caption": ""
                },
                "responseType": "radio",
                "validation": "true",
                "showRemarks": false,
                "isCompleted": false,
                "remarks": "",
                "value": "",
                "canBeNotApplicable": "false",
                "usedForScoring": "",
                "modeOfCollection": "onfield",
                "questionType": "auto",
                "accessibility": "local",
                "autoCapture": "",
                "dateFormat": "",
                "instanceIdentifier": "",
                "isAGeneralQuestion": false,
                "rubricLevel": "L2",
            }
        ]
      }
    }
  */

  /**
   * List of questions.
   * @method
   * @name questionList
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} List of questions in a solution.
   */

  async questionList(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let findQuery = {
          status: 'active',
          isDeleted: false,
          type: {
            $in: ['assessment', 'observation', 'survey'],
          },
        };

        let validateSolutionId = gen.utils.isValidMongoId(req.params._id);

        if (validateSolutionId) {
          findQuery['_id'] = req.params._id;
        } else {
          findQuery['externalId'] = req.params._id;
        }

        let projectionFields = ['name', 'themes', 'evidenceMethods', 'questionSequenceByEcm'];

        let solutionDocument = await solutionsHelper.solutionDocuments(findQuery, projectionFields);

        solutionDocument = solutionDocument[0];

        if (!solutionDocument) {
          throw new Error(messageConstants.apiResponses.SOLUTION_NOT_FOUND);
        }

        let activeECMCodes = new Array();
        let activeECMs = new Array();
        let checkEcmSequenceExists = true;

        Object.keys(solutionDocument.evidenceMethods).forEach((solutionEcm) => {
          if (!(solutionDocument.evidenceMethods[solutionEcm].isActive === false)) {
            activeECMCodes.push(solutionEcm);
            activeECMs.push(solutionDocument.evidenceMethods[solutionEcm]);
            if (solutionEcm['sequenceNo'] == undefined) {
              checkEcmSequenceExists = false;
            }
          }
        });

        if (checkEcmSequenceExists) {
          activeECMs = _.sortBy(activeECMs, 'sequenceNo');
        } else {
          activeECMs.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        }

        let criteriasIdArray = gen.utils.getCriteriaIds(solutionDocument.themes);

        let criteriaFindQuery = {
          _id: { $in: criteriasIdArray },
          evidences: { $elemMatch: { code: { $in: activeECMCodes } } },
        };

        let criteriaProjectionArray = [
          'name',
          'externalId',
          { evidences: { $elemMatch: { code: { $in: activeECMCodes } } } },
        ];

        let allCriteriaDocument = await criteriaHelper.criteriaDocument(criteriaFindQuery, criteriaProjectionArray);

        if (allCriteriaDocument.length < 1) {
          throw new Error(messageConstants.apiResponses.CRITERIA_NOT_FOUND);
        }

        let allQuestionIdsInCrtieria = gen.utils.getAllQuestionId(allCriteriaDocument);

        if (allQuestionIdsInCrtieria.length < 1) {
          throw new Error(messageConstants.apiResponses.CRITERIA_QUESTION_NOT_FOUND);
        }

        let allQuestionDocuments = await questionsHelper.questionDocument({
          _id: { $in: allQuestionIdsInCrtieria },
        });

        if (allQuestionDocuments.length < 1) {
          throw new Error(messageConstants.apiResponses.QUESTION_NOT_FOUND);
        }

        let matrixQuestions = new Array();
        let questionMapOfExternalIdToInternalId = {};
        let questionMapByInternalId = {};

        allQuestionDocuments.forEach((question) => {
          // Remove weightage of each question from being sent to client.
          if (question.weightage) {
            delete question['weightage'];
          }

          // Remove score from each option from being sent to client.
          if (question.options && question.options.length > 0) {
            question.options.forEach((option) => {
              if (option.score) {
                delete option.score;
              }
            });
          }

          if (question.responseType === 'matrix') {
            matrixQuestions.push(question);
          }

          questionMapOfExternalIdToInternalId[question.externalId] = question._id.toString();
          questionMapByInternalId[question._id.toString()] = question;
        });

        matrixQuestions.forEach((matrixQuestion) => {
          for (
            let pointerToInstanceQuestionsArray = 0;
            pointerToInstanceQuestionsArray < matrixQuestion.instanceQuestions.length;
            pointerToInstanceQuestionsArray++
          ) {
            const instanceChildQuestionId =
              matrixQuestion.instanceQuestions[pointerToInstanceQuestionsArray].toString();
            if (questionMapByInternalId[instanceChildQuestionId]) {
              matrixQuestion.instanceQuestions[pointerToInstanceQuestionsArray] = _.cloneDeep(
                questionMapByInternalId[instanceChildQuestionId],
              );
              delete questionMapByInternalId[instanceChildQuestionId];
            }
          }
          questionMapByInternalId[matrixQuestion._id.toString()] = matrixQuestion;
        });

        let questionList = new Array();

        if (solutionDocument.questionSequenceByEcm) {
          for (let pointerToActiveECMs = 0; pointerToActiveECMs < activeECMs.length; pointerToActiveECMs++) {
            const ecmCode = activeECMs[pointerToActiveECMs];
            if (solutionDocument.questionSequenceByEcm[ecmCode]) {
              for (const [sectionCode, sectionQuestionIds] of Object.entries(
                solutionDocument.questionSequenceByEcm[ecmCode],
              )) {
                for (
                  let pointerToSectionQuestions = 0;
                  pointerToSectionQuestions < sectionQuestionIds.length;
                  pointerToSectionQuestions++
                ) {
                  const externalId = sectionQuestionIds[pointerToSectionQuestions];
                  if (
                    questionMapOfExternalIdToInternalId[externalId] &&
                    questionMapByInternalId[questionMapOfExternalIdToInternalId[externalId]]
                  ) {
                    questionList.push(questionMapByInternalId[questionMapOfExternalIdToInternalId[externalId]]);
                    delete questionMapByInternalId[questionMapOfExternalIdToInternalId[externalId]];
                  }
                }
              }
            }
          }
        }

        questionList.push(...Object.values(questionMapByInternalId));

        return resolve({
          message: `Question list for solution ${solutionDocument.name} fetched successfully.`,
          result: {
            questions: questionList,
          },
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
   * @api {post} /assessment/api/v1/solutions/importFromSolution?solutionId:solutionExternalId
   * Create duplicate solution.
   * @apiVersion 0.0.1
   * @apiName Create duplicate solution.
   * @apiGroup Solutions
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParam {String} solutionId Solution External ID.
   * @apiParamExample {json} Request-Body:
   * {
   * "externalId": ""
   * "name": "",
   * "description": ""
   * "programExternalId": ""
   * }
   * @apiSampleRequest /assessment/api/v1/solutions/importFromSolution?solutionId=Mantra-STL-2019-001
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Import duplicate solution.
   * @method
   * @name importFromSolution
   * @param {Object} req - requested data.
   * @param {String} req.query.solutionId - solution external id.
   * @param {String} req.body.programExternalId - program external id.
   * @param {String} req.body.externalId - Duplicate solution external id.
   * @param {String} req.body.name - Duplicate solution name.
   * @param {String} req.body.description - Duplicate solution description.
   * @param {String} req.userDetails.id - logged in user id.
   * @returns {JSON} Solution imported data.
   */

  async importFromSolution(req) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!req.body) {
          let responseMessage = messageConstants.apiResponses.BODY_NOT_EMPTY;
          return resolve({
            status: httpStatusCode.bad_request.status,
            message: responseMessage,
          });
        }

        let duplicateSolution = await solutionsHelper.importFromSolution(
          req.query.solutionId,
          req.userDetails.userId,
          req.body,
        );

        return resolve({
          message: messageConstants.apiResponses.DUPLICATE_SOLUTION,
          result: _.pick(duplicateSolution, ['_id']),
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
  * @api {get} /assessment/api/v1/solutions/fetchLink/:solutionId
  * @apiVersion 1.0.0
  * @apiName Get link by solution id
  * @apiGroup Solutions
  * @apiSampleRequest /assessment/api/v1/solutions/5fa28620b6bd9b757dc4e932
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solution Link generated successfully",
    "status": 200,
    "result": "https://dev.sunbirded.org/manage-learn/create-observation/38cd93bdb87489c3890fe0ab00e7d406"
    }
  */
  /**
   * Get link by solution id
   * @method
   * @name fetchLink
   * @param {String} solutionId - solution Id.
   * @param {String} appName - app Name.
   * @param {String} userId - user Id.
   * @returns {Object} - Details of the solution.
   */

  static fetchLink(solutionId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await this.solutionDocuments(
          {
            _id: solutionId,
            isReusable: false,
            isAPrivateProgram: false,
          },
          ['link', 'type', 'author'],
        );

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            message: constants.apiResponses.SOLUTION_NOT_FOUND,
            result: {},
          });
        }

        let prefix = constants.common.PREFIX_FOR_SOLUTION_LINK;

        let solutionLink, link;

        if (!solutionData[0].link) {
          let updateLink = await gen.utils.md5Hash(solutionData[0]._id + '###' + solutionData[0].author);

          let updateSolution = await this.update(solutionId, { link: updateLink }, userId);

          solutionLink = updateLink;
        } else {
          solutionLink = solutionData[0].link;
        }

        link = _generateLink(appsPortalBaseUrl, prefix, solutionLink, solutionData[0].type);

        return resolve({
          success: true,
          message: constants.apiResponses.LINK_GENERATED,
          result: link,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status ? error.status : httpStatusCode['internal_server_error'].status,
          message: error.message,
        });
      }
    });
  }

  /**
  * @api {get} /assessment/api/v1/solutions/fetchLink/:solutionId
  * @apiVersion 1.0.0
  * @apiName Get link by solution id
  * @apiGroup Solutions
  * @apiSampleRequest /assessment/api/v1/solutions/5fa28620b6bd9b757dc4e932
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solution Link generated successfully",
    "status": 200,
    "result": "https://dev.sunbirded.org/manage-learn/create-observation/38cd93bdb87489c3890fe0ab00e7d406"
    }
  */

  /**
   * Get link by solution id.
   * @method
   * @name fetchLink
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution Id
   * @returns {Array}
   */

  async fetchLink(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.fetchLink(req.params._id, req.userDetails.userId);

        return resolve(solutionData);
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
  * @api {get} /assessment/api/v1/solutions/delete/{{solutionId}} Delete solution .
  * @apiVersion 1.0.0
  * @apiName Delete Solution.
  * @apiGroup Solutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiParam {String} solutionId Solution Intenal ID.
  * @apiSampleRequest /assessment/api/v1/solutions/delete/5f64601df5f6e432fe0f0575
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
      "message": "Solution deleted successfully.",
      "status": 200,
      "result": "5f64601df5f6e432fe0f0575"
    }
  */

  /**
   * Delete Solution.
   * @method
   * @name deleteSolution
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solutiion internal id.
   * @returns {JSON} consists of solution id.
   */

  async delete(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solution = await solutionsHelper.delete(req.params._id, req.userDetails.userId);
        return resolve(solution);
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
  * @api {get} /assessment/api/v1/solutions/moveToTrash/{{solutionId}} Solution Move to Trash .
  * @apiVersion 1.0.0
  * @apiName Solution Move To Trash .
  * @apiGroup Solutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiParam {String} solutionId Solution Intenal ID.
  * @apiSampleRequest /assessment/api/v1/solutions/moveToTrash/5f64601df5f6e432fe0f0575
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
      "message": "Your solution has been moved to Trash.",
      "status": 200,
      "result": "5f64601df5f6e432fe0f0575"
    }
  */

  /**
   * Solution Move To Trash.
   * @method
   * @name moveToTrash
   * @param {String} req.params._id - solutiion external id.
   * @returns {JSON} consists of solution id.
   */

  async moveToTrash(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let trashSolution = await solutionsHelper.moveToTrash(req.params._id, req.userDetails.userId);
        return resolve(trashSolution);
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
  * @api {get} /assessment/api/v1/solutions/restoreFromTrash/{{solutionId}} Solution Restore FRom Trash .
  * @apiVersion 1.0.0
  * @apiName Solution Restore From Trash.
  * @apiGroup Solutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiParam {String} solutionId Solution Intenal ID.
  * @apiSampleRequest /assessment/api/v1/solutions/restoreFromTrash/5f64601df5f6e432fe0f0575
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
      "message": "Solution restored successfully.",
      "status": 200,
      "result": "5f64601df5f6e432fe0f0575"
    }
  */

  /**
   * Solution Restore From Trash.
   * @method
   * @name restoreFromTrash
   * @param {String} req.params._id - solutiion external id.
   * @returns {JSON} consists of solution id.
   */

  async restoreFromTrash(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let restoreSolution = await solutionsHelper.restoreFromTrash(req.params._id, req.userDetails.userId);
        return resolve(restoreSolution);
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
  * @api {get} /assessment/api/v1/solutions/trashList Solution Trash List .
  * @apiVersion 1.0.0
  * @apiName Solution Trash List.
  * @apiGroup Solutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /assessment/api/v1/solutions/trashList
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
      "message": "Trash Solution fetched successfully.",
      "status": 200,
      "result": [
          {
              "_id": "5f64601df5f6e432fe0f0575",
              "externalId": "AFRICA-ME-TEST-FRAMEWORK",
              "name": "AFRICA-ME-TEST-FRAMEWORK"
          },
          {
              "_id": "5f64651f916c13367d8ff83f",
              "externalId": "PRIYANKA-3-FRAMWORK-OBSERVATION-1",
              "name": "Priyanka Observation solution"
          }
      ]
    }
  */

  /**
   * Solution Trash List
   * @method
   * @name trashList
   * @returns {JSON} Trash List
   */

  async trashList(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let trashData = await solutionsHelper.trashList(req.userDetails.userId);
        return resolve(trashData);
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
  * @api {get} /assessment/api/v1/solutions/removeFromHomeScreen/{{solutionId}} Solution Remove From Library .
  * @apiVersion 1.0.0
  * @apiName Solution Remove From Home screen .
  * @apiGroup Solutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiParam {String} solutionId Solution Internal ID.
  * @apiSampleRequest /assessment/api/v1/solutions/removeFromHomeScreen/5f64601df5f6e432fe0f0575
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
      "message": "Your solution has been removed.",
      "status": 200,
      "result": "5f64601df5f6e432fe0f0575"
    }
  */

  /**
   * Solution Remove From Home screen.
   * @method
   * @name removeFromHomeScreen
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solutiion external id.
   * @returns {JSON} consists of solution id.
   */

  async removeFromHomeScreen(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let removeSolution = await solutionsHelper.removeFromHome(req.params._id, req.userDetails.userId);
        return resolve(removeSolution);
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
    * @api {get} /assessment/api/v1/solutions/getObservationSolutionLink/{{observationsolutionId}}?appName:appName 
    * @apiVersion 1.0.0
    * @apiName Get observation shareable link
    * @apiGroup Solutions
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {String} observationsolutionId Observation Solution External ID.
    * @apiParam {String} appName Name of App.
    * @apiSampleRequest /assessment/api/v1/observations/getObservationSolutionLink/Mid-day_Meal_SMC_Observation-Aug2019?appName=samiksha
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    {
      "message": "Observation Link generated successfully",
      "status": 200,
      "result": "https://apps.shikshalokam.org/samiksha/create-observation/38cd93bdb87489c3890fe0ab00e7d406"
    }
    */
  /**
   * Get Observation Solution Sharing Link.
   * @method
   * @name getObservationSolutionLink
   * @param {Object} req -request Data.
   * @param {String} req.params._id - observation solution externalId.
   * @param {String} req.query.appName - app Name.
   * @returns {JSON}
   */

  async getObservationSolutionLink(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let observationSolutionDetails = await observationsHelper.getObservationLink(req.params._id, req.query.appName);
        return resolve(observationSolutionDetails);
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
    * @api {post} /assessment/api/v1/solutions/verifyLink/{{link}} Verify Observation Link And get details
    * @apiVersion 1.0.0
    * @apiName Verify Observation Solution Link
    * @apiGroup Solutions
     * @apiParamExample {json} Request-Body:
    * {
        "role" : "HM",
   		  "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
      }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {String} link Observation Solution Link.
    * @apiSampleRequest /assessment/api/v1/solutions/verifyLink/38cd93bdb87489c3890fe0ab00e7d406
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    {
        "message": "Observation solution link verified successfully",
        "status": 200,
        "result": [
            {
                "_id": "5f6853f293734140ccce90cf",
                "entities": [
                    "5f636fa2916c13367d8ff835"
                ],
                "createdFor": [],
                "rootOrganisations": [],
                "isAPrivateProgram": false,
                "deleted": false,
                "status": "published",
                "solutionId": "5f64651f916c13367d8ff83f",
                "solutionExternalId": "PRIYANKA-3-FRAMWORK-OBSERVATION-1",
                "programId": "5f634e31577d2ce1ed942c65",
                "programExternalId": "MY-ASSESSMENT-PROGRAM2",
                "frameworkId": "5f6349c4577d2ce1ed942a56",
                "frameworkExternalId": "PRIYANKA-3-FRAMWORK",
                "entityTypeId": "5d15a959e9185967a6d5e8a6",
                "entityType": "school",
                "createdBy": "01c04166-a65e-4e92-a87b-a9e4194e771d",
                "startDate": "2020-09-21T07:19:14.618Z",
                "endDate": "2021-09-21T07:19:14.618Z",
                "name": "Priyanka Observation solution",
                "description": "Priyanka Observation description",
                "updatedAt": "2020-09-21T07:19:14.648Z",
                "createdAt": "2020-09-21T07:19:14.648Z",
                "__v": 0,
                "link": "a325411f49158bc21b7f08d33aad5c02"
            }
        ]
    }
    */

  /**
   * Verify Observation Solution Link.
   * @method
   * @name verifyLink
   * @param {Object} req request data
   * @param {String} req.params._id observation solution link.
   * @returns {JSON} observation data.
   */

  async verifyLink(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await observationsHelper.verifyLink(
          req.params._id,
          req.rspObj.userToken,
          req.userDetails.userId,
          req.body,
        );

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
   * @api {post} /assessment/api/v1/solutions/addEntities/:solutionId Add entity to solution
   * @apiVersion 1.0.0
   * @apiName Add entity to solution
   * @apiGroup Solutions
   * @apiParamExample {json} Request-Body:
   * {
   *	    "entities": ["5beaa888af0065f0e0a10515","5beaa888af0065f0e0a10516"]
   * }
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /assessment/api/v1/solutions/addEntities/5f64601df5f6e432fe0f0575
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   *   "message" : "Entities updated successfully."
   * }
   */

  /**
   * Add entity to solution.
   * @method
   * @name addEntities
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} consists message of successfully mapped entities
   */

  async addEntities(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.addEntityToSolution(req.params._id, req.body.entities);

        return resolve(solutionData);
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
    * @api {post} /assessment/api/v1/solutions/list list of solutions
    * @apiVersion 1.0.0
    * @apiName List solutions
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    *	    "solutionIds": ["EF-DCPCR-2018-001"]
    * }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/solutions/list
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Solutions fetched successfully",
    "status": 200,
    "result": [
        {
            "_id": "5b98fa069f664f7e1ae7498c",
            "externalId": "EF-DCPCR-2018-001",
            "name": "DCPCR Assessment Framework 2018",
            "description": "DCPCR Assessment Framework 2018",
            "author": "a082787f-8f8f-42f2-a706-35457ca6f1fd",
            "resourceType": [
                "Assessment Framework"
            ],
            "language": [
                "English"
            ],
            "keywords": [
                "Framework",
                "Assessment"
            ],
            "concepts": [],
            "createdFor": [
                "0125747659358699520",
                "0125748495625912324"
            ],
            "isReusable": false,
            "isRubricDriven": true,
            "entityTypeId": "5d15a959e9185967a6d5e8a6",
            "entityType": "school",
            "type": "assessment",
            "subType": "institutional",
            "programId": "5b98d7b6d4f87f317ff615ee",
            "programExternalId": "PROGID01",
            "programName": "DCPCR School Development Index 2018-19",
            "programDescription": "DCPCR School Development Index 2018-19",
            "startDate": "2018-06-28T06:03:48.590Z",
            "endDate": "2020-06-28T06:03:48.591Z",
            "status": "active",
            "isDeleted": false,
            "updatedBy": "01c04166-a65e-4e92-a87b-a9e4194e771d",
            "createdBy": "INITIALIZE",
            "createdAt": "2019-06-28T06:03:48.616Z",
            "updatedAt": "2020-11-25T16:33:38.777Z",
            "registry": [
                "parent"
            ],
            "frameworkExternalId": "EF-DCPCR-2018-001",
            "frameworkId": "5d15adc5fad01368a494cbd6",
            "parentSolutionId": "5d15b0d7463d3a6961f91742",
            "isAPrivateProgram": false,
            "projectId": "5fba54dc5bf46b25a926bee5",
            "taskId": "ce75a3aa-57e5-4377-b582-5c575f73ecec",
            "project": {
                "_id": "5fbe2b964006cc174d10960c",
                "taskId": "4c012b20-1b18-42b7-9cca-8f6ccb255e04"
            }
        }
    ]
  }
    */

  /**
   * List of solutions.
   * @method
   * @name list
   * @param {Object} req - requested data.
   * @returns {Array} List of solutions.
   */

  // async list(req) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       // let solutionData = await      .list(req.body.solutionIds);
  //       let solutionData = await solutionsHelper.list();
  //       solutionData.result = solutionData.data;

  //       return resolve(solutionData);
  //     } catch (error) {
  //       return reject({
  //         status: error.status || httpStatusCode.internal_server_error.status,
  //         message: error.message || httpStatusCode.internal_server_error.message,
  //         errorObject: error,
  //       });
  //     }
  //   });
  // }
  async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.list(
          req.query.type,
          req.query.subType ? req.query.subType : '',
          req.body,
          req.pageNo,
          req.pageSize,
          req.searchText,
        );

        solutionData['result'] = solutionData.data;

        return resolve(solutionData);
      } catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

  /**
   * @api {post} /assessment/api/v1/solutions/removeEntities/:solutionId Add entity to solution
   * @apiVersion 1.0.0
   * @apiName Add entity to solution
   * @apiGroup Solutions
   * @apiParamExample {json} Request-Body:
   * {
   *	    "entities": ["5beaa888af0065f0e0a10515"]
   * }
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /assessment/api/v1/solutions/removeEntities/5f64601df5f6e432fe0f0575
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   *   "message" : "Entities updated successfully."
   * }
   */

  /**
   * Add entity to solution.
   * @method
   * @name removeEntities
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} consists message of successfully mapped entities
   */

  async removeEntities(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.removeEntities(req.params._id, req.body.entities);

        return resolve(solutionData);
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
   * @api {post} /assessment/api/v1/solutions/deleteCriteria/{solutionsExternalID} Delete Criteria From Solution
   * @apiVersion 1.0.0
   * @apiName Delete Criteria From Solution
   * @apiGroup Solutions
   * @apiParam {File} themes Mandatory file upload with themes data.
   * @apiSampleRequest /assessment/api/v1/solutions/deleteCriteria/EF-DCPCR-2018-001
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
   *     "criteriaIds": ["5beaa888af0065f0e0a10515",5be15cc849e0121f01b21805]
   * }
   * @apiUse successBody
   * @apiUse errorBody
   */

  /**
   * Delete Criteria From Solution.
   * @method
   * @name deleteCriteria
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution external id.
   */

  async deleteCriteria(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionThemes = await solutionsHelper.deleteCriteria(req.params._id, req.body.criteriaIds);
        return resolve(solutionThemes);
      } catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }
};
