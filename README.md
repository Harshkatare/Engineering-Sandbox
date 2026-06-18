# 🔬 Engineering Sandbox

This repository is my personal R&D lab where I rapidly spin up, test, and break different backend technologies, database paradigms, and infrastructure tools. 

Instead of building massive tutorial apps, I focus on small, isolated experiments to understand architectural trade-offs, system friction, and implementation bottlenecks.

---

## 🧪 Completed Logs

### 📁 [01-express-db-dual-integration](./01-express-db-dual-integration)
* **The Goal:** Testing the development friction and implementation differences between Relational (PostgreSQL) and NoSQL (MongoDB) databases using an Express.js backend.
* **The Stack:** `Node.js` • `Express.js` • `PostgreSQL` • `MongoDB` • `Docker Compose` • `pnpm`
* **Status:** 🏁 **Experiment Completed Successfully (June 2 - June 18, 2026)**
  * **Infrastructure & Connectivity:** Monorepo scaffolding with `pnpm`. Isolated dual-engine network connectivity utilizing `Docker Compose`. Engineered an HTTP server handling separate database connection handshakes: a **PostgreSQL client pool connection** (`pg.Pool`) validating via query-execution health checks (`SELECT NOW()`), versus a **MongoDB persistent connection stream** tracking asynchronous lifecycle states via Mongoose `readyState`.
  * **Data Ingestion & Relationship Modeling:** Built parallel ingestion routes to evaluate structural SQL table schemas (with strict `UNIQUE NOT NULL` constraints and manual parameter serialization parsing for complex `JSONB` columns) against flexible NoSQL schema collections. Engineered data relationship reporting pipelines using an optimized relational SQL `LEFT JOIN` syntax to prevent null-state profile drops alongside denormalized NoSQL array sub-document embedding mapped with atomic `$push` array mutations.
  * **Query Optimization & Performance Profiling:** Provisioned advanced background indexing structures to eliminate linear sequential operations. Created a PostgreSQL **GIN Index** on nested `JSONB` properties and a MongoDB **Multi-Key Index** directly on array sub-document fields. Validated $O(\log N)$ logarithmic database traversal scaling through explicit route benchmarking endpoints returning deep query planner diagnostic payloads (`EXPLAIN ANALYZE` and `.explain("executionStats")`).
  * **Centralized Resilience & Interception Layer:** Designed and implemented a unified global error handling middleware architecture across both execution environments using the 4-argument Express signature `(err, req, res, next)`. Cleaned up async routing logic to safely bubble engine-level validation faults, database constraint exceptions, and raw Mongoose `CastError` anomalies down into standardized, production-ready API JSON responses.

---

## 🛠️ Active Logs
*More logs added as new tech is introduced into the sandbox.*