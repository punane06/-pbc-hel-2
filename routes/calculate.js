
// Use shared logger instance
let logger;
try {
    logger = require("../logger");
    if (!logger) throw new Error();
} catch {
    logger = { info: () => {}, error: () => {}, warn: () => {} };
}

/**
 * @swagger
 * /calculate:
 *   post:
 *     summary: Calculate parental benefit
 *     description: Calculates parental benefit payments and summary for given salary and birth date.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               salary:
 *                 type: number
 *                 example: 3000
 *               birthDate:
 *                 type: string
 *                 example: "15.03.2026"
 *     responses:
 *       200:
 *         description: Calculation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year: { type: integer, example: 2026 }
 *                       month: { type: integer, example: 3 }
 *                       daysPaid: { type: integer, example: 17 }
 *                       payment: { type: number, example: 1700.00 }
 *                 cappedSalary: { type: number, example: 3000 }
 *                 dailyRate: { type: number, example: 100 }
 *                 capApplied: { type: boolean, example: false }
 *                 totalBenefit: { type: number, example: 12000 }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Validation failed" }
 *                 details: { type: array, items: { type: string } }
 */
const express = require("express");
const { validateCalculationInput, sendValidationError } = require("../middleware/validation");
const { calculateBenefits, calculateSummary } = require("../services/benefitCalculator");

const router = express.Router();

router.post("/", (req, res) => {

    const { errors, salary, birthDate } = validateCalculationInput(req.body || {});
    logger.info({ salary, birthDate }, "Calculation requested");

    if (errors.length > 0) {
        sendValidationError(res, errors);
        return;
    }

    const rows = calculateBenefits(salary, birthDate);
    const summary = calculateSummary(salary, rows);

    res.json({
        rows,
        ...summary
    });
});

module.exports = router;
