# 🔬 Engineering Sandbox

A personal space for spinning up, testing, and experimenting with different backend technologies, databases, and infrastructure tools.

The goal is simple: build small isolated experiments, understand how things work, explore trade-offs, and learn through implementation.

---

## 🧪 Completed Experiments

### 📁 [01-express-db-dual-integration](./01-express-db-dual-integration)

**Goal:**
Explore the differences between relational and NoSQL database workflows by integrating PostgreSQL and MongoDB into the same Express.js backend.

**Stack:**
`Node.js` • `Express.js` • `PostgreSQL` • `MongoDB` • `Docker Compose` • `pnpm`

**Status:** 🏁 Completed (June 2 - June 18, 2026)

**Tested:**

* Express backend setup with dual database connections
* PostgreSQL relational modeling and MongoDB document modeling
* Data ingestion and relationship handling
* Query optimization using database indexing
* Error handling and API resilience patterns

---

### 📁 [02-node-native-env-loader](./02-node-native-env-loader)

**Goal:**
Test Node.js built-in environment file loading using `--env-file` without relying on external packages like `dotenv`.

**Stack:**
`Node.js (v20.6+)` • `pnpm`

**Status:** 🏁 Completed (July 20, 2026)

**Tested:**

* Native `.env` loading through Node CLI flags
* Accessing environment variables using `process.env`
* Environment validation and missing variable handling
* Comparing behavior with and without `--env-file`

---

## 🛠️ Active Experiments

More experiments will be added as new technologies and ideas are explored.
