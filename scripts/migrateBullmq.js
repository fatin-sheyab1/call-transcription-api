require("dotenv").config();

const { Pool } = require("pg");
const { runMigrations } = require("bullmq");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrateBullMQ() {
    const client = await pool.connect();

    try {
        await runMigrations(client);
        console.log("BullMQ migrations completed");
    }
    finally {
        client.release();
        await pool.end();
    }
}

migrateBullMQ();