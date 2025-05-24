const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, password TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, name TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS money (id INTEGER PRIMARY KEY, name TEXT, eventID INTEGER, userId INTEGER, spent DOUBLE)').run();

module.exports = db;