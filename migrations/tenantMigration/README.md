# Tenant Migration Script

## Overview

This script performs **tenant and organization migration** across multiple MongoDB collections.
It updates documents that belong to an **old tenant and organization** and migrates them to a **new tenant and organization**.

The script supports:

* Batch processing for large collections
* Entity ID resolution through the **Entity Management Service**
* Dry-run mode for safe testing
* Detailed JSON logging for every migration run
* Parallel execution for faster migration

---

# Prerequisites

Before running the script ensure the following are available.

### 1. Node.js

Recommended version:

```
Node.js >= 16
```

### 2. MongoDB Access

You must have access to the database with the following environment variables.

```
MONGODB_URL=<mongodb_connection_string>
DB=<database_name>
```

### 3. Environment Variables (.env)

Create a `.env` file in the project root.

Example:

```
MONGODB_URL=mongodb://localhost:27017
DB=elevate
ENTITY_MANAGEMENT_SERVICE_URL=http://localhost:3000
INTERNAL_ACCESS_TOKEN=<token>
```

---

# CLI Parameters

To run the script:
```
cd migrations/tenantMigration
```

The script requires the following arguments.

| Parameter       | Description               |
| --------------- | ------------------------- |
| `--oldTenantId` | Existing tenant ID        |
| `--newTenantId` | Target tenant ID          |
| `--oldOrgId`    | Existing organization ID  |
| `--newOrgId`    | Target organization ID    |
| `--author`      | User performing migration |

Example:

```
node tenantMigration.js \
--oldTenantId=oldTenant \
--newTenantId=newTenant \
--oldOrgId=org1 \
--newOrgId=org2 \
--author=1
```

---

# Dry Run Mode

By default the script runs in **dry run mode**.

```
const dryRun = true;
```

This means:

* No database updates occur
* The script logs which documents **would be updated**

To perform the actual migration:

```
const dryRun = false;
```

---

# Collections Migrated

The script migrates the following collections.

### Phase 1 – Simple Collections

These collections only require tenant and org updates.

* `criteria`
* `frameworks`
* `questions`
* `criteriaQuestions`
* `userExtension`

---

### Phase 2 – Entity Resolution Collections

These collections require additional entity mapping.

* `solutions`
* `programs`
* `observations`
* `observationSubmissions`
* `surveys`
* `surveySubmissions`

---

# Migration Behaviour

## Tenant & Org Update

Documents matching:

```
tenantId = oldTenantId
orgId = oldOrgId
```

are updated to:

```
tenantId = newTenantId
orgId = newOrgId
```

---

## Entity Resolution

Some collections store entity references that must be migrated.

The script:

1. Reads entity IDs stored in documents
2. Looks up the new entity via:

```
metaInformation.tenantMigrationReferenceId
```

3. Replaces old entity IDs with the new ones.

---

## Special Case: userExtension

The `userExtension` collection stores organization IDs as an array.

Example:

```
orgIds: ["tan90", "tn01"]
```

During migration:

```
orgIds: ["tan90", "tn01"]
```

becomes

```
orgIds: ["newOrgId", "tn01"]
```

Only the matching org ID is replaced.

---

# Batch Processing

Large collections are processed in batches.

```
const BATCH_SIZE = 100
```

Benefits:

* Prevents memory overload
* Improves performance
* Reduces database load

---

# Logging

Every migration generates a **JSON log file**.

Example:

```
migration_log_2026-03-05T12-30-10-123Z.json
```

Log structure:

```
{
  startedAt,
  dryRun,
  params,
  collections: {
    collectionName: {
      modifiedCount,
      updatedIds,
      error,
      timestamp
    }
  },
  errors,
  completedAt
}
```

This helps track:

* Documents updated
* Failed collections
* Migration status

---

# Migration Flow

```
Start Migration
       │
       │
Connect MongoDB
       │
       │
Phase 1 (Parallel)
Simple Collections
       │
       │
Phase 2 (Parallel)
Entity Resolution Collections
       │
       │
Write Logs
       │
       │
Close Database Connection
```

---

# Error Handling

The script uses:

```
Promise.allSettled()
```

This ensures:

* Migration continues even if one collection fails
* Errors are logged instead of stopping execution

---

# Safety Recommendations

Before running migration:

1. Take a **full database backup**
2. Run with **dryRun = true**
3. Review the generated **migration log**
4. Set `dryRun = false` for the final migration

---

# Example Execution

Dry Run:

```
node tenantMigration.js \
--oldTenantId=sl \
--newTenantId=tn \
--oldOrgId=tan90 \
--newOrgId=tn01 \
--author=1
```

Production Run:

```
const dryRun = false
```

Then execute the same command.

---

# Notes

* Surveys and Survey Submissions currently **retain existing user IDs**.
* Future enhancement: integrate **user service lookup** to migrate user IDs.

---

# Author

Tenant Migration Script for Elevate / Samiksha platform.
