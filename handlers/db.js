const Keyv = require('keyv');
const db = new Keyv('sqlite://Vanthasy.db');

module.exports = { db }