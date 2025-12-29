const { Schema } = require('mongoose')

const solutionSchema = new Schema({
  externalId: String,
  isReusable: Boolean,
  name: {
    type: String,
    index: true,
  },
  description: {
    type: String,
    index: true,
  },
  author: String,
  parentSolutionId: 'ObjectId',
  resourceType: Array,
  language: Array,
  keywords: Array,
  concepts: Array,
  scoringSystem: String,
  levelToScoreMapping: Object,
  themes: Array,
  flattenedThemes: Array,
  questionSequenceByEcm: Object,
  entityType: String,
  type: String,
  subType: String,
  entities: Array,
  programId: 'ObjectId',
  programExternalId: String,
  programName: String,
  programDescription: String,
  entityProfileFieldsPerEntityTypes: Object,
	startDate: {
		type: Date,
		index: true
	},
	endDate: {
		type: Date,
		index: true
	},
  status: String,
  evidenceMethods: Object,
  sections: Object,
  registry: Array,
  frameworkId: 'ObjectId',
  frameworkExternalId: String,
  noOfRatingLevels: Number,
  isRubricDriven: { type: Boolean, default: false },
  enableQuestionReadOut: { type: Boolean, default: false },
  roles: Object,
  observationMetaFormKey: String,
  updatedBy: String,
  captureGpsLocationAtQuestionLevel: { type: Boolean, default: false },
  sendSubmissionRatingEmailsTo: String,
  creator: String,
  linkTitle: String,
  linkUrl: String,
  isAPrivateProgram: {
    default: false,
    type: Boolean,
  },
  assessmentMetaFormKey: String,
  allowMultipleAssessemts: {
    default: false,
    type: Boolean,
  },
  isDeleted: {
    default: false,
    type: Boolean,
    index: true,
  },
  project: Object,
  referenceFrom: {
    type: String,
    index: true,
  },
  scope: {
    type: Object,
    default: {},
  },
  pageHeading: {
    default: 'Domains',
    type: String,
  },
  criteriaLevelReport: Boolean,
  license: Object,
  link: {
    type: String,
    index: true,
  },
  minNoOfSubmissionsRequired: {
    type: Number,
    default: 1,
  },
  availableForPrivateConsumption: {
    type: Boolean,
    default: false,
  },
  reportInformation: Object,
  certificateTemplateId: 'ObjectId',
  rootOrganisations: Array,
  createdFor: Array,
  projectTemplateId: {
    type: 'ObjectId',
    index: true,
  },
  orgId: {
    type: String,
    required: true,
    index: true,
  },
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  isExternalProgram: {
    default: false,
    type: Boolean,
  },
  parentEntityKey: {
    type: String,
    default: null,
  },
  visibleToOrganizations: {
    type: Array,
    default: [],
    index: true,
  },
  visibility: {
    type: String,
    index: true,
    enum: ['CURRENT', 'ASSOCIATED', 'ALL'], 
    default: 'CURRENT'
  },
  categories: [],
})

// pre hook invoked before creating a document
solutionSchema.pre('validate', function (next) {
	if (this.startDate && this.endDate && this.startDate >= this.endDate) {
		return next(new Error('startDate must be less than endDate'))
	}
	next()
})

// pre hook invoked before updating a document
solutionSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
	const update = this.getUpdate()
	const set = update.$set || {}

	const startDate = set.startDate ?? update.startDate
	const endDate = set.endDate ?? update.endDate

	// If both provided in update, validate directly
	if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
		return next(new Error('startDate must be less than endDate'))
	}

	// If only one provided, fetch existing document
	if (startDate || endDate) {
		const doc = await this.model.findOne(this.getQuery()).select('startDate endDate')

		const finalStartDate = startDate ?? doc?.startDate
		const finalEndDate = endDate ?? doc?.endDate

		if (finalStartDate && finalEndDate && finalStartDate >= finalEndDate) {
			return next(new Error('startDate must be less than endDate'))
		}
	}

	next()
})

module.exports = {
  name: 'solutions',
  schema: solutionSchema,
  compoundIndex: [
    {
      name: { externalId: 1, tenantId: 1, orgId: 1 },
      indexType: { unique: true },
    },
  ],
};
