const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

db.prepare('CREATE TABLE IF NOT EXISTS user (username TEXT PRIMARY KEY, password TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS event (id INTEGER PRIMARY KEY, username TEXT,  text TEXT, apiKey TEXT, api TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS costfactor (id INTEGER PRIMARY KEY, text TEXT, eventID INTEGER, username TEXT, value DOUBLE)').run();

module.exports = db;