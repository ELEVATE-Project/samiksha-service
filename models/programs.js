const { Schema } = require('mongoose')

const programSchema = new Schema({
  externalId: String,
  name: {
    type : String,
    index : true
  },
  description: {
    type : String,
    index : true
  },
  owner: String,
  createdBy: String,
  updatedBy: String,
  status: {
    type : String,
    index : true
  },
  startDate:{
    type: Date, 
    index: true
  },
  endDate: {
    type : Date,
    index : true
  },
  resourceType: [String],
  language: [String],
  keywords: [String],
  concepts: ["json"],
  imageCompression: {},
  components: ["json"],
  components: ["json"],
  isAPrivateProgram : {
    default : false,
    type : Boolean,
    index : true
  },
  scope : {
    type: Object,
    entityType : String,
    entities : {
      type : Array,
      index : true
    },
    roles : [{
      _id : "ObjectId",
      code : {
        type : String,
        index : true
      }
    }]
  },
  isDeleted: {
    default : false,
    type : Boolean,
    index : true
  },
  requestForPIIConsent: Boolean,
  metaInformation: Object,
  rootOrganisations : {
    type : Array,
    require : true
  },
  createdFor : Array,
  orgId:{
    type: String,
    require: true,
    index:true
  },
  tenantId: {
    type: String,
    require: true,
    index:true
  }
})



// pre hook invoked before creating a document
programSchema.pre('validate', function (next) {
	if (this.startDate && this.endDate && this.startDate >= this.endDate) {
		return next(new Error('startDate must be less than endDate'))
	}
	next()
})

// pre hook invoked before updating a document
programSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
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
  name: "programs",
  schema: programSchema,
  compoundIndex: [
		{
			name: { externalId: 1, tenantId: 1, orgId: 1 },
			indexType: { unique: true },
		},
	],
};
