# Tenant Migration Script

## What Does This Script Do?
## NOTE: Cross-solution migrations are not supported. Ensure source and target belong to the same solution.
This script **moves data from one tenant/organization to another** inside a MongoDB database.

Think of it like a "find and replace" — but for your database. Every record that belongs to the **old tenant and old organization** gets updated to belong to the **new tenant and new organization**.

---

## Before You Begin — Checklist

Go through this list top to bottom before running anything.

### ✅ 1. Make sure Node.js is installed

Node.js is the runtime that executes the script. You need version 16 or higher.

To check if it is installed, open your terminal and run:

```bash
node --version
```

If you see something like `v18.0.0`, you are good. If you get an error, download and install Node.js from [https://nodejs.org](https://nodejs.org).

---

### ✅ 2. Back up your database

> ⚠️ **This is not optional.** Before running any migration — even in dry-run mode — take a full backup of the database. If something goes wrong, this is your safety net.

---

### ✅ 3. Create your `.env` file

The script needs to know where your database and services are running. You provide this information through a file named `.env`.

Create a file called `.env` in the same folder as the script and paste the following into it, filling in your actual values:

```env
MONGODB_URL=mongodb://localhost:27017
DB=elevate
ENTITY_MANAGEMENT_SERVICE_URL=http://localhost:3000
USER_SERVICE_URL=http://localhost:4000
INTERNAL_ACCESS_TOKEN=your_token_here
```

---

### ✅ 4. Create your `input.json` file

This file tells the script *which* tenant and organization to migrate from and to.

Create a file called `input.json` in the same folder as the script:

```json
{
  "loginCredentails": {
    "createrType": "admin",
    "createrUserName": "admin@example.com",
    "createrPassword": "password",
    "origin": "http://localhost"
  },
  "tenantMappingConfig": {
    "oldTenantId": "sl",
    "newTenantId": "tn",
    "oldOrgId": "tan90",
    "newOrgId": "tn01"
  }
}
```

| Field | What it means |
|---|---|
| `createrUserName` / `createrPassword` | Admin login credentials used to authenticate |
| `oldTenantId` | The ID of the tenant you are migrating **away from** |
| `newTenantId` | The ID of the tenant you are migrating **to** |
| `oldOrgId` | The ID of the organization you are migrating **away from** |
| `newOrgId` | The ID of the organization you are migrating **to** |

---

## How to Run the Script

### Step 1 — Navigate to the script folder

```bash
cd migrations/tenantMigration
```

### Step 2 — Do a dry run first (safe, no data is changed)

```bash
node tenantMigration.js --dry-run
```

This will:
- Scan your database
- Log exactly which documents *would* be updated and how many
- Write a detailed log file for your review
- **Not change anything in the database**

Review the log file (described below) before proceeding.

### Step 3 — Run the actual migration (only after reviewing the dry run)

```bash
node tenantMigration.js
```

This will perform the real migration and update documents in the database.

---

## Understanding the Log File

Every time you run the script — dry run or real — it creates a timestamped log file in the output directory:

```
migration_log_2026-03-05T12-30-10-123Z.json
```

Open this file to see:
- Which collections were scanned
- How many documents were (or would be) updated
- Any **warnings** — these are documents the script could not map and therefore skipped

> Pay close attention to warnings. A high number of skipped documents may indicate a configuration problem.

At the end of a run, the terminal will also show a summary like this:

```
📋 Migration Summary
──────────────────────────────────
  ✓ criteria        modified: 0
  ✓ frameworks      modified: 0
  ✓ solutions       modified: 0
  ...
  Total documents modified: 0

📄 Full log written to: migration_log_2026-03-05T12-30-10-123Z.json
```

---

## Optional — Adjusting Performance Settings

These are optional and only matter if you have a very large database or if downstream services are struggling under load.

### Concurrency (default: 10)

Controls how many network calls the script makes at the same time. Lower this number if you see a high error rate.

```bash
CONCURRENCY=5 node tenantMigration.js
```

### How batching works

The script processes documents in batches of 100 at a time. Within each batch, it makes up to 10 network calls in parallel (configurable via `CONCURRENCY`). This prevents the script from overwhelming your services.

---

## Retry Behaviour

If a network call to the Entity Management Service or User Service temporarily fails, the script automatically retries it:

| | |
|---|---|
| Maximum attempts | 3 |
| Wait before retry 1 | 300 ms |
| Wait before retry 2 | 600 ms |
| Wait before retry 3 | 1200 ms |

If a call fails permanently (e.g. a record is not found), the script logs a warning and skips that document — it does not crash.

---

## Recommended Migration Workflow

Follow these steps in order for a safe production migration:

1. **Back up the database** — do not skip this
2. **Fill in** `.env` and `input.json` with the correct values
3. **Run a dry run** and review the generated log file
4. **Check for warnings** — investigate any documents that were skipped
5. **Run the real migration** once you are satisfied with the dry run results

---

## Troubleshooting

| Problem | What to check |
|---|---|
| Script fails to connect to the database | Verify `MONGODB_URL` and `DB` in your `.env` file |
| High number of skipped documents | Check the warnings in the log file; entity IDs may not be resolving |
| Services returning errors under load | Lower `CONCURRENCY` to reduce parallel calls |
| Unexpected data after migration | Restore from your database backup and re-investigate |
---


### ✅ 5. Create your `input2.json` file

This file tells the script *which* survey and observationSubmissions will push to kafka.

Create a file called `input2.json` in the same folder as the script:

```json
{
    "surveySubmissionIds":[
        "6892fd6c624a2e47107b0944",
        "6892fd6c624a2e47107b0925"

    ],
    "observationSubmissionIds":[
       "6887974e41776da359cab741",
         "6887974e41776da359cab772"
    ]
}
```

| Field | What it means |
|---|---|
| `surveySubmissionIds` | The ID of the survey submission after the migration  **we will get this after running the tenantMigration.js** |
| `observationSubmissionIds` | The ID of the observation submission after the migration  **we will get this after running the tenantMigration.js** |

```bash
node pushSubmissionToKafka.js --domain=http://localhost:4301
```

Tenant Migration Script for the Elevate / Samiksha platform.