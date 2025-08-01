module.exports = (req) => {
  let adminValidator = {
    dbFind: function () {
      req.checkParams('_id').exists().withMessage('required mongodb collection name');
      req.checkBody('query').exists().withMessage('required mongoDB find query');
    },
    createIndex: function () {
      req.checkParams('_id').exists().withMessage('required mongodb collection name');
      req.checkBody('keys').exists().withMessage('required keys for indexing');
    },
    deletedResourceDetails: function () {
			req.checkParams('_id').exists().withMessage('required resource id')
			req.checkQuery('type')
				.exists()
				.withMessage('Resource type is required (program/solution)')
				.isIn(['program', 'solution'])
				.withMessage('Invalid resource type. Must be "program" or "solution"')
		},
  };

  if (adminValidator[req.params.method]) {
    adminValidator[req.params.method]();
  }
};
