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