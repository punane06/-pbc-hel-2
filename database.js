const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./benefits.db");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            salary REAL,
            birthDate TEXT
        )
    `);

});

module.exports = db;
