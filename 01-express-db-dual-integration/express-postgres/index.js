const express = require("express");
const db = require("./db");
const { executionAsyncId } = require("async_hooks");
const { timeStamp } = require("console");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.status(200).json({
      status: "healthy",
      database: "connected",
      postgres_time: result.rows[0].now,
      message: "Express and PostgreSQL are communicating perfectly!",
    });
  } catch (error) {
    console.error("Databse connection failed:", error);
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// creating a new user in PG
app.post('/users', async (req, res) => {
  const { name, email, preferences } = req.body;

  try {
    //explicitely stating the columns and mapping the values positionally($1,$2,$3) as it's a must in SQL
    const queryText = `
      INSERT INTO users (name, email, preferences)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    //passing the preferences directly; pg driver will automatically stringify the object for the JSONB column.
    const values = [name, email, JSON.stringify(preferences)];
    const result = await db.query(queryText, values);

    res.status(201).json({
      success: true,
      engine: 'PostgreSQL',
      data: result.rows[0] //return newly created row
    });
  } catch (error) {
    console.error('[Postgres Insert Error]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Record a new user login activity log
app.post("/logs", async (req, res) => {
  const { user_id, device_type, ip_address } = req.body;

  try {
    const queryText = `
      INSERT INTO user_logs (user_id, device_type, ip_address)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [user_id, device_type, ip_address];
    const result = await db.query(queryText, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("[Postgres Log Insert Error]:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Generate a relational user report via an INNER/LEFT JOIN 
app.get("/users/:id/report", async (req, res, next) => {
  const userId = req.params.id;

  //passing any potential db promise rejections straight to next()
  try {
    const queryText = `
      SELECT 
        u.id AS user_id, u.name, u.email, u.preferences,
        l.id AS log_id, l.device_type, l.ip_address, l.logged_at
      FROM users u
      LEFT JOIN user_logs l ON u.id = l.user_id
      WHERE u.id = $1
      ORDER BY l.logged_at DESC;
    `;
    const result = await db.query(queryText, [userId]);

    if (result.rows.length === 0) {
      // return res.status(404).json({ success: false, error: "User not found" });
      const error = new Error("User not found");
      error.status = 404;
      return next(error); //passes control to global error middleware
    }

    // Transform flat relational rows into a nested object format for the client
    const userProfile = {
      id: result.rows[0].user_id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      preferences: result.rows[0].preferences,
      login_history: result.rows
        .filter((row) => row.log_id !== null)
        .map((row) => ({
          log_id: row.log_id,
          device_type: row.device_type,
          ip_address: row.ip_address,
          logged_at: row.logged_at,
        })),
    };

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    next(error); //auto. routes the error down to global interceptor!
  }
});

// performance test: Filter by nested JSONB using the GIN index
app.get("/perf/postgres", async (req, res) => {
  const {theme} = req.query; //example: /perf/postgres?theme=dark

  try {
    // EXPLAIN ANALYZE tells postgres to profile the execution strategy
    const queryText = `
      EXPLAIN ANALYZE
      SELECT * FROM users
      WHERE preferences @> $1;
    `;
    // The @> operator checks if the left JSONB column contains the right JSONB object
    const jsonTarget = JSON.stringify({theme});
    const restult = await db.query(queryText, [jsonTarget]);

    // Result the execution plan text strings
    result.status(200).json({
      success: true,
      execution_plan: result.row.map(r => r["QUERY PLAN"])
    });
  } catch (error) {
    console.error("[postgres perf Error]:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

//global error handling middleware
app.use((err, req, res, next) =>{
  console.error(`🚨 [Global Error Interceptor]: ${err.message}`);

  // standardize API Error payload structure
  res.status(err.status || 500).json({
    success: false,
    engine: "PostgreSQL",
    error: err.message || "Internal Server Error",
    timeStamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
    console.log(`sandbox API server is running on http://localhost:${PORT}`)
})
