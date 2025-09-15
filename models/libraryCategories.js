/**
 * name : libraryCategories.js
 * author : Aman
 * created-date : 23-Jun-2020
 * Description : Library categories.
 */

module.exports = {
  name: 'libraryCategories',
  schema: {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    externalId: {
      type: String,
      required: true,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'active',
    },
    updatedBy: {
      type: String,
      default: 'SYSTEM',
    },
    createdBy: {
      type: String,
      default: 'SYSTEM',
    },
    noOfSolutions: {
      type: Number,
      default: 0,
    },
    tenantId: {
      type: String,
      index: true,
      required: true,
      default: 'default',
    },
    orgId: {
      type: String,
      index: true,
      required: true,
      default: 'default_code',
    },
    visibleToOrganizations: {
      type: Array,
      default: [],
      required: true,
      index: true,
    },
  },
  compoundIndex: [
		{
			name: { externalId: 1, tenantId: 1 },
			indexType: { unique: true },
		},
	],
};
