const express = require("express");

const authRoutes = require("./routes/authRoutes");
const callRoutes = require("./routes/callRoutes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/calls", callRoutes);


app.use((err, req, res, next) => {
    console.error("Request failed:", err.message);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message:
            statusCode === 500
                ? "Internal server error"
                : err.message
    });
});


module.exports = app;