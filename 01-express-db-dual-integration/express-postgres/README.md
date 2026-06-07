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