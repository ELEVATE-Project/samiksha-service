/**
 * name : checkAdminRole.js
 * author : Mallanagouda R Biradar
 * Date : 7-Aug-2025
 * Description : checkAdminRole middleware.
 */
var messageUtil = require('./lib/messageUtil');
var responseCode = require('../httpStatusCodes');
const jwt = require('jsonwebtoken');
var reqMsg = messageUtil.REQUEST;

module.exports = async function (req, res, next) {
  // Define paths that require admin role validation
  let adminPath = ['admin/deleteResource'];
  // Initialize response object for error formatting
  let rspObj = {};
  // Flag to check if the current request path needs admin validation
  let checkAdminRole = false;

  // Check if the incoming request path matches any admin paths
  await Promise.all(
    adminPath.map(async function (path) {
      if (req.path.includes(path)) {
        checkAdminRole = true;
      }
    })
  );

  // If path needs admin check, validate the user's role using JWT token
  if (checkAdminRole) {
    // Get token from request headers
    token = req.headers['x-auth-token'];
    // If no token found, return unauthorized error
    if (!token) {
      rspObj.errCode = reqMsg.TOKEN.MISSING_CODE;
      rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE;
      rspObj.responseCode = responseCode.unauthorized.status;
      return res.status(responseCode['unauthorized'].status).send(respUtil(rspObj));
    }

    let decodedToken;
    try {
      // Decode and verify JWT token using secret key
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // If token is invalid or expired, return unauthorized
    } catch (error) {
      return res.status(httpStatusCode.unauthorized.status).send(
        respUtil({
          errCode: reqMsg.TOKEN.MISSING_CODE,
          errMsg: reqMsg.TOKEN.MISSING_MESSAGE,
          responseCode: responseCode.unauthorized.status,
        })
      );
    }

    // Extract roles from decoded token payload
    let fetchRoleFromToken = decodedToken.data.organizations[0].roles;

    // Convert roles array to list of role titles
    let roles = fetchRoleFromToken.map((roles) => {
      return roles.title;
    });

    // Check if user has the admin role
    if (roles.includes(messageConstants.common.ADMIN)) {
      // If admin, allow the request to continue
      return next();
    } else {
      // If not admin, throw forbidden error
      return next({
        status: responseCode.forbidden.status,
        message: reqMsg.ADMIN_TOKEN_MISSING_MESSAGE,
      });
    }
  }

  next();
  return;
};
