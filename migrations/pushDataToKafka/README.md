# 📨 Push Submissions to Kafka

This Node.js script is designed to **push survey and observation submissions** (completed and/or incomplete) from a database into Kafka topics via backend APIs. It is useful when **reprocessing or syncing data** for reporting purposes.

---

## 📦 Prerequisites

- Node.js (v14 or higher recommended)
- Network access to the backend services/APIs

---

## 🛠️ Setup

### 1. Install dependencies

Run this command in the project directory:

```bash
npm install axios minimist lodash
```

---

## ▶️ Running the Script

### 2. Execute the script

Use the following command in your terminal. Replace the placeholder values with actual ones:

```bash
node pushDataToKafka.js \
--domain=http://localhost:6000 \
--origin=localhost \
--email=user@example.com \
--password=pass123 \
--limit=10 \
--mode=survey \
--programId=prog123 \
--solutionId=sol456 \
--date=2025-01-01
```

---

## ✅ Mandatory Flags

| Flag         | Description                          |
| ------------ | ------------------------------------ |
| `--domain`   | Base URL of the backend API          |
| `--origin`   | Origin header for API authentication |
| `--email`    | Email ID for login                   |
| `--password` | Password for login                   |

---

## 🪶 Optional Flags

| Flag           | Description                                        | Default  |
| -------------- | -------------------------------------------------- | -------- |
| `--limit`      | Number of records to process                       | `10`     |
| `--mode`       | Either `survey` or `observation`                   | `both` |
| `--programId`  | Filter submissions for a specific program          | *None*   |
| `--solutionId` | Filter submissions for a specific solution         | *None*   |
| `--date`       | Process submissions on/after this date (`YYYY-MM-DD`) | *None*   |