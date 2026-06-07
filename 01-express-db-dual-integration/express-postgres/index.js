const express = require("express");
const db = require("./db");
const { json } = require("stream/consumers");
const { error } = require("console");

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
  } catch {
    console.error('[Postgres Insert Error]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


app.listen(PORT, () => {
    console.log(`sandbox API server is running on http://localhost:${PORT}`)
})
