module.exports = {
  name: 'questions',
  schema: {
    externalId: {
      type: String,
      index: true,
    },
    question: Array,
    tip: String,
    hint: String,
    placeHolder: String,
    responseType: String,
    displayType: String,
    requireDynamicAnswers: {
      type: Boolean,
      default: false,
    },
    value: String,
    isCompleted: { type: Boolean, default: false },
    showRemarks: { type: Boolean, default: false },
    remarks: String,
    visibleIf: Object,
    createdBy: String,
    updatedBy: String,
    options: Array,
    sliderOptions: Array,
    children: Array,
    questionGroup: Array,
    questionType: String,
    modeOfCollection: String,
    usedForScoring: String,
    file: { type: Object, default: {} },
    fileName: Array,
    validation: Object,
    accessibility: String,
    instanceIdentifier: String,
    noOfInstances: Number,
    notApplicable: String,
    canBeNotApplicable: String,
    instanceQuestionsString: String,
    instanceQuestions: Array,
    isAGeneralQuestion: { type: Boolean, default: false },
    dateFormat: String,
    autoCapture: { type: Boolean, default: false },
    rubricLevel: String,
    sectionHeader: String,
    allowAudioRecording: { type: Boolean, default: false },
    page: String,
    questionNumber: String,
    weightage: { type: Number, default: 1 },
    prefillFromEntityProfile: { type: Boolean, default: false },
    entityFieldName: { type: String, default: '' },
    isEditable: { type: Boolean, default: true },
    showQuestionInPreview: { type: Boolean, default: false },
    createdFromQuestionId: 'ObjectId',
    metaInformation: {
      config: {
         apiDomain: {
           type: String,         // e.g. https://service.example.com
         },
         apiEndPoint: {
           type: String,         // e.g. /api/v1/participants
         },
         apiMethod: {
           type: String,
           enum: ['GET', 'POST', 'PUT', 'PATCH'],
           default: 'GET',
         },
         headers: {
           type: Object,       // e.g. { Authorization: 'Bearer {{token}}'}
           default: {},
         },
         mapping: {
           label: {
             type: String,       // e.g. participant name
           },
           value: {
             type: String,       // e.g. participant id
           },
         },
         /**
          * Search support
          */
         searchEnabled: {
           type: Boolean,
           default: false,
         },
         search: {
           param: {
             type: String,       // e.g. search
           },
         },
 
         /**
          * Pagination support
          */
         paginationEnabled: {
           type: Boolean,
           default: false,
         },
         pagination: {
           pageParam: {
             type: String,       // e.g. page
           },
           limitParam: {
             type: String,       // e.g. limit
           },
           defaultLimit: {
             type: Number,
             default: 20,
           },
         },
       },
    }, 
    orgId: {
      type: String,
      require: true,
      index: true,
    },
    tenantId: {
      type: String,
      require: true,
      index: true,
    },
    reportType: {
      type: String,
      default: "default",
      set: (val) => (val && val.trim() !== "" ? val : "default"),
    }
  },
  compoundIndex: [
    {
      name: { externalId: 1, tenantId: 1, orgId: 1 },
      indexType: { unique: true },
    },
  ],
};