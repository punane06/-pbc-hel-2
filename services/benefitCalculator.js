

const fs = require("node:fs");
const path = require("node:path");
const { getDaysInMonth, addMonths, setDate, parse } = require("date-fns");

// Simple in-memory LRU cache for calculation results
const CACHE_LIMIT = 1000;
const cache = new Map();
function getCacheKey(salary, birthDate) {
    return `${salary}:${birthDate}`;
}

// Load rates from config
const rates = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/rates.json"), "utf8"));
const SALARY_CAP = rates.MAX_RATE;
const MIN_RATE = rates.MIN_RATE;
const SOCIAL_TAX_MIN = rates.SOCIAL_TAX_MIN;


function parseDate(dateString) {
    // dd.MM.yyyy
    return parse(dateString, "dd.MM.yyyy", new Date());
}

/**
 * Calculate parental benefits for 12 months.
 * Uses in-memory LRU cache to avoid redundant calculations.
 * @param {number} salary - Gross monthly salary in EUR
 * @param {string} birthDate - Birth date in dd.MM.yyyy format
 * @returns {{ year: number, month: number, daysPaid: number, payment: number }[]}
 */
function calculateBenefits(salary, birthDate) {
    const cacheKey = getCacheKey(salary, birthDate);
    if (cache.has(cacheKey)) {
        // Move to end to mark as recently used
        const value = cache.get(cacheKey);
        cache.delete(cacheKey);
        cache.set(cacheKey, value);
        return value;
    }

    // Apply min/max logic
    let finalSalary = Math.max(Number(salary), MIN_RATE);
    finalSalary = Math.min(finalSalary, SALARY_CAP);

    const results = [];
    let date = parseDate(birthDate);

    for (let i = 0; i < 12; i++) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = getDaysInMonth(date);
        const daysPaid = i === 0 ? daysInMonth - date.getDate() + 1 : daysInMonth;
        const dailyRate = finalSalary / 30;
        const payment = Number((dailyRate * daysPaid).toFixed(2));

        results.push({
            year,
            month: month + 1,
            daysPaid,
            payment
        });

        // Move to next month, set date to 1st
        date = setDate(addMonths(date, 1), 1);
    }

    // Store in cache, enforce LRU limit
    cache.set(cacheKey, results);
    if (cache.size > CACHE_LIMIT) {
        // Remove least recently used (first inserted)
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    return results;
}


function calculateSummary(salary, rows) {
    let finalSalary = Math.max(Number(salary), MIN_RATE);
    finalSalary = Math.min(finalSalary, SALARY_CAP);
    const dailyRate = finalSalary / 30;
    const totalBenefit = Number(rows.reduce((sum, row) => sum + row.payment, 0).toFixed(2));

    return {
        cappedSalary: finalSalary,
        dailyRate: Number(dailyRate.toFixed(4)),
        capApplied: salary > SALARY_CAP,
        minApplied: salary < MIN_RATE,
        totalBenefit
    };
}

module.exports = {
    SALARY_CAP,
    MIN_RATE,
    SOCIAL_TAX_MIN,
    parseDate,
    calculateBenefits,
    calculateSummary
};
