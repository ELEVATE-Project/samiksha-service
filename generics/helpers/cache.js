// helpers/Cache.helper.js
/**
 * name : cache.js
 * author : PraveenDass
 * created-date : 20-Apr-2026
 * Description : cache related functions.
 */

const NodeCache = require('node-cache');

const tenantCache = new NodeCache();
const CACHE_TTL_SECONDS = Number(process.env.TENANT_CACHE_TTL);


 /**
   * getCached data based on the passed tenantId 
   * @method
   * @name getCached
   * @param {string} tenantId - tenantId details
   * @returns {JSON} sucess data.

   */


function getCached(tenantId) {
  return tenantCache.get(tenantId) || null;
}

 /**
   * setCached based on the passed tenantId 
   * @method
   * @name setCached
   * @param {string} tenantId - tenantId details
   * @param {JSON} data - data to be cached
   */

function setCached(tenantId, data) {
  tenantCache.set(tenantId, data, CACHE_TTL_SECONDS);
}


 /**
   * clearTenantCache based on the passed tenantId 
   * @method
   * @name clearCache
   * @param {string} cacheIdentifier - tenantId details
   * @returns {JSON} successObject.
   */

function clearCache(cacheIdentifier) {
  const deleted = tenantCache.del(cacheIdentifier);
  return {
    success: true,
    message: deleted
      ? `Cache cleared for  ${cacheIdentifier}`
      : `No cache found for  ${cacheIdentifier}`,
  };
}

module.exports = { getCached, setCached, clearCache };