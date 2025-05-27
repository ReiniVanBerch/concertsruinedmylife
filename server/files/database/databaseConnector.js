const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

db.prepare('CREATE TABLE IF NOT EXISTS user (username TEXT PRIMARY KEY, password TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS even (id INTEGER PRIMARY KEY, text TEXT, apiKey TEXT, api TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS money (id INTEGER PRIMARY KEY, text TEXT, eventID INTEGER, username INTEGER, value DOUBLE)').run();

module.exports = db;