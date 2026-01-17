import { db } from './db';

export function insertTestBusiness() {
  db.runSync(
    `INSERT INTO business (name, password, createdAt) VALUES (?, ?, ?)`,
    ['Test Shop', '1234', new Date().toISOString()]
  );
}
