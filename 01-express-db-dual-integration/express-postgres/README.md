# 🔬 Experiment 01: Dual-Database Integration Friction (SQL vs NoSQL)

## 📌 Context & Intent
This experiment isolates the setup friction, data transformation costs, and structural differences between relational databases (**PostgreSQL**) and document stores (**MongoDB**) connected to a unified runtime environment (**Express.js / Node.js**).

---

## 🛠️ Infrastructure Strategy: Containerization over Local Pollution
Instead of installing database engines directly on the host Windows OS (which creates dependency clutter and background service pollution), the infrastructure for this lab is containerized using **Docker Compose**. 

* **The Setup:** A lightweight PostgreSQL Alpine image isolated inside a private virtual network, exposing only the standard port `5432`.
* **The Benefit:** Total environment reproducibility. The entire database stack can be completely wiped and re-spun up in seconds with zero data remnants left on the machine.

---

## 🔍 Log 01: PostgreSQL Realizations & Friction Points

### 1. Connection Overhead & Pool Architecture
Unlike basic HTTP requests, database connections are heavy and expensive to open/close repeatedly. In the `db.js` layer, I implemented a **Connection Pool (`pg.Pool`)** rather than a single client connection.
* *Takeaway:* The pool stays alive in the background, keeping a warm set of reusable connections ready for incoming Express routes, minimizing latency during high traffic.

### 2. Explicit Handshakes (The Health Check)
To guarantee the application is stable, the `/health` endpoint doesn't just return a static `200 OK`. It forces an explicit query request (`SELECT NOW()`) to the underlying Postgres engine.
* *Takeaway:* A backend isn't truly "healthy" just because the server is listening; it is only healthy if its data pipeline can successfully execute a query and return a timestamp.

### 3. The Async Execution Pitfall
* *Friction:* Forgetting the `await` keyword before `db.query()` causes Node to treat the variable as a pending Promise instance rather than the resolved database payload, causing standard structural queries like `.rows[0]` to immediately throw a runtime exception.
* *Takeaway:* Database I/O is always non-blocking. Explicit asynchronous handling is mandatory to prevent empty state interpolation.

## 🔍 Log 03: Ingestion & Relational Schema Friction

### 1. Structural Pre-computation Requirements
* *Friction:* Sending data to a table without ahead-of-time preparation fails instantly. The database demands a strict schema definition via a raw SQL migration or runtime engine command (`CREATE TABLE`). 
* *Constraint Enforcement:* Setting an `email VARCHAR(150) UNIQUE NOT NULL` property delegates integrity to the core engine. When duplicate payloads hit the database, Postgres acts as a rigid gatekeeper, rejecting the write and forcing the client application to guarantee clean input data.

### 2. Deep Nested JSON Handling (The Serialization Cost)
* *Observation:* To support arbitrary nested data (like user preferences), we utilized a modern `JSONB` column. 
* *Takeaway:* While powerful, relational drivers cannot parse raw JavaScript objects out-of-the-box. The application layer must actively flatten or serialize the data payload (`JSON.stringify(preferences)`) before binding parameters, adding a processing tax to ingestion routes.


## 🔍 Log 04: Relational Join Operations, Indexing, & Centralized Recovery

### 1. Relational Joins & The Null-State Safe Guard
* **Friction:** When compiling user profiling history, combining a user with their tracking logs using a strict `INNER JOIN` results in a critical edge case: a newly registered user with zero historical logs returns an empty dataset (`[]`), wiping out the profile representation entirely.
* **Takeaway:** Implemented an industry-standard `LEFT JOIN` combined with application-level mapping array formatting loops. This guarantees that user documents are successfully extracted regardless of tracking coverage, cleanly formatting empty tracking histories into a native empty JavaScript array (`login_history: []`).

### 2. GIN Index Optimization on Complex Compound Columns
* **Observation:** Performing standard filter matches inside the nested `JSONB` column forces the Postgres engine into a costly linear sequential table scan ($O(N)$ text scanning complexity).
* **Takeaway:** Provisioned a **GIN (Generalized Inverted Index)** on the user's preferences object:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING gin (preferences);
* Executing an `EXPLAIN ANALYZE` database diagnostic profiling run confirms that the query optimizer transitions to a highly optimized Bitmap Index Scan, pointing directly to the target sectors on disk and dropping lookup execution down to logarithmic ($O(\log N)$) efficiency.

### 3. Centralized Async Error Interception Pipelines
* **Observation:** Manually writing repetitive, local try/catch response structures inside individual route scopes pollutes the codebase and risks raw runtime ReferenceErrors or unhandled promise rejections crashing the application worker process.

* **Implementation:** Designed a centralized global interceptor at the base of the routing engine to trap asynchronous exceptions:
```javascript
app.use((err, req, res, next) => {
  console.error(`🚨 [Global Error Interceptor]: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    engine: "PostgreSQL",
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString()
  });
});