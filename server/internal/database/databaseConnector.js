const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

db.prepare('CREATE TABLE IF NOT EXISTS user (username TEXT PRIMARY KEY, password TEXT)').run();



db.prepare(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    name TEXT NOT NULL
  );
`).run();


db.prepare(`
  CREATE TABLE IF NOT EXISTS costpoints (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      eventID INTEGER NOT NULL,
      text TEXT,
      cost REAL
  );
`).run();

module.exports = db;