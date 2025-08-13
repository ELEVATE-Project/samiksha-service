/**
 * name : v1.js
 * author : PraveenDass
 * created-date : 07-Aug-2025
 * Description :  Library categories validation.
 */




module.exports = (req) => {
	let projectsValidator = {
		create: function () {
			req.checkBody('externalId').exists().withMessage('externalId is required')
			req.checkBody('name').exists().withMessage('name is required')
		},
		update: function () {
			req.checkParams('_id').exists().withMessage('required category id')
		},
	}

	if (projectsValidator[req.params.method]) {
		projectsValidator[req.params.method]()
	}
}
