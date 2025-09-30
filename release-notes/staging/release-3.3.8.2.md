# 🚀 Survey-Service Release 3.3.8.2

## 🐞 Bug Fixes

- **Kafka Health Issue** – Fixed failure occurring in kafka health checks for service when multiple instances are deployed.

## 📌 Migration

- Execute the following data migration scripts after deployment:
  - `migrations/normalizeOrgIdInCollections/normalizeOrgIdInCollections.js` – Normalize orgId/orgIds fields in collections
  - `migrations/correctScopeOrgValues/correctScopeOrgValues.js` – Normalize orgId/orgIds fields in solution scope if present
