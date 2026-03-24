const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { createDatabase } = require("./database");
const calculateRouter = require("./routes/calculate");
const { createApplicationsRouter } = require("./routes/applications");
const pdfRouter = require("./routes/pdf");
const {
    parseDate,
    calculateBenefits,
    calculateSummary,
    SALARY_CAP
} = require("./services/benefitCalculator");
const {
    isValidDateString,
    validateCalculationInput,
    sendValidationError,
    MAX_ALLOWED_SALARY
} = require("./middleware/validation");


function validateEnv() {
    if (process.env.NODE_ENV === "production" && !process.env.DB_PATH) {
        throw new Error("DB_PATH is required in production");
    }
}

validateEnv();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000" }));
app.use(bodyParser.json());
app.use(express.static("public"));

const db = createDatabase();


app.use("/calculate", rateLimit({ windowMs: 60_000, max: 60 }), calculateRouter);
app.use("/pdf", rateLimit({ windowMs: 60_000, max: 10 }), pdfRouter);
app.use("/", createApplicationsRouter(db));

app.get("/health", (req, res) => {
    res.json({ status: "ok", version: process.env.npm_package_version });
});

function startServer(port = PORT, options = {}) {

    const { logStartup = false } = options;

    const server = app.listen(port, () => {
        if (logStartup) {
            console.log(`Server running on http://localhost:${port}`);
        }
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
        server.close(() => {
            db.close();
            process.exit(0);
        });
    });

    return server;

}

if (require.main === module) {
    startServer(PORT, { logStartup: true });
}

module.exports = {
    app,
    db,
    startServer,
    parseDate,
    isValidDateString,
    validateCalculationInput,
    calculateBenefits,
    calculateSummary,
    SALARY_CAP,
    MAX_ALLOWED_SALARY,
    sendValidationError
};
