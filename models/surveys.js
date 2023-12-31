module.exports = {
  name: 'surveys',
  schema: {
    name: String,
    description: String,
    createdBy: {
      type: String,
      index: true,
      required: true,
    },
    solutionId: {
      type: 'ObjectId',
      index: true,
      required: true,
    },
    programId: {
      type: 'ObjectId',
      index: true,
    },
    programExternalId: {
      type: String,
      index: true,
    },
    solutionExternalId: {
      type: String,
      index: true,
      required: true,
    },
    startDate: Date,
    endDate: Date,
    status: String,
    createdFor: [String],
    rootOrganisations: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isAPrivateProgram: {
      default: false,
      type: Boolean,
    },
  },
};
