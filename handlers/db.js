const Keyv = require("keyv");
const db = new Keyv("sqlite://overvoid.db");

module.exports = { db };
