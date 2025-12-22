/**
 * name : solutionUtils.js
 * author : Praveen Dass
 * Date : 18-July-2025
 * Description:
 * This file contains solutions helper functions that were extracted
 * from solutions module to resolve circular dependency issues.
 *
 * Only use this file for shared logic that leads to
 * circular dependencies when placed in the solutions module.
 */




const solutionsQueries = require(DB_QUERY_BASE_PATH + '/solutions');
const projectService = require(ROOT_PATH + '/generics/services/project');
const criteriaHelper = require(MODULES_BASE_PATH + '/criteria/helper');
const programsHelper = require(MODULES_BASE_PATH + '/programs/helper');
const entitiesHelper = require(MODULES_BASE_PATH + '/entities/helper');

  /**
   * Check if the solution is rubric driven i.e isRubricDriven flag as true is present
   * in solution or not
   * @method
   * @name checkIfSolutionIsRubricDriven
   * @param {String} solutionId - solution id.
   * @returns {JSON} Solution document.
   */

  function checkIfSolutionIsRubricDriven(solutionId) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionDocument = await solutionsQueries.solutionDocuments(
          {
            _id: solutionId,
            scoringSystem: {
              $exists: true,
              $ne: '',
            },
            isRubricDriven: true,
          },
          ['scoringSystem']
        );
        return resolve(solutionDocument);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Create solution and program from solution templates.
   * @method
   * @name createProgramAndSolutionFromTemplate -
   * @param {String} templateId - solution template id.
   * @param {Object} program
   * @param {String} program._id - program id
   * @param {String} program.name - program name
   * @param {String} userId - Logged in user id.
   * @param {Object} solutionData - new solution creation data
   * @param {Boolean} [isAPrivateProgram=false] - Whether the created program is private.
   * @param {Array} [createdFor=[]] - List of entities for which the program/solution is created.
   * @param {String} requestingUserAuthToken - Auth token of the requesting user.
   * @param {Object} tenantData - Tenant-specific information.
   * @param {Object} userDetails - Details of the logged-in user.
   * @returns {Object} Created solution and program
   */

  function createProgramAndSolutionFromTemplate(
    templateId,
    program,
    userId,
    solutionData,
    isAPrivateProgram = false,
    createdFor = [],
    requestingUserAuthToken,
    tenantData,
    userDetails
    // rootOrganisations = []
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        // let dateFormat = gen.utils.epochTime();
        // let programData;

        // if (program._id === "") {
        //   programData = await programsHelper.create({
        //     externalId: program.name
        //       ? program.name + "-" + dateFormat
        //       : solutionData.name + "-" + dateFormat,

        //     description: solutionData.description,
        //     name: program.name ? program.name : solutionData.name,
        //     userId: userId,
        //     isAPrivateProgram: isAPrivateProgram,
        //     createdFor: createdFor,
        //     rootOrganisations: rootOrganisations,
        //   });

        //   program._id = programData._id;
        // }

        // need to handle survey and observation both in the same function we will have solutionData.type which will contains type of resource
        let duplicateSolution = await this.importFromSolution(
          templateId,
          program._id ? program._id.toString() : '',
          userId,
          solutionData,
          createdFor,
          tenantData,
          requestingUserAuthToken,
          userDetails
          // rootOrganisations
        );

        return resolve(
          _.pick(duplicateSolution, [
            '_id',
            'externalId',
            'frameworkExternalId',
            'frameworkId',
            'programExternalId',
            'programId',
            'entityTypeId',
            'entityType',
            'isAPrivateProgram',
            'entities',
            'startDate',
            'endDate',
            'project',
            'referenceFrom',
            'isExternalProgram',
            'type',
            'minNoOfSubmissionsRequired',
            'isReusable',
            'name',
          ])
        );
      } catch (error) {
        return reject(error);
      }
    });
  }
      /**
   * Create a new solution from existing solution.
   * @method
   * @name importFromSolution -
   * @param {String} solutionId - solution id.
   * @param {String} programId - program id.
   * @param {String} userId - logged in user id.
   * @param {Object} data - new solution data.
   * @param {String} isReusable - new solution isReusable value.
   * @param {String} createdFor - createdFor value.
   * @param {String} requestingUserAuthToken -authToken
   * @param {Object} tenantData =Tenant and orgData
   * @returns {Object} New solution information
   */

  function importFromSolution(
    solutionId,
    programId,
    userId,
    data,
    createdFor = '',
    tenantData,
    requestingUserAuthToken,
    userDetails
    // rootOrganisations = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let validateSolutionId = gen.utils.isValidMongoId(solutionId);
        let solutionQuery = {};

        if (validateSolutionId) {
          solutionQuery['_id'] = solutionId;
        } else {
          solutionQuery['externalId'] = solutionId;
        }

        solutionQuery['tenantId'] = tenantData.tenantId;

        let solutionDocument = await solutionsQueries.solutionDocuments(solutionQuery);

        if (!solutionDocument[0]) {
          throw {
            message: messageConstants.apiResponses.SOLUTION_NOT_FOUND,
          };
        }
        let newSolutionDocument = _.cloneDeep(solutionDocument[0]);
        let programQuery = {};
        let programDocument;
        if (programId) {
          if (newSolutionDocument.isExternalProgram) {
            programDocument = await projectService.programDetails(requestingUserAuthToken, programId, userDetails,tenantData);
            if (programDocument.status != httpStatusCode.ok.status || !programDocument?.result?._id) {
              throw {
                status: httpStatusCode.bad_request.status,
                message: messageConstants.apiResponses.PROGRAM_NOT_FOUND,
              };
            }
            programDocument = programDocument.result;
          } else {
            programQuery[gen.utils.isValidMongoId(programId) ? '_id' : 'externalId'] = programId;
            programQuery['tenantId'] = tenantData.tenantId;
            /*
            arguments passed to programsHelper.list() are:
            - filter: { externalId: { $in: Array.from(allProgramIds) } }
            - projection: ['_id', 'externalId']
            - sort: ''
            - skip: ''
            - limit: ''
            */
            programDocument = await programsHelper.list(
              programQuery,
              ['externalId', 'name', 'description', 'isAPrivateProgram','components'],
              '',
              '',
              ''
            );
            programDocument = programDocument?.data?.data?.[0];
          }
          if (programDocument) {
            Object.assign(newSolutionDocument, {
              programId: programDocument._id,
              programExternalId: programDocument.externalId,
              programName: programDocument.name,
              programDescription: programDocument.description,
            });
          }
        }
        let duplicateCriteriasResponse = await criteriaHelper.duplicate(newSolutionDocument.themes, tenantData,userDetails,programId,newSolutionDocument.isExternalProgram,newSolutionDocument.entityType);
        if (!duplicateCriteriasResponse.success) {
          throw {
            message: duplicateCriteriasResponse.message ,
            status: duplicateCriteriasResponse.status || httpStatusCode.bad_request.status
          };
        }
        
        let criteriaIdMap = {};
        let questionExternalIdMap = {};
        if (
          duplicateCriteriasResponse.success &&
          Object.keys(duplicateCriteriasResponse.data.criteriaIdMap).length > 0
        ) {
          criteriaIdMap = duplicateCriteriasResponse.data.criteriaIdMap;
        }

        if (
          duplicateCriteriasResponse.success &&
          Object.keys(duplicateCriteriasResponse.data.questionExternalIdMap).length > 0
        ) {
          questionExternalIdMap = duplicateCriteriasResponse.data.questionExternalIdMap;
        }

        let updateThemes = function (themes) {
          themes.forEach((theme) => {
            let criteriaIdArray = new Array();
            let themeCriteriaToSet = new Array();
            if (theme.children) {
              updateThemes(theme.children);
            } else {
              criteriaIdArray = theme.criteria;
              criteriaIdArray.forEach((eachCriteria) => {
                eachCriteria.criteriaId = criteriaIdMap[eachCriteria.criteriaId.toString()]
                  ? criteriaIdMap[eachCriteria.criteriaId.toString()]
                  : eachCriteria.criteriaId;
                themeCriteriaToSet.push(eachCriteria);
              });
              theme.criteria = themeCriteriaToSet;
            }
          });
          return true;
        };

        updateThemes(newSolutionDocument.themes);
        // Replace criteria ids in flattend themes key
        if (
          newSolutionDocument['flattenedThemes'] &&
          Array.isArray(newSolutionDocument['flattenedThemes']) &&
          newSolutionDocument['flattenedThemes'].length > 0
        ) {
          for (
            let pointerToFlattenedThemesArray = 0;
            pointerToFlattenedThemesArray < newSolutionDocument['flattenedThemes'].length;
            pointerToFlattenedThemesArray++
          ) {
            let theme = newSolutionDocument['flattenedThemes'][pointerToFlattenedThemesArray];
            if (theme.criteria && Array.isArray(theme.criteria) && theme.criteria.length > 0) {
              for (
                let pointerToThemeCriteriaArray = 0;
                pointerToThemeCriteriaArray < theme.criteria.length;
                pointerToThemeCriteriaArray++
              ) {
                let criteria = theme.criteria[pointerToThemeCriteriaArray];
                if (criteriaIdMap[criteria.criteriaId.toString()]) {
                  newSolutionDocument['flattenedThemes'][pointerToFlattenedThemesArray].criteria[
                    pointerToThemeCriteriaArray
                  ].criteriaId = criteriaIdMap[criteria.criteriaId.toString()];
                }
              }
            }
          }
        }
        let startDate = new Date();

        if (
          newSolutionDocument['questionSequenceByEcm'] &&
          Object.keys(newSolutionDocument.questionSequenceByEcm).length > 0
        ) {
          Object.keys(newSolutionDocument.questionSequenceByEcm).map((evidence) => {
            Object.keys(newSolutionDocument.questionSequenceByEcm[evidence]).map((section) => {
              let questionExternalIds = newSolutionDocument.questionSequenceByEcm[evidence][section];
              let newQuestionExternalIds = [];
              questionExternalIds.map((questionExternalId) => {
                if (questionExternalIdMap[questionExternalId]) {
                  newQuestionExternalIds.push(questionExternalIdMap[questionExternalId]);
                }
              });
              newSolutionDocument.questionSequenceByEcm[evidence][section] = newQuestionExternalIds;
            });
          });
        }
        if (data.entities && data.entities.length > 0) {
          let entitiesToAdd = await entitiesHelper.validateEntities(data.entities, solutionDocument[0].entityTypeId);

          data.entities = entitiesToAdd.entityIds;
        }

        newSolutionDocument.externalId = data.externalId
          ? data.externalId
          : solutionDocument[0].externalId + '-' + gen.utils.epochTime();
        newSolutionDocument.name = data.name;
        newSolutionDocument.description = data.description;
        newSolutionDocument.author = userId;
        newSolutionDocument.createdBy = userId;
        newSolutionDocument.entities = data.entities;
        newSolutionDocument.parentSolutionId = solutionDocument[0]._id;
        newSolutionDocument.createdAt = startDate;
        newSolutionDocument.updatedAt = startDate;
        newSolutionDocument.isAPrivateProgram = false;
        newSolutionDocument.isReusable = false;

        if (data?.project) {
          newSolutionDocument['project'] = data.project;
          newSolutionDocument['referenceFrom'] = messageConstants.common.PROJECT;
        }

        if (createdFor !== '') {
          newSolutionDocument.createdFor = createdFor;
        }

        // if (rootOrganisations !== '') {
        //   newSolutionDocument.rootOrganisations = rootOrganisations;
        // }

        let duplicateSolutionDocument = await solutionsQueries.createSolution(_.omit(newSolutionDocument, ['_id']));
        
        if (duplicateSolutionDocument._id) {
          if (data.scope && Object.keys(data.scope).length > 0) {
            data.scope.organizations = tenantData.orgId;
            
            await this.setScope(
              // newSolutionDocument.programId,
              newSolutionDocument.programId ? newSolutionDocument.programId : '',
              duplicateSolutionDocument._id,
              data.scope,
              userDetails
            );
          }

          if (duplicateSolutionDocument.type == messageConstants.common.OBSERVATION) {
            let link = await gen.utils.md5Hash(duplicateSolutionDocument._id + '###' + userId);

            await solutionsQueries.updateSolutionDocument(
              { _id: duplicateSolutionDocument._id },
              { $set: { link: link } }
            );
          }

          if (programDocument) {
            if (!newSolutionDocument.isExternalProgram) {
              let currentComponents = programDocument?.components || [];
              let programUpdate = await database.models.programs.updateOne(
                { _id: programDocument._id },
                { $addToSet: { components: {_id:duplicateSolutionDocument._id,order:currentComponents.length + 1} } }
              );
              if (programUpdate.modifiedCount === 0) {
                throw {
                  message: messageConstants.apiResponses.PROGRAM_UPDATE_FAILED,
                };
              }
            }else if(newSolutionDocument.isExternalProgram == true && newSolutionDocument.referenceFrom !== 'project'){
              //call project service to update program components
              let newprogramDocument = await projectService.programDetails(requestingUserAuthToken, programId, userDetails,tenantData);
              let currentComponents = newprogramDocument?.result.components || [];
              let programUpdateStatus = await projectService.programUpdate(requestingUserAuthToken, programDocument._id,{components:[{_id:duplicateSolutionDocument._id,order:currentComponents.length + 1}]},tenantData, userDetails);              
              if( !programUpdateStatus || !programUpdateStatus.success) {
                throw {
                  message: messageConstants.apiResponses.PROGRAM_UPDATE_FAILED,
                };
              }

            }
          }
          const response = {
            duplicateSolutionDocument,
            projectTemplateDetails : duplicateCriteriasResponse.data.projectTemplateDetails
          }
          return resolve(response)
        } else {
          throw {
            message: messageConstants.apiResponses.ERROR_CREATING_DUPLICATE,
          };
        }
      } catch (error) {
        return reject(error);
      }
    });
  }
  

  module.exports = {
    checkIfSolutionIsRubricDriven:checkIfSolutionIsRubricDriven,
    createProgramAndSolutionFromTemplate:createProgramAndSolutionFromTemplate,
    importFromSolution:importFromSolution
  }