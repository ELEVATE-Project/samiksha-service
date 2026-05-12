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
| `isAPrivateProgram` | Boolean | If Program is Private `true` else `false` |


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
curl --location --request POST 'http://localhost:4301/survey/v1/admin/deleteResource/68260d66b063136922f947c9?type=program&isAPrivateProgram=true' \
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
    "message": "Program and associated resources deleted successfull",
    "status": 200,
    "result": {
        "deletedPrograms": {
            "deletedProgramsIds": [
                "68a719f02f891a358156c769"
            ],
            "deletedProgramsCount": 1
        },
        "deletedSolutions": {
            "deletedSolutionsIds": [
                "68a719f33ea237998a9e2278",
                "68a71a303ea237998a9e2305",
                "68b56f2601d6506597aa0d93",
                "68b56f7de5dccb1ec9f69080",
                "68b574ebe5dccb1ec9f69108"
            ],
            "deletedSolutionsCount": 5
        },
        "deletedSurveys": {
            "deletedSurveysIds": [
               "68a719f33ea237998a9e2278",
               "68a71a303ea237998a9e2305",
            ],
            "deletedSurveysCount": 2
        },
        "deletedSurveySubmissions": {
            "deletedSurveySubmissionsIds": [ 
              "68a719f33ea237998a9e2278",
              "68a71a303ea237998a9e2305",],
            "deletedSurveySubmissionsCount": 2
        },
        "deletedObservations": {
            "deletedObservationsIds": [
              "68b56f7de5dccb1ec9f69080",
              "68b574ebe5dccb1ec9f69108"
            ],
            "deletedObservationsCount": 2
        },
        "deletedObservationSubmissions": {
            "deletedObservationSubmissionsIds": [
              "68b56f7de5dccb1ec9f69080",
              "68b574ebe5dccb1ec9f69108"
            ],
            "deletedObservationSubmissionsCount": 2
        },
        "pullProgramFromUserExtensionCount": 0
    }
}
```

---

## Notes
- Kafka topic: `RESOURCE_DELETION_TOPIC`
- Deletion logs recorded in: `resourceDeletionLog`
- Ensure all related templates, surveys, observations, and submissions are cleaned