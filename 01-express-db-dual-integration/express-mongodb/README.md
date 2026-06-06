# 🔬 Experiment 01: Dual-Database Integration (MongoDB / NoSQL)

## 📌 Context & Intent
Having established a rigid, schema-first architecture with PostgreSQL, this leg of the experiment explores the NoSQL paradigm. The goal is to evaluate the **setup friction** and **connection philosophy** of a document-based store compared to a relational engine.

---

## 🛠️ Infrastructure Strategy: Mongoose ODM
Unlike the low-level `pg` driver used for Postgres, we utilized **Mongoose** as our Object Data Modeling (ODM) layer.

* **The Setup:** A containerized MongoDB `6.0` instance using a Debian-slim base (after discovering `alpine` compatibility constraints in the current registry).
* **Connection Philosophy:** PostgreSQL uses a **Connection Pool** (multiple temporary connections). MongoDB uses a **Persistent Connection Stream** (one single, long-lived pipe).

---

## 🔍 Log 02: MongoDB Realizations & Friction Points

### 1. Connection Stream vs. Pool
* *Observation:* Setting up Mongoose felt significantly faster than Postgres. There was no need to define `max` connections, idle timeouts, or pool sizes.
* *Takeaway:* MongoDB is optimized for developer velocity. It abstracts the connection lifecycle into a single state machine (`mongoose.connection.readyState`), allowing the application to simply "tap into" the stream.

### 2. The "Disconnected" Risk
* *Observation:* In Postgres, if a query fails, the connection pool handles the retry or error gracefully per-query. In Mongoose, if the persistent stream drops, the entire application's data layer goes offline.
* *Takeaway:* While NoSQL is easier to start, it requires more robust **connection event listeners** (`on('error')`, `on('disconnected')`) to ensure high availability in production.

---

## 📊 Preliminary Comparison: Infrastructure Phase

| Feature | PostgreSQL (SQL) | MongoDB (NoSQL) |
| :--- | :--- | :--- |
| **Connection Model** | Pool (Multi-client) | Stream (Single-persistent) |
| **Setup Complexity** | High (Pool config, types) | Low (URI string, connect) |
| **Developer Velocity** | Strict / Slower | Rapid / Faster |
| **Health Check Metric** | Query execution (`SELECT NOW()`) | State polling (`readyState`) |