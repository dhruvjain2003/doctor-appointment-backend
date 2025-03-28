require("dotenv").config();
const { Pool } = require("pg");

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     max: 10,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 2000,
// });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, 
    },
});

pool.on("connect", () => {
    console.log("Connected to the PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("Unexpected database error", err);
    process.exit(-1);
});

module.exports = pool;
