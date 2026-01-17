import { db } from './db';

export function createTables() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS business (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      logoUri TEXT,
      password TEXT,
      resetEmail TEXT,
      securityQuestion TEXT,
      securityAnswer TEXT,
      createdAt TEXT
    );
  `);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      imageUri TEXT,
      sellingPrice REAL NOT NULL,
      totalQuantity INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      updatedAt TEXT
    );
  `);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS stock_batch (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER,
      orderingPrice REAL,
      totalCost REAL,
      quantity INTEGER,
      createdAt TEXT,
      FOREIGN KEY (productId) REFERENCES product(id)
    );
  `);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS sale (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER,
      quantitySold INTEGER,
      sellingPrice REAL,
      profit REAL,
      createdAt TEXT,
      FOREIGN KEY (productId) REFERENCES product(id)
    );
  `);

  // Migration: Add currency column if it doesn't exist
  try {
    db.execSync(`ALTER TABLE product ADD COLUMN currency TEXT DEFAULT 'USD'`);
  } catch (error) {
    // Column already exists, ignore error
  }
  // Migration: Add resetEmail to business if missing
  try {
    db.execSync(`ALTER TABLE business ADD COLUMN resetEmail TEXT`);
  } catch (error) {
    // ignore - column exists
  }
  try {
    db.execSync(`ALTER TABLE business ADD COLUMN securityQuestion TEXT`);
  } catch (error) {
    // ignore
  }
  try {
    db.execSync(`ALTER TABLE business ADD COLUMN securityAnswer TEXT`);
  } catch (error) {
    // ignore
  }
  // Migration: Add reminderTime to business if missing (format: "HH:MM")
  try {
    db.execSync(`ALTER TABLE business ADD COLUMN reminderTime TEXT DEFAULT '20:00'`);
  } catch (error) {
    // ignore
  }
  // Migration: Add totalCost column to stock_batch for new profit calculation
  try {
    db.execSync(`ALTER TABLE stock_batch ADD COLUMN totalCost REAL`);
    // Update existing batches: totalCost = orderingPrice * quantity
    db.execSync(`UPDATE stock_batch SET totalCost = orderingPrice * quantity WHERE totalCost IS NULL`);
  } catch (error) {
    // ignore
  }
}
