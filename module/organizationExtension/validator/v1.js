/**
 * name : v1.js
 * author : PraveenDass
 * created-date : 07-Aug-2025
 * Description :  organizationExtension validation.
 */

module.exports = (req) => {
    let organizationExtensionValidator = {
      update: function () {
        req
          .checkParams('_id')
          .exists()
          .withMessage('required orgExtension id')
          .isMongoId()
          .withMessage('invalid orgExtension id');
      },
    };
  
    if (organizationExtensionValidator[req.params.method]) {
        organizationExtensionValidator[req.params.method]();
    }
  };
  