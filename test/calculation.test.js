const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_PATH = ":memory:";

const { calculateBenefits, calculateSummary, parseDate, SALARY_CAP } = require("../services/benefitCalculator");
const { isValidDateString, validateCalculationInput, MAX_ALLOWED_SALARY } = require("../middleware/validation");

test("calculateBenefits returns 12 monthly rows", () => {
    const rows = calculateBenefits(3000, "15.03.2026");

    assert.equal(rows.length, 12);
});

test("first month uses days from birth date to month end", () => {
    const rows = calculateBenefits(3000, "15.03.2026");

    assert.equal(rows[0].daysPaid, 17);
    assert.equal(rows[0].payment, 1700);
});

test("salary cap is applied at 4000", () => {
    const rows = calculateBenefits(5000, "01.01.2026");

    assert.equal(rows[0].payment, 4133.33);
});

test("salary exactly 4000 does not exceed cap", () => {
    const rows = calculateBenefits(4000, "01.01.2026");

    assert.equal(rows[0].payment, 4133.33);
});

test("leap year date is accepted and calculated correctly", () => {
    const rows = calculateBenefits(3000, "29.02.2024");

    assert.equal(rows[0].daysPaid, 1);
    assert.equal(rows[0].payment, 100);
});

test("birth date on last day of month counts one day in first month", () => {
    const rows = calculateBenefits(3000, "31.03.2026");

    assert.equal(rows[0].daysPaid, 1);
    assert.equal(rows[0].payment, 100);
});

test("isValidDateString rejects impossible dates", () => {
    assert.equal(isValidDateString("31.02.2026"), false);
    assert.equal(isValidDateString("29.02.2025"), false);
});

test("isValidDateString accepts valid dates", () => {
    assert.equal(isValidDateString("29.02.2024"), true);
    assert.equal(isValidDateString("31.03.2026"), true);
});

test("validateCalculationInput returns errors for invalid payload", () => {
    const { errors } = validateCalculationInput({
        salary: -100,
        birthDate: "31.02.2026"
    });

    assert.ok(errors.some((e) => e.includes("Salary must be a positive number.")));
    assert.ok(errors.some((e) => e.includes("Birth date must be a valid date")));
});

test("validateCalculationInput allows future birth dates for forecasting", () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);

    const dd = String(future.getDate()).padStart(2, "0");
    const mm = String(future.getMonth() + 1).padStart(2, "0");
    const yyyy = future.getFullYear();

    const { errors } = validateCalculationInput({
        salary: 2500,
        birthDate: `${dd}.${mm}.${yyyy}`
    });

    assert.equal(errors.length, 0);
});

test("calculateBenefits uses cache for repeated calls", () => {
    const salary = 2500;
    const birthDate = "10.05.2026";
    // First call (not cached)
    const result1 = calculateBenefits(salary, birthDate);
    // Second call (should be cached)
    const result2 = calculateBenefits(salary, birthDate);
    // Should be strictly equal (same reference from cache)
    assert.strictEqual(result1, result2);
    assert.equal(result1.length, 12);
});

test("salary below minimum uses MIN_RATE", () => {
    const salary = 500; // below minimum
    const birthDate = "15.03.2026";
    const rows = calculateBenefits(salary, birthDate);
    // MIN_RATE is 820 from config
    assert.equal(rows[0].payment, (820 / 30) * 17); // 17 days in first month
    assert.ok(rows.every(row => row.payment >= 0));
});
