const { contextBridge } = require('electron');
const Database = require('better-sqlite3');

const db = new Database('armarios.db');

contextBridge.exposeInMainWorld('database', {
  query: (sql, params = []) => db.prepare(sql).all(...params),
  run: (sql, params = []) => db.prepare(sql).run(...params)
});