// helpers/Cache.helper.js
const NodeCache = require('node-cache');

const tenantCache = new NodeCache();
const CACHE_TTL_SECONDS = Number(process.env.TENANT_CACHE_TTL);

const cacheKey = (tenantId) => `tenant_${tenantId}`;

 /**
   * getCached data based on the passed tenantId 
   * @method
   * @name getCached
   * @param {string} tenantId - tenantId details
   * @returns {JSON} sucess data.

   */


function getCached(tenantId) {
  return tenantCache.get(cacheKey(tenantId)) || null;
}

 /**
   * setCached based on the passed tenantId 
   * @method
   * @name setCached
   * @param {string} tenantId - tenantId details
   * @param {JSON} data - data to be cached
   */

function setCached(tenantId, data) {
  tenantCache.set(cacheKey(tenantId), data, CACHE_TTL_SECONDS);
}


 /**
   * clearTenantCache based on the passed tenantId 
   * @method
   * @name clearTenantCache
   * @param {string} tenantId - tenantId details
   * @returns {JSON} successObject.
   */

function clearTenantCache(tenantId) {
  const deleted = tenantCache.del(cacheKey(tenantId));
  return {
    success: true,
    message: deleted
      ? `Cache cleared for tenant ${tenantId}`
      : `No cache found for tenant ${tenantId}`,
  };
}

module.exports = { getCached, setCached, clearTenantCache };