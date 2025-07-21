module.exports = {
    name: 'userCourses',
    schema: {
      status: {
        type: String,
        index: true,
      },
      userId: String,
      completedAt: Date,
      updatedAt: Date,
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
      isAPrivateProgram: {
        default: false,
        type: Boolean,
      },
      programInformation: Object,
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
      project: Object,
      referenceFrom: String,
      isExternalProgram:{
        default : false,
        type : Boolean
      }
    },
    compoundIndex: [
      {
        name: { solutionId: 1, userId: 1},
        indexType: { unique: true, partialFilterExpression: { solutionId: { $exists: true } } },
    },
    ],
  };
  