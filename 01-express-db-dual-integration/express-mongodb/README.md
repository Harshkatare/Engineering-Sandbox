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


## 🔍 Log 03: Document Ingestion & Routing Friction

### 1. Schema-less Storage Flexibility
* *Observation:* Passing a deep JavaScript object containing nested objects and arbitrary arrays was absorbed natively by MongoDB. There was zero requirement to run parameter serialization or manual string conversions.
* *Takeaway:* While Mongoose enforces application-level validation schemas (`User.js`), the underlying database layer dynamically instantiates collections on-the-fly upon the first write operation, prioritizing rapid data ingestion over structural rigidity.

### 2. Express Path Resolution Friction
* *Friction:* Omitting the leading forward slash in the routing registration string (e.g., `app.post('users', ...)` instead of `app.post('/users', ...)`) causes Express to drop the route from its internal routing table.
* *Takeaway:* This triggers an implicit HTML `<pre>Cannot POST /users</pre>` 404 response rather than a database connectivity failure, indicating a path misconfiguration inside the API routing layer.