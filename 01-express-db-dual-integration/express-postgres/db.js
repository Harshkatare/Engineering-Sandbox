const { Pool } = require("pg");

const pool = new Pool({
  user: "sandbox_user",
  host: "localhost",
  database: "sandbox_api_db",
  password: "sandbox_password",
  port: 5432,
});

// Database bootstrap: create core tables if they do not already exist
const initSchema = async () => {
  try {
    // 1. Ensure the users table exists before creating tables that reference it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        preferences JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create the user_logs table after users because it contains a foreign key reference
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        device_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(
      "postgreSQL: Both 'users' and 'user_logs' tables verified/created successfully.",
    );
  } catch (err) {
    console.error("Failed to auto-initialize relational schema:", err);
  }
};

// Run database schema initialization on application startup
initSchema();

module.exports = {
  query: (text, params) => {
    const start = Date.now();
    return pool.query(text, params).then((res) => {
      const duration = Date.now() - start;
      console.log(
        `[DB Query] Executed in ${duration}ms | Command: ${text.split(" ")[0]}`,
      );
      return res;
    });
  },
  pool,
};
