/**
 * name : v1.js
 * author : PraveenDass
 * created-date : 07-Aug-2025
 * Description :  Library categories validation.
 */

module.exports = (req) => {
  let categoriesValidator = {
    create: function () {
      req
        .checkBody('externalId')
        .exists()
        .withMessage('externalId is required')
        .notEmpty()
        .withMessage('externalId cannot be empty')
        .isString()
        .withMessage('externalId must be a string');
      req
        .checkBody('name')
        .exists()
        .withMessage('name is required')
        .notEmpty()
        .withMessage('name cannot be empty')
        .isString()
        .withMessage('name must be a string');
    },
    update: function () {
      req
        .checkParams('_id')
        .exists()
        .withMessage('required category id')
        .isMongoId()
        .withMessage('invalid category id');
    },
  };

  if (categoriesValidator[req.params.method]) {
    categoriesValidator[req.params.method]();
  }
};
