# 📊 Samiksha Service - Admin Resource Deletion API

## Overview
This document provides a simple reference for the **support** and **implementation** teams to delete a **program** or **solution** along with all related survey and observation data within **Samiksha Service**.

---

## 🔐 Authorization
- Admin-only access
- Requires all proper tokens and headers

---

## 🛠️ API Endpoint

```
POST /survey/v1/admin/deleteResource/:id?type={program|solution}
```

---

## 📥 Request Parameters

| Parameter | Type   | Description                         |
|-----------|--------|-------------------------------------|
| `:id`     | String | Resource ID (Program/Solution)      |
| `type`    | String | Either `program` or `solution`      |

---

## 🧩 Headers

- `Content-Type: application/json`
- `internal-access-token: <internal-access-token>`
- `x-auth-token: <user-token>`
- `admin-auth-token: <admin-auth-token>`
- `tenantId: shikshagraha`
- `orgId: blr`

---

## 📤 Example cURL Commands

### 🔁 Delete a **Program**:
```bash
curl --location --request POST 'http://localhost:4301/survey/v1/admin/deleteResource/68260d66b063136922f947c9?type=program' \
--header 'x-auth-token: <user-token>' \
--header 'internal-access-token: <internal-access-token>' \
--header 'Content-Type: application/json' \
--header 'admin-auth-token: <admin-auth-token>' \
--header 'tenantId: shikshagraha' \
--header 'orgId: blr'
```

### 🔁 Delete a **Solution**:
```bash
curl --location --request POST 'http://localhost:4301/survey/v1/admin/deleteResource/68260d66b063136922f947c9?type=solution' \
--header 'x-auth-token: <user-token>' \
--header 'internal-access-token: <internal-access-token>' \
--header 'Content-Type: application/json' \
--header 'admin-auth-token: <admin-auth-token>' \
--header 'tenantId: shikshagraha' \
--header 'orgId: blr'
```

---

## ✅ Response Sample

```json
{
  "message": "Solution and associated resources deleted successfully",
  "status": 200,
  "result": {
    "programDeletedCount": 1,
    "solutionDeletedCount": 1,
    "surveyCount": 0,
    "surveySubmissionCount": 0,
    "observationCount": 0,
    "observationSubmissionCount": 0,
    "pullProgramFromUserExtensionCount": 0
  }
}
```

---

## Notes
- Kafka topic: `RESOURCE_DELETION_TOPIC`
- Deletion logs recorded in: `resourceDeletionLog`
- Ensure all related templates, surveys, observations, and submissions are cleaned