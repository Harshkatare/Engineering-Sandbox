console.log("--- Testing Node.js Built-in .env Loader ---\n");

const port = process.env.PORT || 8000;
const dbHost = process.env.DB_HOST ?? "<missing>";
const apiKey = process.env.API_KEY ?? "<missing>";

console.log("Loaded Variables:");
console.log(`- PORT: ${port}`);
console.log(`- DB_HOST: ${dbHost}`);
console.log(`- API_KEY: ${apiKey}\n`);

const requiredVars = ["PORT", "DB_HOST", "API_KEY"];
const missingVars = requiredVars.filter(
  (key) => process.env[key] == null
);

if (missingVars.length === 0) {
  console.log("Environment loading: SUCCESS");
} else {
  console.log(`Environment loading: FAILED`);
  console.log(`Warning: Missing variables -> [${missingVars.join(", ")}]`);
  console.log("Did you pass --env-file=.env when running Node?");
}