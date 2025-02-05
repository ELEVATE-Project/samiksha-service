const { ObjectId } = require('mongodb');

const {
    entities,
    entityType,
    userRoleExtension
} = require('./entity_sampleData.js');
const {getEndDate}= require('./common')
let solutionData = [
{
    "_id" : new ObjectId("66f4e62d8ea984c17a5b374a"),
    "externalId" : "606d92fa-42d8-11ec-ac61-26092024-1011-OBSERVATION-TEMPLATE",
    "isReusable" : true,
    "name" : "NISHTHA 2.0 Feedback Form",
    "description" : "NISHTHA 2.0 feedback form",
    "author" : "1",
    "resourceType" : [ 
        "Observations Framework"
    ],
    "language" : [ 
        "English"
    ],
    "keywords" : [ 
        "Framework", 
        "Observation", 
        "Feedback form"
    ],
    "concepts" : [],
    "scoringSystem" : null,
    "levelToScoreMapping" : {
        "L1" : {
            "points" : 100,
            "label" : "Good"
        }
    },
    "themes" : [ 
        {
            "type" : "theme",
            "label" : "theme",
            "name" : "Observation Theme",
            "externalId" : "OB",
            "weightage" : 100,
            "criteria" : [ 
                {
                    "criteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748"),
                    "weightage" : 100
                }
            ]
        }
    ],
    "flattenedThemes" : [],
    "entityType" : "state",
    "type" : "observation",
    "subType" : "",
    "entities" : [],
    "registry" : [],
    "frameworkId" : new ObjectId("66f4e6208ea984c17a5b3744"),
    "frameworkExternalId" : "606d92fa-42d8-11ec-ac61-26092024-1011",
    "noOfRatingLevels" : 1,
    "isRubricDriven" : false,
    "enableQuestionReadOut" : false,
    "updatedBy" : "2",
    "captureGpsLocationAtQuestionLevel" : false,
    "isAPrivateProgram" : false,
    "allowMultipleAssessemts" : false,
    "isDeleted" : false,
    "pageHeading" : "Domains",
    "minNoOfSubmissionsRequired" : 1,
    "rootOrganisations" : [],
    "createdFor" : [],
    "updatedAt" : new Date("2024-09-26T04:42:43.860Z"),
    "createdAt" : new Date("2021-11-11T10:16:02.564Z"),
    "deleted" : false,
    "__v" : 0,
    "evidenceMethods" : {
        "OB" : {
            "externalId" : "OB",
            "tip" : null,
            "name" : "Observation",
            "description" : null,
            "modeOfCollection" : "onfield",
            "canBeNotApplicable" : false,
            "notApplicable" : false,
            "canBeNotAllowed" : false,
            "remarks" : null
        }
    },
    "sections" : {
        "S1" : "Observation Question"
    },
    "status" : "active",
    "scope":{
        "state" : [ 
            entities[0]._id.toString()
        ],
        "roles" : [ 
            "district_education_officer", 
            "TEACHER",
            "state_education_officer", 
        ],
        "entityType" : entityType[0].name
    }
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dcc"),
    "externalId" : "5b4081c4-a582-11ef-b023-743af4776910-OBSERVATION-TEMPLATE_CHILD",
    "isReusable" : false,
    "name" : "ObservationWithoutRubrics",
    "description" : "Survey Form to understand the challenges that the parents are facing in getting their children enrolled in ELEVATE courses",
    "author" : "162",
    "parentSolutionId" :new ObjectId("673af2bd83466a9d854ac95e"),
    "resourceType" : [
        "Observations Framework"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Framework",
        "Observation"
    ],
    "concepts" : [

    ],
    "scoringSystem" : null,
    "themes" : [
        {
            "name" : "Observation Theme",
            "type" : "theme",
            "label" : "theme",
            "externalId" : "OB",
            "weightage" : (40),
            "criteria" : [
                {
                    "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc5"),
                    "weightage" : (40)
                },
                {
                    "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4"),
                    "weightage" : (40)
                }
            ]
        }
    ],
    "flattenedThemes" : [

    ],
    "questionSequenceByEcm" : {
        "OB" : {
            "S1" : [
                "Q1_1731916471921-1731916480360",
                "Q2_1731916471921-1731916480363",
                "Q3_1731916471921-1731916480364",
                "Q4_1731916471921-1731916480368",
                "Q5_1731916471921-1731916480369",
                "Q6_1731916471921-1731916480370",
                "Q7_1731916471921-1731916480370",
                "Q8_1731916471921-1731916480372",
                "Q9_1731916471921-1731916480373",
                "Q10_1731916471921-1731916480374",
                "Q11_1731916471921-1731916480375",
                "Q12_1731916471921-1731916480376",
                "Q13_1731916471921-1731916480377",
                "Q14_1731916471921-1731916480378"
            ]
        }
    },
    "entityType" : "state",
    "type" : "observation",
    "subType" : "",
    "entities" : [
        entities[0]._id.toString()
    ],
    "startDate" : new Date("2024-08-20T00:00:00.000+0000"),
    "endDate" : new Date("2029-09-22T00:50:00.000+0000"),
    "status" : "active",
    "evidenceMethods" : {
        "OB" : {
            "externalId" : "OB",
            "tip" : null,
            "name" : "Observation",
            "description" : null,
            "modeOfCollection" : "onfield",
            "canBeNotApplicable" : false,
            "notApplicable" : false,
            "canBeNotAllowed" : false,
            "remarks" : null
        }
    },
    "sections" : {
        "S1" : "Observation Question"
    },
    "registry" : [

    ],
    "frameworkId" : new ObjectId("673af2bc83466a9d854ac956"),
    "frameworkExternalId" : "5b4081c4-a582-11ef-b023-743af4776910",
    "isRubricDriven" : false,
    "enableQuestionReadOut" : false,
    "updatedBy" : "102",
    "captureGpsLocationAtQuestionLevel" : false,
    "creator" : "priyanka",
    "isAPrivateProgram" : false,
    "allowMultipleAssessemts" : true,
    "isDeleted" : false,
    "pageHeading" : "Domains",
    "minNoOfSubmissionsRequired" : (1),
    "rootOrganisations" : [

    ],
    "createdFor" : [
        null
    ],
    "updatedAt" : new Date("2024-11-18T13:30:31.856+0000"),
    "createdAt" : new Date("2024-11-18T07:54:40.619+0000"),
    "deleted" : false,
    "__v" : (0),
    "link" : "42c7d32ac9d0837656aaa6ea2aed34f6",
    "scope" : {
        "state" : [
            entities[0]._id.toString()
        ],
        "roles" : [
            "district_education_officer",
            "user",
            "mentee",
            "session_manager",
            "public",
            "reviewer",
            "state_education_officer"
        ],
        "entityType" : entityType[0].name
    }
}
]

