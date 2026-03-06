# Tenant Migration Script

## Overview

This script performs **tenant and organization migration** across multiple MongoDB collections.
It updates documents that belong to an **old tenant and organization** and migrates them to a **new tenant and organization**.

The script supports:

* Batch processing with configurable concurrency for large collections
* Entity ID resolution through the **Entity Management Service**
* Automatic retry with exponential back-off on transient HTTP failures
* Dry-run mode for safe testing (enabled by default)
* Detailed JSON logging with buffered writes for performance
* Parallel execution with failure detection per phase

---

## Prerequisites

Before running the script ensure the following are available.

### 1. Node.js

```
Node.js >= 16
```

### 2. MongoDB Access

```
MONGODB_URL=<mongodb_connection_string>
DB=<database_name>
```

### 3. Environment Variables (.env)

Create a `.env` file in the project root.

```env
MONGODB_URL=mongodb://localhost:27017
DB=elevate
ENTITY_MANAGEMENT_SERVICE_URL=http://localhost:3000
USER_SERVICE_URL=http://localhost:4000
INTERNAL_ACCESS_TOKEN=<token>
```

### 4. Input File

Create an `input.json` file in the same directory as the script.

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

---

## CLI Usage

Navigate to the script directory first:

```bash
cd migrations/tenantMigration
```

### Dry Run (default — safe, no data modified)

```bash
node tenantMigration.js --dry-run
```

or using an environment variable:

```bash
DRY_RUN=true node tenantMigration.js
```

### Production Run

```bash
node tenantMigration.js
```

### Adjusting Concurrency

Control how many entity service HTTP calls run in parallel per batch (default: 10):

```bash
CONCURRENCY=5 node tenantMigration.js
```

Lower this value if the entity service shows high error rates under load.

---

## Dry Run Mode

Dry run is **enabled by default** via the `--dry-run` flag or `DRY_RUN=true` env var.
The script will never modify data unless invoked without either of those.

When dry run is active:

* No database writes occur
* The script logs which documents **would be updated** and how many per collection
* A full JSON log file is still generated for review

---



## Batch Processing & Concurrency

Large collections are processed in batches:

```
BATCH_SIZE = 100  (documents per batch)
CONCURRENCY = 10  (max parallel HTTP calls per batch, tunable via env)
```

Within each batch, entity service and user service calls are throttled by the concurrency limiter so the downstream services are not overwhelmed.

---

## Retry Logic

All HTTP calls to the Entity Management Service and User Service are automatically retried on transient failures (network errors, 5xx responses).

| Setting | Default |
|---|---|
| Max attempts | 3 |
| Base delay | 300 ms |
| Back-off | Exponential (300 → 600 → 1200 ms) |

4xx errors and business-level failures are **not** retried — they are logged as warnings and the document is skipped.

---

## Logging

Every migration run generates a timestamped **JSON log file** in the script directory.

```
migration_log_2026-03-05T12-30-10-123Z.json
```

Log writes are **buffered** and flushed once per batch (not once per document) to avoid excessive disk I/O on large datasets.

---



## Safety Recommendations

Before running a production migration:

1. Take a **full database backup**
2. Run with `--dry-run` and review the generated log
3. Check `warnings` in the log for unmapped entities
4. Set `CONCURRENCY` to a safe value for your entity service capacity
5. Run without `--dry-run` for the actual migration

---


─────────────────────────────────────────────────────────────────
📋 Migration Summary
─────────────────────────────────────────────────────────────────
  ✓ criteria                     modified: 0
  ✓ frameworks                   modified: 0
  ✓ solutions                    modified: 0
  ...
  Total documents modified: 0

📄 Full log written to: migration_log_2026-03-05T12-30-10-123Z.json
```

---

## Author

Tenant Migration Script for Elevate / Samiksha platform.