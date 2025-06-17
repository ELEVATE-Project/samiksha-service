/**
 * name : index.js.
 * author : Aman Karki.
 * created-date : 02-Feb-2021.
 * Description : Health check Root file.
 */

let healthCheckService = require('./healthCheckService');

module.exports = function (app) {
  const servicePath = `/${process.env.SERVICE_NAME}`
  app.get(`${servicePath}/health`, healthCheckService.health_check)
  app.get(`${servicePath}/healthCheckStatus`, healthCheckService.healthCheckStatus)
};
