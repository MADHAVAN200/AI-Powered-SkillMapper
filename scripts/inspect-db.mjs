import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'local.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error('Could not open DB:', err.message); process.exit(1); }
});

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
  if (err) { console.error(err); return; }
  console.log('\n📋 TABLES IN local.db:');
  rows.forEach(r => console.log('  -', r.name));

  db.all("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name", (err2, idx) => {
    if (!err2) {
      console.log('\n🔍 INDEXES:');
      idx.forEach(i => console.log('  -', i.name));
    }

    // Count rows in each table
    const tables = rows.map(r => r.name);
    let done = 0;
    console.log('\n📊 ROW COUNTS:');
    if (tables.length === 0) { db.close(); return; }
    tables.forEach(t => {
      db.get(`SELECT COUNT(*) as cnt FROM "${t}"`, (e, row) => {
        console.log(`  ${t}: ${row ? row.cnt : 0} rows`);
        done++;
        if (done === tables.length) db.close();
      });
    });
  });
});
