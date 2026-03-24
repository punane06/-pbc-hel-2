const logger = require("./logger");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// Swagger/OpenAPI setup
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Parental Benefit Calculator API",
        version: process.env.npm_package_version || "1.0.0",
        description: "API documentation for the Parental Benefit Calculator."
    },
    servers: [
        { url: "http://localhost:3000", description: "Local server" }
    ]
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [
        "./routes/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
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


const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
                logger.info({ port }, `Server running on http://localhost:${port}`);
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
    sendValidationError,
    logger
};
