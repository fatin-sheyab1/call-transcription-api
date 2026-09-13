require("dotenv").config();

const {
    Queue,
    createPostgresBackend
} = require("bullmq");

const connection = process.env.DATABASE_URL;

const callQueue = new Queue(
    "call-processing",
    {
        connection: connection
    },
    createPostgresBackend
);

module.exports = callQueue;