# 🚀 Program to Project Migration Script

This script migrates resources from a Survey Service program to a Project Service program, updates references across collections, pushes submission updates to Kafka, and aligns the data structure between services.

---

## ⚙️ What the Script Does

- Updates program references in:
  - `solutions`
  - `surveys`
  - `surveySubmissions`
  - `observations`
  - `observationSubmissions`
- Pushes submission updates (completed/incomplete) to Kafka.
- Updates the **components** field in the Project Service.
- Marks old Survey Service programs as **inactive**.
- Generates a unique result file with migration logs.

---

## ⚠️ IMPORTANT NOTE

The Project Service program update currently uses the **older `components` structure** (simple array of solution IDs).

If your Project Service has migrated to the **new format with `order` keys** in components:

```
components: [
  { _id: "solutionId1", order: 1 },
  { _id: "solutionId2", order: 2 }
]
```

➡️ **You must modify the payload structure inside the script** before running it.

---

## 📂 Affected Collections

- `programs`
- `solutions`
- `surveys`
- `surveySubmissions`
- `observations`
- `observationSubmissions`

---

## 🧾 Requirements

- Node.js installed  
- MongoDB access  
- `.env` file **in the parent directory (`../.env`)** containing:

```env
MONGODB_URL=<your_mongo_connection_url>
DB=<your_db_name>
IMPROVEMENT_PROJECT_BASE_URL=<project_service_base_url>
INTERNAL_ACCESS_TOKEN=<internal_access_token>
PROJECT_SERVICE_NAME=project
```

---

## 🧨 BEFORE RUNNING THE SCRIPT — VERY IMPORTANT

### ✅ Take a backup  
**Take a FULL backup of both Project Service and Survey Service databases.**

### ✅ Inform Data Team  
Data team must be notified before execution.

### ✅ Metabase Cleanup  
Metabase team must delete few old duplicate/invalid tables before corrected data is pushed.

> **Do not run the migration until all these steps are completed.**

---

## 🧾 Command to Run the Script

Example:

```bash
node migrateResourcesBetweenPrograms.js \
  --tenantId=shikshalokam \
  --projectServiceProgramId=68db7e07c24cb20014ffbc47 \
  --surveyServiceProgramId=68e36ff5a634a9291cc1c5b5 \
  --domain=https://elevate-apis.shikshalokam.org \
  --identifier=nevil@tunerlabs.com \
  --password=PASSword###11 \
  --origin=default-qa.tekdinext.com \
  --projectdb=elevate_project_saas
```

---

## 📌 CLI Argument Reference

| Argument                    | Required | Description |
| --------------------------- | -------- | ----------- |
| `--tenantId`                | ✅ | Tenant ID for which both program IDs belong. |
| `--projectServiceProgramId` | ✅ | Destination program ID in Project Service. |
| `--surveyServiceProgramId`  | ✅ | Source program ID in Survey Service. |
| `--domain`                  | ✅ | Base URL of the environment (e.g., `https://dev.elevate-apis.shikshalokam.org`). |
| `--identifier`              | ✅ | Admin user identifier. |
| `--password`                | ✅ | Admin password. |
| `--origin`                  | ✅ | Origin header for login API. |
| `--projectdb`               | ✅ | **DB name used by Project Service**. |

---

## 🗂️ Folder Structure (Docker Setup)

If your service has a Docker setup and a `migrations` folder, follow this structure:

```
migrations/
└── migrateResourcesBetweenPrograms/
    ├── migrateResourcesBetweenPrograms.js
    ├── migrationUtils/
    │   └── helper.js
```

### Setup Steps
1. Inside `migrations/`, create:  
   `migrateResourcesBetweenPrograms/`
2. Add the script file:
   - `migrateResourcesBetweenPrograms.js`
3. Inside that directory, create:
   - `migrationUtils/`
4. Add:
   - `helper.js`

Ensure the folder structure exactly matches this layout.

---

## ✔️ Summary

- Migrates all resources from Survey Service program → Project Service program.
- Performs DB updates across multiple collections.
- Pushes required updates to Kafka.
- Deactivates old programs.
- Requires `--projectdb` to identify the Project Service DB.
- Must take DB backups **before running**.
- Metabase team actions are required before correcting data.
- Works inside a Docker-based migration folder structure.

---

## 📌 Final Note

Always test in **dev** before running in QA or production.

