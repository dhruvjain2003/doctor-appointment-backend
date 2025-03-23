require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "dhruvjain",
    database: "medcare",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
    console.log("✅ Connected to the PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("❌ Unexpected database error", err);
    process.exit(-1);
});

module.exports = pool;
