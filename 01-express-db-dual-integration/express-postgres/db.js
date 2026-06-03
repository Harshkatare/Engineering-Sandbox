const { Pool } = require("pg");

const pool = new Pool({
  user: "sandbox_user",
  host: "localhost",
  database: "sandbox_api_db",
  password: "sandbox_password",
  port: 5432,
});

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
