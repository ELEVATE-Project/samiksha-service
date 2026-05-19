# 🚀 Survey-Service Release 3.4.0

## ✨ Features

- **[1557] List All Solution Types under Program** – Extended program details API to display all solution types (not just projects) under a program.
- **[1564] Course under Program** – Added ability to include courses as solutions under a program.
- **[1547] Solution Sequencing** – Introduced sequencing support to list solutions in the order defined in a program.
- **[1558] Resource Deletion** – Implemented APIs to allow deletion of programs/solutions and associated resources.
- **Health Check** – Introduced a health check feature with relevant API endpoints for system monitoring.
- **Org Policies** - Introduced org policies in library flow to allow the users to access resources despite of organization boundaries.

---

## 🐞 Bug Fixes

- **[3359] Custom Entity-Type for Observation** – Fixed support for custom entity-types in observations when not associated with a parent entity.
- **[3462] Solution Update API Enhancement** – Improved solution update API with additional support.
- **[4530] Evidence Attached On In App Reports Is Expired OR Not Working As Expected.** – Refreshed preview urls are passed for every API call

---

## 🔄 Migration Instructions

Execute the following data migration scripts after deployment:

- `migrations/normalizeOrgIdInCollections/normalizeOrgIdInCollections.js` – Normalize `orgId/orgIds` fields in collections.
- `migrations/correctScopeOrgValues/correctScopeOrgValues.js` – Normalize `orgId/orgIds` fields in solution scope if present.
- `migrations/updateComponentsOfAllPrograms.js` – Updates components of existing program with sequence.
-   `migrations/createOrgExtensions/createOrgExtensions.js` - This script helps to create default org policies & updates projectCategories collections.
---

👨‍💻 **Service:** Survey Service  
🏷️ **Version:** 3.4.0