let criteriaData = [
{
    "_id" : new ObjectId("66f4e5f08ea984c17a5b3741"),
    "externalId" : "PRV_16_09_2024_13_05_163662571997",
    "timesUsed" : 12,
    "weightage" : 20,
    "name" : "Cleanliness",
    "score" : "",
    "remarks" : "",
    "description" : "Cleanliness",
    "resourceType" : [ 
        "Program", 
        "Framework", 
        "Criteria"
    ],
    "language" : [ 
        "English"
    ],
    "keywords" : [ 
        "Keyword 1", 
        "Keyword 2"
    ],
    "concepts" : [ 
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdFor" : [],
    "rubric" : {
        "name" : "Cleanliness",
        "description" : "Cleanliness",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "evidences" : [],
    "flag" : "",
    "criteriaType" : "manual",
    "deleted" : false,
    "updatedAt" : new Date("2024-09-26T04:41:20.008Z"),
    "createdAt" : new Date("2024-09-26T04:41:20.008Z"),
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e62d8ea984c17a5b3748"),
    "externalId" : "PRV_16_09_2024_13_05_163662571997",
    "timesUsed" : 12,
    "weightage" : 20,
    "name" : "Cleanliness",
    "score" : "",
    "remarks" : "",
    "description" : "Cleanliness",
    "resourceType" : [ 
        "Program", 
        "Framework", 
        "Criteria"
    ],
    "language" : [ 
        "English"
    ],
    "keywords" : [ 
        "Keyword 1", 
        "Keyword 2"
    ],
    "concepts" : [ 
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdFor" : [],
    "rubric" : {
        "name" : "Cleanliness",
        "description" : "Cleanliness",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "evidences" : [ 
        {
            "code" : "OB",
            "sections" : [ 
                {
                    "code" : "S1",
                    "questions" : [ 
                        new ObjectId("66f4e6c78ea984c17a5b3756"), 
                        new ObjectId("66f4e6c78ea984c17a5b375c"), 
                        new ObjectId("66f4e6c78ea984c17a5b3763"), 
                        new ObjectId("66f4e6c78ea984c17a5b3769"), 
                        new ObjectId("66f4e6c78ea984c17a5b376f")
                    ]
                }
            ]
        }
    ],
    "flag" : "",
    "criteriaType" : "manual",
    "frameworkCriteriaId" : new ObjectId("66f4e5f08ea984c17a5b3741"),
    "updatedAt" : new Date("2024-09-26T04:44:55.836Z"),
    "createdAt" : new Date("2024-09-26T04:41:20.008Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b3785"),
    "externalId" : "PRV_16_09_2024_13_05_163662571997-1727325913573",
    "timesUsed" : 12,
    "weightage" : 20,
    "name" : "Cleanliness",
    "score" : "",
    "remarks" : "",
    "description" : "Cleanliness",
    "resourceType" : [ 
        "Program", 
        "Framework", 
        "Criteria"
    ],
    "language" : [ 
        "English"
    ],
    "keywords" : [ 
        "Keyword 1", 
        "Keyword 2"
    ],
    "concepts" : [ 
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdFor" : [],
    "rubric" : {
        "name" : "Cleanliness",
        "description" : "Cleanliness",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "evidences" : [ 
        {
            "code" : "OB",
            "sections" : [ 
                {
                    "code" : "S1",
                    "questions" : [ 
                        new ObjectId("66f4e6d98ea984c17a5b3779"), 
                        new ObjectId("66f4e6d98ea984c17a5b377a"), 
                        new ObjectId("66f4e6d98ea984c17a5b377b"), 
                        new ObjectId("66f4e6d98ea984c17a5b377c"), 
                        new ObjectId("66f4e6d98ea984c17a5b377d")
                    ]
                }
            ]
        }
    ],
    "flag" : "",
    "criteriaType" : "manual",
    "frameworkCriteriaId" : new ObjectId("66f4e5f08ea984c17a5b3741"),
    "parentCriteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748"),
    "updatedAt" : new Date("2024-09-26T04:45:13.574Z"),
    "createdAt" : new Date("2024-09-26T04:41:20.008Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dc5"),
    "externalId" : "C2_1731916471921-1731916480523",
    "timesUsed" : (12),
    "weightage" : (20),
    "name" : "Criteria 2",
    "score" : "",
    "remarks" : "",
    "description" : "Criteria 2",
    "resourceType" : [
        "Program",
        "Framework",
        "Criteria"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Keyword 1",
        "Keyword 2"
    ],
    "concepts" : [
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdFor" : [

    ],
    "rubric" : {
        "name" : "Criteria 2",
        "description" : "Criteria 2",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "evidences" : [
        {
            "code" : "OB",
            "sections" : [
                {
                    "code" : "S1",
                    "questions" : [
                       new ObjectId("673af2c0a193a26bc7f43dac"),
                       new ObjectId("673af2c0a193a26bc7f43dad"),
                       new ObjectId("673af2c0a193a26bc7f43dae"),
                       new ObjectId("673af2c0a193a26bc7f43daf"),
                       new ObjectId("673af2c0a193a26bc7f43db0")
                    ]
                }
            ]
        }
    ],
    "flag" : "",
    "criteriaType" : "manual",
    "frameworkCriteriaId" : new ObjectId("673af2bc83466a9d854ac952"),
    "parentCriteriaId" : new ObjectId("673af2bd83466a9d854ac95b"),
    "updatedAt" : new Date("2024-11-18T07:54:40.529+0000"),
    "createdAt" : new Date("2024-11-18T07:54:36.274+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dc4"),
    "externalId" : "C1_1731916471921-1731916480520",
    "timesUsed" : (12),
    "weightage" : (20),
    "name" : "Criteria 1",
    "score" : "",
    "remarks" : "",
    "description" : "Criteria 1",
    "resourceType" : [
        "Program",
        "Framework",
        "Criteria"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Keyword 1",
        "Keyword 2"
    ],
    "concepts" : [
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdFor" : [

    ],
    "rubric" : {
        "name" : "Criteria 1",
        "description" : "Criteria 1",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "evidences" : [
        {
            "code" : "OB",
            "sections" : [
                {
                    "code" : "S1",
                    "questions" : [
                        new ObjectId("673af2c0a193a26bc7f43da3"),
                        new ObjectId("673af2c0a193a26bc7f43da4"),
                        new ObjectId("673af2c0a193a26bc7f43da5"),
                        new ObjectId("673af2c0a193a26bc7f43da6"),
                        new ObjectId("673af2c0a193a26bc7f43da7"),
                        new ObjectId("673af2c0a193a26bc7f43da8"),
                        new ObjectId("673af2c0a193a26bc7f43da9"),
                        new ObjectId("673af2c0a193a26bc7f43daa"),
                        new ObjectId("673af2c0a193a26bc7f43dab")
                    ]
                }
            ]
        }
    ],
    "flag" : "",
    "criteriaType" : "manual",
    "frameworkCriteriaId" : new ObjectId("673af2bc83466a9d854ac951"),
    "parentCriteriaId" : new ObjectId("673af2bd83466a9d854ac95a"),
    "updatedAt" : new Date("2024-11-18T07:54:40.529+0000"),
    "createdAt" : new Date("2024-11-18T07:54:36.273+0000"),
    "deleted" : false,
    "__v" : (0)
}
]


let criteriaQuestionsData = [
{
    "_id" : new ObjectId("66f4e62d8ea984c17a5b3748"),
    "__v" : 0,
    "concepts" : [ 
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdAt" : new Date("2024-09-26T04:44:55.787Z"),
    "createdFor" : [],
    "criteriaType" : "manual",
    "deleted" : false,
    "description" : "Cleanliness",
    "evidences" : [ 
        {
            "code" : "OB",
            "sections" : [ 
                {
                    "code" : "S1",
                    "questions" : [ 
                        {
                            "_id" : new ObjectId("66f4e6c78ea984c17a5b3756"),
                            "externalId" : "N111_23_09_2024_15_40_1636625759433",
                            "question" : [ 
                                "Select the medium of the course consumption PRV", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "English"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "Telugu"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "Urdu"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [ 
                                new ObjectId("66f4e6c78ea984c17a5b375c")
                            ],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "1",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "deleted" : false,
                            "updatedAt" : new Date("2024-09-26T04:44:55.796Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.777Z"),
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6c78ea984c17a5b375c"),
                            "externalId" : "N112_23_09_2024_15_40_1636625759433",
                            "question" : [ 
                                "Select the courses that you have enrolled in PRV 2.0", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : [ 
                                {
                                    "operator" : "===",
                                    "value" : [ 
                                        "R1"
                                    ],
                                    "_id" : new ObjectId("66f4e6c78ea984c17a5b3756")
                                }
                            ],
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
                                }, 
                                {
                                    "value" : "R4",
                                    "label" : "AP_Sec_4.Art Integrated Learning"
                                }, 
                                {
                                    "value" : "R5",
                                    "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
                                }, 
                                {
                                    "value" : "R6",
                                    "label" : "AP_Sec_6. Health and Well-being"
                                }, 
                                {
                                    "value" : "R7",
                                    "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
                                }, 
                                {
                                    "value" : "R8",
                                    "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
                                }, 
                                {
                                    "value" : "R9",
                                    "label" : "AP_Sec_9. Vocational Education"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "2",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "deleted" : false,
                            "updatedAt" : new Date("2024-09-26T04:44:55.793Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.793Z"),
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6c78ea984c17a5b3763"),
                            "externalId" : "N113_23_09_2024_15_40_1636625759433",
                            "question" : [ 
                                "Select the courses which you have got the certificate.", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
                                }, 
                                {
                                    "value" : "R4",
                                    "label" : "AP_Sec_4.Art Integrated Learning"
                                }, 
                                {
                                    "value" : "R5",
                                    "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
                                }, 
                                {
                                    "value" : "R6",
                                    "label" : "AP_Sec_6. Health and Well-being"
                                }, 
                                {
                                    "value" : "R7",
                                    "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
                                }, 
                                {
                                    "value" : "R8",
                                    "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
                                }, 
                                {
                                    "value" : "R9",
                                    "label" : "AP_Sec_9. Vocational Education"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "3",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "deleted" : false,
                            "updatedAt" : new Date("2024-09-26T04:44:55.807Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.807Z"),
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6c78ea984c17a5b3769"),
                            "externalId" : "N114_23_09_2024_15_40_1636625759433",
                            "question" : [ 
                                "Select the courses that you have enrolled in PRV 2.0", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "AP_Sec_మాడ్యూలు 1: విద్యా ప్రణాళిక మరియు సహిత తరగతి గదులు"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "AP_Sec_మాడ్యూలు 2: బోధన, అభ్యసన, మూల్యాంకనంలో ICT ని సమగ్రపరచడం"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "AP_Sec_ మాడ్యూలు 3 : వ్యక్తిగత సామాజిక లక్షణాలను అభివృద్ధి చేయడం"
                                }, 
                                {
                                    "value" : "R4",
                                    "label" : "AP_Sec_మాడ్యూలు 4. కళ ఆధారిత అభ్యసనం"
                                }, 
                                {
                                    "value" : "R5",
                                    "label" : "AP_Sec_మాడ్యూలు 5 : మాధ్యమిక దశలోని విద్యార్థులను అర్థం చేసుకోవడం"
                                }, 
                                {
                                    "value" : "R6",
                                    "label" : "AP_Sec_మాడ్యూలు 6 :ఆరోగ్యం మరియు శ్రేయస్సు"
                                }, 
                                {
                                    "value" : "R7",
                                    "label" : "AP_Sec_మాడ్యూలు 7 : పాఠశాల ప్రక్రియలో లింగభావనను సమగ్ర పరచడం"
                                }, 
                                {
                                    "value" : "R8",
                                    "label" : "AP_Sec_మాడ్యూలు 8 : పాఠశాల నాయకత్వం - భావనలు మరియు అనువర్తనాలు"
                                }, 
                                {
                                    "value" : "R9",
                                    "label" : "AP_Sec_9 వృత్తి విద్య"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "2",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "deleted" : false,
                            "updatedAt" : new Date("2024-09-26T04:44:55.821Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.821Z"),
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6c78ea984c17a5b376f"),
                            "externalId" : "N118_23_09_2024_15_40_1636625759433",
                            "question" : [ 
                                "Give a rating on the reading materials available in the course", 
                                ""
                            ],
                            "tip" : "1 is very bad, 5 is very good",
                            "hint" : "",
                            "responseType" : "slider",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true,
                                "max" : "5",
                                "min" : "1"
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "4",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "deleted" : false,
                            "updatedAt" : new Date("2024-09-26T04:44:55.833Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.833Z"),
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e62d8ea984c17a5b3748")
                        }
                    ]
                }
            ]
        }
    ],
    "externalId" : "PRV_16_09_2024_13_05_163662571997",
    "flag" : "",
    "frameworkCriteriaId" : new ObjectId("66f4e5f08ea984c17a5b3741"),
    "keywords" : [ 
        "Keyword 1", 
        "Keyword 2"
    ],
    "language" : [ 
        "English"
    ],
    "name" : "Cleanliness",
    "owner" : null,
    "remarks" : "",
    "resourceType" : [ 
        "Program", 
        "Framework", 
        "Criteria"
    ],
    "rubric" : {
        "name" : "Cleanliness",
        "description" : "Cleanliness",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "score" : "",
    "showRemarks" : null,
    "timesUsed" : 12,
    "updatedAt" : new Date("2024-09-26T04:44:55.840Z"),
    "weightage" : 20
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b3785"),
    "__v" : 0,
    "concepts" : [ 
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }, 
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdAt" : new Date("2024-09-26T04:45:13.578Z"),
    "createdFor" : [],
    "criteriaType" : "manual",
    "deleted" : false,
    "description" : "Cleanliness",
    "evidences" : [ 
        {
            "code" : "OB",
            "sections" : [ 
                {
                    "code" : "S1",
                    "questions" : [ 
                        {
                            "_id" : new ObjectId("66f4e6d98ea984c17a5b3779"),
                            "externalId" : "N111_23_09_2024_15_40_1636625759433-1727325913561",
                            "question" : [ 
                                "Select the medium of the course consumption PRV", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "English"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "Telugu"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "Urdu"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [ 
                                new ObjectId("66f4e6d98ea984c17a5b377a")
                            ],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "1",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b3756"),
                            "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.777Z"),
                            "deleted" : false,
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e6d98ea984c17a5b3785")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6d98ea984c17a5b377a"),
                            "externalId" : "N112_23_09_2024_15_40_1636625759433-1727325913562",
                            "question" : [ 
                                "Select the courses that you have enrolled in PRV 2.0", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : [ 
                                {
                                    "operator" : "===",
                                    "value" : [ 
                                        "R1"
                                    ],
                                    "_id" : new ObjectId("66f4e6d98ea984c17a5b3779")
                                }
                            ],
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
                                }, 
                                {
                                    "value" : "R4",
                                    "label" : "AP_Sec_4.Art Integrated Learning"
                                }, 
                                {
                                    "value" : "R5",
                                    "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
                                }, 
                                {
                                    "value" : "R6",
                                    "label" : "AP_Sec_6. Health and Well-being"
                                }, 
                                {
                                    "value" : "R7",
                                    "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
                                }, 
                                {
                                    "value" : "R8",
                                    "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
                                }, 
                                {
                                    "value" : "R9",
                                    "label" : "AP_Sec_9. Vocational Education"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "2",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b375c"),
                            "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.793Z"),
                            "deleted" : false,
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e6d98ea984c17a5b3785")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6d98ea984c17a5b377b"),
                            "externalId" : "N113_23_09_2024_15_40_1636625759433-1727325913563",
                            "question" : [ 
                                "Select the courses which you have got the certificate.", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
                                }, 
                                {
                                    "value" : "R4",
                                    "label" : "AP_Sec_4.Art Integrated Learning"
                                }, 
                                {
                                    "value" : "R5",
                                    "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
                                }, 
                                {
                                    "value" : "R6",
                                    "label" : "AP_Sec_6. Health and Well-being"
                                }, 
                                {
                                    "value" : "R7",
                                    "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
                                }, 
                                {
                                    "value" : "R8",
                                    "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
                                }, 
                                {
                                    "value" : "R9",
                                    "label" : "AP_Sec_9. Vocational Education"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "3",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b3763"),
                            "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.807Z"),
                            "deleted" : false,
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e6d98ea984c17a5b3785")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6d98ea984c17a5b377c"),
                            "externalId" : "N114_23_09_2024_15_40_1636625759433-1727325913563",
                            "question" : [ 
                                "Select the courses that you have enrolled in PRV 2.0", 
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [ 
                                {
                                    "value" : "R1",
                                    "label" : "AP_Sec_మాడ్యూలు 1: విద్యా ప్రణాళిక మరియు సహిత తరగతి గదులు"
                                }, 
                                {
                                    "value" : "R2",
                                    "label" : "AP_Sec_మాడ్యూలు 2: బోధన, అభ్యసన, మూల్యాంకనంలో ICT ని సమగ్రపరచడం"
                                }, 
                                {
                                    "value" : "R3",
                                    "label" : "AP_Sec_ మాడ్యూలు 3 : వ్యక్తిగత సామాజిక లక్షణాలను అభివృద్ధి చేయడం"
                                }, 
                                {
                                    "value" : "R4",
                                    "label" : "AP_Sec_మాడ్యూలు 4. కళ ఆధారిత అభ్యసనం"
                                }, 
                                {
                                    "value" : "R5",
                                    "label" : "AP_Sec_మాడ్యూలు 5 : మాధ్యమిక దశలోని విద్యార్థులను అర్థం చేసుకోవడం"
                                }, 
                                {
                                    "value" : "R6",
                                    "label" : "AP_Sec_మాడ్యూలు 6 :ఆరోగ్యం మరియు శ్రేయస్సు"
                                }, 
                                {
                                    "value" : "R7",
                                    "label" : "AP_Sec_మాడ్యూలు 7 : పాఠశాల ప్రక్రియలో లింగభావనను సమగ్ర పరచడం"
                                }, 
                                {
                                    "value" : "R8",
                                    "label" : "AP_Sec_మాడ్యూలు 8 : పాఠశాల నాయకత్వం - భావనలు మరియు అనువర్తనాలు"
                                }, 
                                {
                                    "value" : "R9",
                                    "label" : "AP_Sec_9 వృత్తి విద్య"
                                }
                            ],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "2",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b3769"),
                            "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.821Z"),
                            "deleted" : false,
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e6d98ea984c17a5b3785")
                        }, 
                        {
                            "_id" : new ObjectId("66f4e6d98ea984c17a5b377d"),
                            "externalId" : "N118_23_09_2024_15_40_1636625759433-1727325913564",
                            "question" : [ 
                                "Give a rating on the reading materials available in the course", 
                                ""
                            ],
                            "tip" : "1 is very bad, 5 is very good",
                            "hint" : "",
                            "responseType" : "slider",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [],
                            "sliderOptions" : [],
                            "children" : [],
                            "questionGroup" : [ 
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [],
                            "validation" : {
                                "required" : true,
                                "max" : "5",
                                "min" : "1"
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "4",
                            "weightage" : 1,
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b376f"),
                            "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
                            "createdAt" : new Date("2024-09-26T04:44:55.833Z"),
                            "deleted" : false,
                            "__v" : 0,
                            "criteriaId" : new ObjectId("66f4e6d98ea984c17a5b3785")
                        }
                    ]
                }
            ]
        }
    ],
    "externalId" : "PRV_16_09_2024_13_05_163662571997-1727325913573",
    "flag" : "",
    "frameworkCriteriaId" : new ObjectId("66f4e5f08ea984c17a5b3741"),
    "keywords" : [ 
        "Keyword 1", 
        "Keyword 2"
    ],
    "language" : [ 
        "English"
    ],
    "name" : "Cleanliness",
    "owner" : null,
    "remarks" : "",
    "resourceType" : [ 
        "Program", 
        "Framework", 
        "Criteria"
    ],
    "rubric" : {
        "name" : "Cleanliness",
        "description" : "Cleanliness",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "score" : "",
    "showRemarks" : null,
    "timesUsed" : 12,
    "updatedAt" : new Date("2024-09-26T04:45:13.578Z"),
    "weightage" : 20
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dc5"),
    "__v" : (0),
    "concepts" : [
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdAt" : new Date("2024-11-18T07:54:40.578+0000"),
    "createdFor" : [

    ],
    "criteriaType" : "manual",
    "deleted" : false,
    "description" : "Criteria 2",
    "evidences" : [
        {
            "code" : "OB",
            "sections" : [
                {
                    "code" : "S1",
                    "questions" : [
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43dac"),
                            "externalId" : "Q10_1731916471921-1731916480374",
                            "question" : [
                                "Add the student interview responses",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "matrix",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "instanceIdentifier" : "Student",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [
                                new ObjectId("673af2c0a193a26bc7f43dad"),
                                new ObjectId("673af2c0a193a26bc7f43dae"),
                                new ObjectId("673af2c0a193a26bc7f43daf"),
                                new ObjectId("673af2c0a193a26bc7f43db0")
                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p2",
                            "questionNumber" : "10",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" :new ObjectId("673af2be83466a9d854ac99e"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.877+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc5")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43dad"),
                            "externalId" : "Q11_1731916471921-1731916480375",
                            "question" : [
                                "When did you last take a course on ELEVATE?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "date",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true,
                                "max" : "",
                                "min" : ""
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "dateFormat" : "DD-MM-YYYY",
                            "autoCapture" : true,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p2",
                            "questionNumber" : "10a",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9a4"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.895+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc5")
                        },
                        {
                            "_id" :new ObjectId("673af2c0a193a26bc7f43dae"),
                            "externalId" : "Q12_1731916471921-1731916480376",
                            "question" : [
                                "How would you rate the course taken?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "slider",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true,
                                "max" : "5",
                                "min" : "1"
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p2",
                            "questionNumber" : "10b",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9ab"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.919+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc5")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43daf"),
                            "externalId" : "Q13_1731916471921-1731916480377",
                            "question" : [
                                "How many courses have you taken?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "number",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true,
                                "IsNumber" : "true"
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p2",
                            "questionNumber" : "10c",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9b2"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.942+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" :new ObjectId("673af2c0a193a26bc7f43dc5")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43db0"),
                            "externalId" : "Q14_1731916471921-1731916480378",
                            "question" : [
                                "Which courses did you go through?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "text",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "file" : {
                                "required" : true,
                                "type" : [
                                    "image/jpeg",
                                    "docx",
                                    "pdf",
                                    "ppt"
                                ],
                                "minCount" : (0),
                                "maxCount" : (10),
                                "caption" : "FALSE"
                            },
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : false
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p2",
                            "questionNumber" : "10d",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" :new ObjectId("673af2be83466a9d854ac9b9"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.972+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" :new ObjectId("673af2c0a193a26bc7f43dc5")
                        }
                    ]
                }
            ]
        }
    ],
    "externalId" : "C2_1731916471921-1731916480523",
    "flag" : "",
    "frameworkCriteriaId" : new ObjectId("673af2bc83466a9d854ac952"),
    "keywords" : [
        "Keyword 1",
        "Keyword 2"
    ],
    "language" : [
        "English"
    ],
    "name" : "Criteria 2",
    "owner" : null,
    "remarks" : "",
    "resourceType" : [
        "Program",
        "Framework",
        "Criteria"
    ],
    "rubric" : {
        "name" : "Criteria 2",
        "description" : "Criteria 2",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "score" : "",
    "showRemarks" : null,
    "timesUsed" : (12),
    "updatedAt" : new Date("2024-11-18T07:54:40.578+0000"),
    "weightage" : (20)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dc4"),
    "__v" : (0),
    "concepts" : [
        {
            "identifier" : "LPD20100",
            "name" : "Teacher_Performance",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20400",
            "name" : "Instructional_Programme",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        },
        {
            "identifier" : "LPD20200",
            "name" : "Teacher_Empowerment",
            "objectType" : "Concept",
            "relation" : "associatedTo",
            "description" : null,
            "index" : null,
            "status" : null,
            "depth" : null,
            "mimeType" : null,
            "visibility" : null,
            "compatibilityLevel" : null
        }
    ],
    "createdAt" : new Date("2024-11-18T07:54:40.609+0000"),
    "createdFor" : [

    ],
    "criteriaType" : "manual",
    "deleted" : false,
    "description" : "Criteria 1",
    "evidences" : [
        {
            "code" : "OB",
            "sections" : [
                {
                    "code" : "S1",
                    "questions" : [
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da3"),
                            "externalId" : "Q1_1731916471921-1731916480360",
                            "question" : [
                                "Enter the date of observation",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "date",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true,
                                "max" : "",
                                "min" : ""
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "dateFormat" : "DD-MM-YYYY",
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "1",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac966"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.655+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da4"),
                            "externalId" : "Q2_1731916471921-1731916480363",
                            "question" : [
                                "Which class does your child study in?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "number",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [

                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true,
                                "IsNumber" : "true"
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "2",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" :new ObjectId("673af2be83466a9d854ac96c"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.690+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da5"),
                            "externalId" : "Q3_1731916471921-1731916480364",
                            "question" : [
                                "Are you currently living in the vicinity of the school?",
                                ""
                            ],
                            "tip" : "Use the name of the locality where the school is",
                            "hint" : "",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Yes"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "No"
                                },
                                {
                                    "value" : "R3",
                                    "label" : "a"
                                },
                                {
                                    "value" : "R4",
                                    "label" : "b"
                                },
                                {
                                    "value" : "R5",
                                    "label" : "c"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [
                                new ObjectId("673af2c0a193a26bc7f43da6")
                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "3",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac972"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.715+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da6"),
                            "externalId" : "Q4_1731916471921-1731916480368",
                            "question" : [
                                "Are you planning to come back?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "This becomes a risk if the answer is no",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : [
                                {
                                    "operator" : "===",
                                    "value" : [
                                        "R2"
                                    ],
                                    "_id" : new ObjectId("673af2c0a193a26bc7f43da5")
                                }
                            ],
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Yes"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "No"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : false
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "4",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac978"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.733+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da7"),
                            "externalId" : "Q5_1731916471921-1731916480369",
                            "question" : [
                                "What type of device is available at home?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "The devices that are available or can be easily arranged in the household.",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : true,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Simple mobile phone without internet/data pack"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "Smart phone with internet/data pack"
                                },
                                {
                                    "value" : "R3",
                                    "label" : "Smart phone without internet/data pack"
                                },
                                {
                                    "value" : "R4",
                                    "label" : "TV"
                                },
                                {
                                    "value" : "R5",
                                    "label" : "Radio"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "file" : {
                                "required" : true,
                                "type" : [
                                    "image/jpeg",
                                    "docx",
                                    "pdf",
                                    "ppt"
                                ],
                                "minCount" : (0),
                                "maxCount" : (10),
                                "caption" : "FALSE"
                            },
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "5",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac97f"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.757+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da8"),
                            "externalId" : "Q6_1731916471921-1731916480370",
                            "question" : [
                                "Does the child have a quiet place to study?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : true,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Yes"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "No"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "6",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac985"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.783+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43da9"),
                            "externalId" : "Q7_1731916471921-1731916480370",
                            "question" : [
                                "Were you able to enrol your child in courses on ELEVATE?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : false,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Yes"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "No"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [
                                new ObjectId("673af2c0a193a26bc7f43daa")
                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "7",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac98b"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.804+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43daa"),
                            "externalId" : "Q8_1731916471921-1731916480372",
                            "question" : [
                                "What are the challenges that you are facing in enrolment?",
                                ""
                            ],
                            "tip" : "",
                            "hint" : "",
                            "responseType" : "multiselect",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : true,
                            "remarks" : "",
                            "visibleIf" : [
                                {
                                    "operator" : "===",
                                    "value" : [
                                        "R2"
                                    ],
                                    "_id" : new ObjectId("673af2c0a193a26bc7f43da9")
                                }
                            ],
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Not able to use the app"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "Not aware of classrooms on DIKSHA"
                                },
                                {
                                    "value" : "R3",
                                    "label" : "Not aware of the enrolment process in the classroom"
                                },
                                {
                                    "value" : "R4",
                                    "label" : "Not aware of enrolment process in the courses"
                                },
                                {
                                    "value" : "R5",
                                    "label" : "Don’t find the courses useful"
                                },
                                {
                                    "value" : "R6",
                                    "label" : "Others"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "8",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac991"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.827+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        },
                        {
                            "_id" : new ObjectId("673af2c0a193a26bc7f43dab"),
                            "externalId" : "Q9_1731916471921-1731916480373",
                            "question" : [
                                "On basis of the responses received above,  do you think this student is a potential drop out?",
                                ""
                            ],
                            "tip" : "Fill this based on the  parents' answers",
                            "hint" : "",
                            "responseType" : "radio",
                            "value" : "",
                            "isCompleted" : false,
                            "showRemarks" : true,
                            "remarks" : "",
                            "visibleIf" : "",
                            "options" : [
                                {
                                    "value" : "R1",
                                    "label" : "Yes"
                                },
                                {
                                    "value" : "R2",
                                    "label" : "No"
                                }
                            ],
                            "sliderOptions" : [

                            ],
                            "children" : [

                            ],
                            "questionGroup" : [
                                "A1"
                            ],
                            "questionType" : "auto",
                            "modeOfCollection" : "onfield",
                            "usedForScoring" : "",
                            "fileName" : [

                            ],
                            "validation" : {
                                "required" : true
                            },
                            "accessibility" : "No",
                            "canBeNotApplicable" : "false",
                            "instanceQuestions" : [

                            ],
                            "isAGeneralQuestion" : false,
                            "autoCapture" : false,
                            "rubricLevel" : "",
                            "sectionHeader" : "",
                            "allowAudioRecording" : false,
                            "page" : "p1",
                            "questionNumber" : "9",
                            "weightage" : (1),
                            "prefillFromEntityProfile" : false,
                            "entityFieldName" : "",
                            "isEditable" : true,
                            "showQuestionInPreview" : false,
                            "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac998"),
                            "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
                            "createdAt" : new Date("2024-11-18T07:54:38.854+0000"),
                            "deleted" : false,
                            "__v" : (0),
                            "criteriaId" : new ObjectId("673af2c0a193a26bc7f43dc4")
                        }
                    ]
                }
            ]
        }
    ],
    "externalId" : "C1_1731916471921-1731916480520",
    "flag" : "",
    "frameworkCriteriaId" : new ObjectId("673af2bc83466a9d854ac951"),
    "keywords" : [
        "Keyword 1",
        "Keyword 2"
    ],
    "language" : [
        "English"
    ],
    "name" : "Criteria 1",
    "owner" : null,
    "remarks" : "",
    "resourceType" : [
        "Program",
        "Framework",
        "Criteria"
    ],
    "rubric" : {
        "name" : "Criteria 1",
        "description" : "Criteria 1",
        "type" : "auto",
        "levels" : {
            "L1" : {
                "level" : "L1",
                "label" : "Level 1",
                "description" : "NA",
                "expression" : ""
            }
        }
    },
    "score" : "",
    "showRemarks" : null,
    "timesUsed" : (12),
    "updatedAt" : new Date("2024-11-18T07:54:40.609+0000"),
    "weightage" : (20)
}
]

let questionsData = [

{
    "_id" : new ObjectId("66f4e6c78ea984c17a5b3756"),
    "externalId" : "N111_23_09_2024_15_40_1636625759433",
    "question" : [ 
        "Select the medium of the course consumption PRV", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [ 
        {
            "value" : "R1",
            "label" : "English"
        }, 
        {
            "value" : "R2",
            "label" : "Telugu"
        }, 
        {
            "value" : "R3",
            "label" : "Urdu"
        }
    ],
    "sliderOptions" : [],
    "children" : [ 
        new ObjectId("66f4e6c78ea984c17a5b375c")
    ],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "1",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "deleted" : false,
    "updatedAt" : new Date("2024-09-26T04:44:55.796Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.777Z"),
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6c78ea984c17a5b375c"),
    "externalId" : "N112_23_09_2024_15_40_1636625759433",
    "question" : [ 
        "Select the courses that you have enrolled in PRV 2.0", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : [ 
        {
            "operator" : "===",
            "value" : [ 
                "R1"
            ],
            "_id" : new ObjectId("66f4e6c78ea984c17a5b3756")
        }
    ],
    "options" : [ 
        {
            "value" : "R1",
            "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
        }, 
        {
            "value" : "R2",
            "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
        }, 
        {
            "value" : "R3",
            "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
        }, 
        {
            "value" : "R4",
            "label" : "AP_Sec_4.Art Integrated Learning"
        }, 
        {
            "value" : "R5",
            "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
        }, 
        {
            "value" : "R6",
            "label" : "AP_Sec_6. Health and Well-being"
        }, 
        {
            "value" : "R7",
            "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
        }, 
        {
            "value" : "R8",
            "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
        }, 
        {
            "value" : "R9",
            "label" : "AP_Sec_9. Vocational Education"
        }
    ],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "2",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "deleted" : false,
    "updatedAt" : new Date("2024-09-26T04:44:55.793Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.793Z"),
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6c78ea984c17a5b3763"),
    "externalId" : "N113_23_09_2024_15_40_1636625759433",
    "question" : [ 
        "Select the courses which you have got the certificate.", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [ 
        {
            "value" : "R1",
            "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
        }, 
        {
            "value" : "R2",
            "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
        }, 
        {
            "value" : "R3",
            "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
        }, 
        {
            "value" : "R4",
            "label" : "AP_Sec_4.Art Integrated Learning"
        }, 
        {
            "value" : "R5",
            "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
        }, 
        {
            "value" : "R6",
            "label" : "AP_Sec_6. Health and Well-being"
        }, 
        {
            "value" : "R7",
            "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
        }, 
        {
            "value" : "R8",
            "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
        }, 
        {
            "value" : "R9",
            "label" : "AP_Sec_9. Vocational Education"
        }
    ],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "3",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "deleted" : false,
    "updatedAt" : new Date("2024-09-26T04:44:55.807Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.807Z"),
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6c78ea984c17a5b3769"),
    "externalId" : "N114_23_09_2024_15_40_1636625759433",
    "question" : [ 
        "Select the courses that you have enrolled in PRV 2.0", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [ 
        {
            "value" : "R1",
            "label" : "AP_Sec_మాడ్యూలు 1: విద్యా ప్రణాళిక మరియు సహిత తరగతి గదులు"
        }, 
        {
            "value" : "R2",
            "label" : "AP_Sec_మాడ్యూలు 2: బోధన, అభ్యసన, మూల్యాంకనంలో ICT ని సమగ్రపరచడం"
        }, 
        {
            "value" : "R3",
            "label" : "AP_Sec_ మాడ్యూలు 3 : వ్యక్తిగత సామాజిక లక్షణాలను అభివృద్ధి చేయడం"
        }, 
        {
            "value" : "R4",
            "label" : "AP_Sec_మాడ్యూలు 4. కళ ఆధారిత అభ్యసనం"
        }, 
        {
            "value" : "R5",
            "label" : "AP_Sec_మాడ్యూలు 5 : మాధ్యమిక దశలోని విద్యార్థులను అర్థం చేసుకోవడం"
        }, 
        {
            "value" : "R6",
            "label" : "AP_Sec_మాడ్యూలు 6 :ఆరోగ్యం మరియు శ్రేయస్సు"
        }, 
        {
            "value" : "R7",
            "label" : "AP_Sec_మాడ్యూలు 7 : పాఠశాల ప్రక్రియలో లింగభావనను సమగ్ర పరచడం"
        }, 
        {
            "value" : "R8",
            "label" : "AP_Sec_మాడ్యూలు 8 : పాఠశాల నాయకత్వం - భావనలు మరియు అనువర్తనాలు"
        }, 
        {
            "value" : "R9",
            "label" : "AP_Sec_9 వృత్తి విద్య"
        }
    ],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "2",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "deleted" : false,
    "updatedAt" : new Date("2024-09-26T04:44:55.821Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.821Z"),
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6c78ea984c17a5b376f"),
    "externalId" : "N118_23_09_2024_15_40_1636625759433",
    "question" : [ 
        "Give a rating on the reading materials available in the course", 
        ""
    ],
    "tip" : "1 is very bad, 5 is very good",
    "hint" : "",
    "responseType" : "slider",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true,
        "max" : "5",
        "min" : "1"
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "4",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "deleted" : false,
    "updatedAt" : new Date("2024-09-26T04:44:55.833Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.833Z"),
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b377b"),
    "externalId" : "N113_23_09_2024_15_40_1636625759433-1727325913563",
    "question" : [ 
        "Select the courses which you have got the certificate.", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [ 
        {
            "value" : "R1",
            "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
        }, 
        {
            "value" : "R2",
            "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
        }, 
        {
            "value" : "R3",
            "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
        }, 
        {
            "value" : "R4",
            "label" : "AP_Sec_4.Art Integrated Learning"
        }, 
        {
            "value" : "R5",
            "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
        }, 
        {
            "value" : "R6",
            "label" : "AP_Sec_6. Health and Well-being"
        }, 
        {
            "value" : "R7",
            "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
        }, 
        {
            "value" : "R8",
            "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
        }, 
        {
            "value" : "R9",
            "label" : "AP_Sec_9. Vocational Education"
        }
    ],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "3",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b3763"),
    "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.807Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b3779"),
    "externalId" : "N111_23_09_2024_15_40_1636625759433-1727325913561",
    "question" : [ 
        "Select the medium of the course consumption PRV", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [ 
        {
            "value" : "R1",
            "label" : "English"
        }, 
        {
            "value" : "R2",
            "label" : "Telugu"
        }, 
        {
            "value" : "R3",
            "label" : "Urdu"
        }
    ],
    "sliderOptions" : [],
    "children" : [ 
        new ObjectId("66f4e6d98ea984c17a5b377a")
    ],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "1",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b3756"),
    "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.777Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b377d"),
    "externalId" : "N118_23_09_2024_15_40_1636625759433-1727325913564",
    "question" : [ 
        "Give a rating on the reading materials available in the course", 
        ""
    ],
    "tip" : "1 is very bad, 5 is very good",
    "hint" : "",
    "responseType" : "slider",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true,
        "max" : "5",
        "min" : "1"
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "4",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b376f"),
    "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.833Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b377a"),
    "externalId" : "N112_23_09_2024_15_40_1636625759433-1727325913562",
    "question" : [ 
        "Select the courses that you have enrolled in PRV 2.0", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : [ 
        {
            "operator" : "===",
            "value" : [ 
                "R1"
            ],
            "_id" : new ObjectId("66f4e6d98ea984c17a5b3779")
        }
    ],
    "options" : [ 
        {
            "value" : "R1",
            "label" : "AP_Sec_1.Curriculum and Inclusive Classrooms"
        }, 
        {
            "value" : "R2",
            "label" : "AP_Sec_2.ICT in Teaching-Learning and Assessment"
        }, 
        {
            "value" : "R3",
            "label" : "AP_Sec_3.Personal-Social Qualities for Holistic Development"
        }, 
        {
            "value" : "R4",
            "label" : "AP_Sec_4.Art Integrated Learning"
        }, 
        {
            "value" : "R5",
            "label" : "AP_Sec_5. Understanding Secondary Stage Learners"
        }, 
        {
            "value" : "R6",
            "label" : "AP_Sec_6. Health and Well-being"
        }, 
        {
            "value" : "R7",
            "label" : "AP_Sec_7. Integrating Gender in Schooling Processes"
        }, 
        {
            "value" : "R8",
            "label" : "AP_Sec_8. School Leadership: Concepts and Applications"
        }, 
        {
            "value" : "R9",
            "label" : "AP_Sec_9. Vocational Education"
        }
    ],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "2",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b375c"),
    "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.793Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("66f4e6d98ea984c17a5b377c"),
    "externalId" : "N114_23_09_2024_15_40_1636625759433-1727325913563",
    "question" : [ 
        "Select the courses that you have enrolled in PRV 2.0", 
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [ 
        {
            "value" : "R1",
            "label" : "AP_Sec_మాడ్యూలు 1: విద్యా ప్రణాళిక మరియు సహిత తరగతి గదులు"
        }, 
        {
            "value" : "R2",
            "label" : "AP_Sec_మాడ్యూలు 2: బోధన, అభ్యసన, మూల్యాంకనంలో ICT ని సమగ్రపరచడం"
        }, 
        {
            "value" : "R3",
            "label" : "AP_Sec_ మాడ్యూలు 3 : వ్యక్తిగత సామాజిక లక్షణాలను అభివృద్ధి చేయడం"
        }, 
        {
            "value" : "R4",
            "label" : "AP_Sec_మాడ్యూలు 4. కళ ఆధారిత అభ్యసనం"
        }, 
        {
            "value" : "R5",
            "label" : "AP_Sec_మాడ్యూలు 5 : మాధ్యమిక దశలోని విద్యార్థులను అర్థం చేసుకోవడం"
        }, 
        {
            "value" : "R6",
            "label" : "AP_Sec_మాడ్యూలు 6 :ఆరోగ్యం మరియు శ్రేయస్సు"
        }, 
        {
            "value" : "R7",
            "label" : "AP_Sec_మాడ్యూలు 7 : పాఠశాల ప్రక్రియలో లింగభావనను సమగ్ర పరచడం"
        }, 
        {
            "value" : "R8",
            "label" : "AP_Sec_మాడ్యూలు 8 : పాఠశాల నాయకత్వం - భావనలు మరియు అనువర్తనాలు"
        }, 
        {
            "value" : "R9",
            "label" : "AP_Sec_9 వృత్తి విద్య"
        }
    ],
    "sliderOptions" : [],
    "children" : [],
    "questionGroup" : [ 
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "2",
    "weightage" : 1,
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("66f4e6c78ea984c17a5b3769"),
    "updatedAt" : new Date("2024-09-26T04:45:13.565Z"),
    "createdAt" : new Date("2024-09-26T04:44:55.821Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da3"),
    "externalId" : "Q1_1731916471921-1731916480360",
    "question" : [
        "Enter the date of observation",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "date",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true,
        "max" : "",
        "min" : ""
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "dateFormat" : "DD-MM-YYYY",
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "1",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac966"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.655+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da4"),
    "externalId" : "Q2_1731916471921-1731916480363",
    "question" : [
        "Which class does your child study in?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "number",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true,
        "IsNumber" : "true"
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "2",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac96c"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.690+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da5"),
    "externalId" : "Q3_1731916471921-1731916480364",
    "question" : [
        "Are you currently living in the vicinity of the school?",
        ""
    ],
    "tip" : "Use the name of the locality where the school is",
    "hint" : "",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [
        {
            "value" : "R1",
            "label" : "Yes"
        },
        {
            "value" : "R2",
            "label" : "No"
        },
        {
            "value" : "R3",
            "label" : "a"
        },
        {
            "value" : "R4",
            "label" : "b"
        },
        {
            "value" : "R5",
            "label" : "c"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [
        new ObjectId("673af2c0a193a26bc7f43da6")
    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "3",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac972"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.715+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da6"),
    "externalId" : "Q4_1731916471921-1731916480368",
    "question" : [
        "Are you planning to come back?",
        ""
    ],
    "tip" : "",
    "hint" : "This becomes a risk if the answer is no",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : [
        {
            "operator" : "===",
            "value" : [
                "R2"
            ],
            "_id" :new ObjectId("673af2c0a193a26bc7f43da5")
        }
    ],
    "options" : [
        {
            "value" : "R1",
            "label" : "Yes"
        },
        {
            "value" : "R2",
            "label" : "No"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : false
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "4",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac978"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.733+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da7"),
    "externalId" : "Q5_1731916471921-1731916480369",
    "question" : [
        "What type of device is available at home?",
        ""
    ],
    "tip" : "",
    "hint" : "The devices that are available or can be easily arranged in the household.",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : true,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [
        {
            "value" : "R1",
            "label" : "Simple mobile phone without internet/data pack"
        },
        {
            "value" : "R2",
            "label" : "Smart phone with internet/data pack"
        },
        {
            "value" : "R3",
            "label" : "Smart phone without internet/data pack"
        },
        {
            "value" : "R4",
            "label" : "TV"
        },
        {
            "value" : "R5",
            "label" : "Radio"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "file" : {
        "required" : true,
        "type" : [
            "image/jpeg",
            "docx",
            "pdf",
            "ppt"
        ],
        "minCount" : (0),
        "maxCount" : (10),
        "caption" : "FALSE"
    },
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "5",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac97f"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.757+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da8"),
    "externalId" : "Q6_1731916471921-1731916480370",
    "question" : [
        "Does the child have a quiet place to study?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : true,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [
        {
            "value" : "R1",
            "label" : "Yes"
        },
        {
            "value" : "R2",
            "label" : "No"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "6",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac985"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.783+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43da9"),
    "externalId" : "Q7_1731916471921-1731916480370",
    "question" : [
        "Were you able to enrol your child in courses on ELEVATE?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [
        {
            "value" : "R1",
            "label" : "Yes"
        },
        {
            "value" : "R2",
            "label" : "No"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [
        new ObjectId("673af2c0a193a26bc7f43daa")
    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "7",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac98b"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.804+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43daa"),
    "externalId" : "Q8_1731916471921-1731916480372",
    "question" : [
        "What are the challenges that you are facing in enrolment?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "multiselect",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : true,
    "remarks" : "",
    "visibleIf" : [
        {
            "operator" : "===",
            "value" : [
                "R2"
            ],
            "_id" : new ObjectId("673af2c0a193a26bc7f43da9")
        }
    ],
    "options" : [
        {
            "value" : "R1",
            "label" : "Not able to use the app"
        },
        {
            "value" : "R2",
            "label" : "Not aware of classrooms on DIKSHA"
        },
        {
            "value" : "R3",
            "label" : "Not aware of the enrolment process in the classroom"
        },
        {
            "value" : "R4",
            "label" : "Not aware of enrolment process in the courses"
        },
        {
            "value" : "R5",
            "label" : "Don’t find the courses useful"
        },
        {
            "value" : "R6",
            "label" : "Others"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "8",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac991"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.827+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dab"),
    "externalId" : "Q9_1731916471921-1731916480373",
    "question" : [
        "On basis of the responses received above,  do you think this student is a potential drop out?",
        ""
    ],
    "tip" : "Fill this based on the  parents' answers",
    "hint" : "",
    "responseType" : "radio",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : true,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [
        {
            "value" : "R1",
            "label" : "Yes"
        },
        {
            "value" : "R2",
            "label" : "No"
        }
    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p1",
    "questionNumber" : "9",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac998"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.854+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dac"),
    "externalId" : "Q10_1731916471921-1731916480374",
    "question" : [
        "Add the student interview responses",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "matrix",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true
    },
    "accessibility" : "No",
    "instanceIdentifier" : "Student",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [
        new ObjectId("673af2c0a193a26bc7f43dad"),
        new ObjectId("673af2c0a193a26bc7f43dae"),
        new ObjectId("673af2c0a193a26bc7f43daf"),
        new ObjectId("673af2c0a193a26bc7f43db0")
    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p2",
    "questionNumber" : "10",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac99e"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.877+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dad"),
    "externalId" : "Q11_1731916471921-1731916480375",
    "question" : [
        "When did you last take a course on ELEVATE?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "date",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true,
        "max" : "",
        "min" : ""
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "dateFormat" : "DD-MM-YYYY",
    "autoCapture" : true,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p2",
    "questionNumber" : "10a",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9a4"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.895+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43dae"),
    "externalId" : "Q12_1731916471921-1731916480376",
    "question" : [
        "How would you rate the course taken?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "slider",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true,
        "max" : "5",
        "min" : "1"
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p2",
    "questionNumber" : "10b",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9ab"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.919+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43daf"),
    "externalId" : "Q13_1731916471921-1731916480377",
    "question" : [
        "How many courses have you taken?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "number",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "fileName" : [

    ],
    "validation" : {
        "required" : true,
        "IsNumber" : "true"
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p2",
    "questionNumber" : "10c",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9b2"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.942+0000"),
    "deleted" : false,
    "__v" : (0)
},
{
    "_id" : new ObjectId("673af2c0a193a26bc7f43db0"),
    "externalId" : "Q14_1731916471921-1731916480378",
    "question" : [
        "Which courses did you go through?",
        ""
    ],
    "tip" : "",
    "hint" : "",
    "responseType" : "text",
    "value" : "",
    "isCompleted" : false,
    "showRemarks" : false,
    "remarks" : "",
    "visibleIf" : "",
    "options" : [

    ],
    "sliderOptions" : [

    ],
    "children" : [

    ],
    "questionGroup" : [
        "A1"
    ],
    "questionType" : "auto",
    "modeOfCollection" : "onfield",
    "usedForScoring" : "",
    "file" : {
        "required" : true,
        "type" : [
            "image/jpeg",
            "docx",
            "pdf",
            "ppt"
        ],
        "minCount" : (0),
        "maxCount" : (10),
        "caption" : "FALSE"
    },
    "fileName" : [

    ],
    "validation" : {
        "required" : false
    },
    "accessibility" : "No",
    "canBeNotApplicable" : "false",
    "instanceQuestions" : [

    ],
    "isAGeneralQuestion" : false,
    "autoCapture" : false,
    "rubricLevel" : "",
    "sectionHeader" : "",
    "allowAudioRecording" : false,
    "page" : "p2",
    "questionNumber" : "10d",
    "weightage" : (1),
    "prefillFromEntityProfile" : false,
    "entityFieldName" : "",
    "isEditable" : true,
    "showQuestionInPreview" : false,
    "createdFromQuestionId" : new ObjectId("673af2be83466a9d854ac9b9"),
    "updatedAt" : new Date("2024-11-18T07:54:40.382+0000"),
    "createdAt" : new Date("2024-11-18T07:54:38.972+0000"),
    "deleted" : false,
    "__v" : (0)
}
]


let frameworkData = [
{
    "_id" : new ObjectId("66f4e6208ea984c17a5b3744"),
    "externalId" : "606d92fa-42d8-11ec-ac61-26092024-1011",
    "name" : "NISHTHA 2.0 Feedback Form",
    "description" : "NISHTHA 2.0 feedback form",
    "author" : "",
    "parentId" : null,
    "resourceType" : [ 
        "Observations Framework"
    ],
    "language" : [ 
        "English"
    ],
    "keywords" : [ 
        "Framework", 
        "Observation", 
        "Feedback form"
    ],
    "concepts" : [],
    "createdFor" : [],
    "scoringSystem" : null,
    "levelToScoreMapping" : {
        "L1" : {
            "points" : 100,
            "label" : "Good"
        }
    },
    "themes" : [ 
        {
            "type" : "theme",
            "label" : "theme",
            "name" : "Observation Theme",
            "externalId" : "OB",
            "weightage" : 100,
            "criteria" : [ 
                {
                    "criteriaId" : "66f4e5f08ea984c17a5b3741",
                    "weightage" : 100
                }
            ]
        }
    ],
    "noOfRatingLevels" : 1,
    "isRubricDriven" : false,
    "updatedBy" : "INITIALIZE",
    "isDeleted" : false,
    "entityTypeId" : new ObjectId("5f32d8228e0dc83124040567"),
    "entityType" : "school",
    "rootOrganisations" : [],
    "updatedAt" : new Date("2024-09-26T04:42:08.974Z"),
    "createdAt" : new Date("2021-11-11T10:16:02.564Z"),
    "deleted" : false,
    "__v" : 0
},
{
    "_id" : new ObjectId("673af2bc83466a9d854ac956"),
    "externalId" : "5b4081c4-a582-11ef-b023-743af4776910",
    "name" : "ObservationWithoutRubrics",
    "description" : "Survey Form to understand the challenges that the parents are facing in getting their children enrolled in ELEVATE courses ",
    "author" : null,
    "parentId" : null,
    "resourceType" : [
        "Observations Framework"
    ],
    "language" : [
        "English"
    ],
    "keywords" : [
        "Framework",
        "Observation"
    ],
    "concepts" : [

    ],
    "createdFor" : [
        null
    ],
    "scoringSystem" : null,
    "themes" : [
        {
            "name" : "Observation Theme",
            "type" : "theme",
            "label" : "theme",
            "externalId" : "OB",
            "weightage" : (40),
            "criteria" : [
                {
                    "criteriaId" : new ObjectId("673af2bc83466a9d854ac952"),
                    "weightage" : (40)
                },
                {
                    "criteriaId" : new ObjectId("673af2bc83466a9d854ac951"),
                    "weightage" : (40)
                }
            ]
        }
    ],
    "isRubricDriven" : false,
    "updatedBy" : "INITIALIZE",
    "isDeleted" : false,
    "entityTypeId" : null,
    "entityType" : "school",
    "rootOrganisations" : [

    ],
    "updatedAt" : new Date("2024-11-18T07:54:37.192+0000"),
    "createdAt" : new Date("2024-11-18T13:24:36.705+0000"),
    "deleted" : false,
    "__v" : (0)
}
]




module.exports = {
    solutionData,
    criteriaData,
    questionsData,
    criteriaQuestionsData,
    frameworkData,
}