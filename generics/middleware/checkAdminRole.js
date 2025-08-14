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
const path = require('path');
const fs = require('fs');

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
      if (process.env.AUTH_METHOD === messageConstants.common.AUTH_METHOD.NATIVE) {
        try {
          // If using native authentication, verify the JWT using the secret key
          decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
          // If verification fails, send an unauthorized response
          rspObj.errCode = reqMsg.TOKEN.MISSING_CODE;
          rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE;
          rspObj.responseCode = responseCode.unauthorized.status;
          return res.status(responseCode['unauthorized'].status).send(respUtil(rspObj));
        }
      } else if (process.env.AUTH_METHOD === messageConstants.common.AUTH_METHOD.KEYCLOAK_PUBLIC_KEY) {
        // If using Keycloak with a public key for authentication
        const keycloakPublicKeyPath = `${process.env.KEYCLOAK_PUBLIC_KEY_PATH}/`;
        const PEM_FILE_BEGIN_STRING = '-----BEGIN PUBLIC KEY-----';
        const PEM_FILE_END_STRING = '-----END PUBLIC KEY-----';

        // Decode the JWT to extract its claims without verifying
        const tokenClaims = jwt.decode(token, { complete: true });

        if (!tokenClaims || !tokenClaims.header) {
          // If the token does not contain valid claims or header, send an unauthorized response
          rspObj.errCode = reqMsg.TOKEN.MISSING_CODE;
          rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE;
          rspObj.responseCode = responseCode.unauthorized.status;
          return res.status(responseCode['unauthorized'].status).send(respUtil(rspObj));
        }

        // Extract the key ID (kid) from the token header
        const kid = tokenClaims.header.kid;
        // Construct the path to the public key file using the key ID
        let filePath = path.resolve(__dirname, keycloakPublicKeyPath, kid.replace(/\.\.\//g, ''));
        // Read the public key file from the resolved file path
        const accessKeyFile = await fs.promises.readFile(filePath, 'utf8');
        // Ensure the public key is properly formatted with BEGIN and END markers
        const cert = accessKeyFile.includes(PEM_FILE_BEGIN_STRING)
          ? accessKeyFile
          : `${PEM_FILE_BEGIN_STRING}\n${accessKeyFile}\n${PEM_FILE_END_STRING}`;

        let verifiedClaims;
        try {
          // Verify the JWT using the public key and specified algorithms
          verifiedClaims = jwt.verify(token, cert, { algorithms: ['sha1', 'RS256', 'HS256'] });
        } catch (err) {
          // If the token is expired or any other error occurs during verification
          if (err.name === 'TokenExpiredError') {
            rspObj.errCode = reqMsg.TOKEN.INVALID_CODE;
            rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE;
            rspObj.responseCode = responseCode.unauthorized.status;
            return res.status(responseCode['unauthorized'].status).send(respUtil(rspObj));
          }
        }

        // Extract the external user ID from the verified claims
        const externalUserId = verifiedClaims.sub.split(':').pop();

        const data = {
          id: externalUserId,
          roles: [], // this is temporariy set to an empty array, it will be corrected soon...
          name: verifiedClaims.name,
          organization_id: verifiedClaims.org || null,
        };

        // Ensure decodedToken is initialized as an object
        decodedToken = decodedToken || {};
        decodedToken['data'] = data;
      }
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

    // Path to config.json
    let configFilePath;
    if (process.env.AUTH_CONFIG_FILE_PATH) {
      configFilePath = path.resolve(ROOT_PATH, process.env.AUTH_CONFIG_FILE_PATH);
    }
    // Initialize variables
    let configData = {};
    let defaultRoleExtraction;
    if (fs.existsSync(configFilePath)) {
      // Read and parse the config.json file
      const rawData = fs.readFileSync(configFilePath);
      try {
        configData = JSON.parse(rawData);
        if (!configData.userRolesInformationKey) {
          defaultRoleExtraction = decodedToken.data.organizations[0].roles;
        } else {
          defaultRoleExtraction = _.get({ decodedToken }, configData.userRolesInformationKey);
        }
      } catch (error) {
        console.error('Error parsing config.json:', error);
      }
    } else {
      // If file doesn't exist, set defaultRoleExtraction
      defaultRoleExtraction = decodedToken.data.organizations[0].roles;
    }
    if (!defaultRoleExtraction) {
      rspObj.errCode = reqMsg.TOKEN.INVALID_CODE;
      rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE;
      rspObj.responseCode = responseCode.unauthorized.status;
      return res.status(401).send(respUtil(rspObj));
    }
    // Convert roles array to list of role titles
    let roles = defaultRoleExtraction.map((roles) => {
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
