const express = require("express");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const result = db.query("SELECT NOW()");

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


app.listen(PORT, () => {
    console.log(`sandbox API server is running on http://localhost:${PORT}`)
})
