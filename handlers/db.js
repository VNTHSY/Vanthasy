const Keyv = require("keyv");
const db = new Keyv("sqlite://Overvoid.db");

module.exports = { db };
