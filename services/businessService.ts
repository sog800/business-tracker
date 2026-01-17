import CryptoJS from 'crypto-js';
import { db } from "../database/db";

// Simple password hashing function using SHA256
function hashPassword(password: string): string {
  const salt = 'biztrack_salt_2026';
  return CryptoJS.SHA256(password + salt).toString();
}

interface Business {
  id: number;
  name: string;
  logoUri: string | null;
  password: string | null;
  resetEmail?: string | null;
  securityQuestion?: string | null;
  securityAnswer?: string | null;
  reminderTime?: string | null;
  createdAt: string;
}

export function getBusiness(): Business | undefined {
  return db.getFirstSync(
    `SELECT * FROM business LIMIT 1`
  ) as Business | undefined;
}

export function setBusinessPassword(id: number, password: string | null) {
  let hashedPassword = null;
  if (password) {
    hashedPassword = hashPassword(password);
  }
  db.runSync(
    `UPDATE business SET password = ? WHERE id = ?`,
    [hashedPassword, id]
  );
}

export function setBusinessResetEmail(id: number, email: string | null) {
  db.runSync(
    `UPDATE business SET resetEmail = ? WHERE id = ?`,
    [email || null, id]
  );
}

export function setSecurityQuestionAnswer(id: number, question: string | null, answer: string | null) {
  // normalize answer (trim, lowercase, remove spaces) before storing
  const norm = answer ? answer.trim().toLowerCase().replace(/\s+/g, '') : null;
  db.runSync(
    `UPDATE business SET securityQuestion = ?, securityAnswer = ? WHERE id = ?`,
    [question || null, norm || null, id]
  );
}

export function verifySecurityAnswer(id: number, answer: string): boolean {
  const row = db.getFirstSync(`SELECT securityAnswer FROM business WHERE id = ?`, [id]) as { securityAnswer: string } | undefined;
  if (!row || !row.securityAnswer) return false;
  const norm = answer ? answer.trim().toLowerCase().replace(/\s+/g, '') : '';
  return row.securityAnswer === norm;
}

export function verifyBusinessPassword(id: number, password: string): boolean {
  const row = db.getFirstSync(`SELECT password FROM business WHERE id = ?`, [id]) as { password: string } | undefined;
  if (!row) return false;
  if (!row.password) return false;
  const hashedInput = hashPassword(password);
  return row.password === hashedInput;
}

export function createBusiness(name: string, logoUri?: string) {
  const now = new Date().toISOString();
  
  db.runSync(
    `INSERT INTO business (name, logoUri, createdAt)
     VALUES (?, ?, ?)`,
    [name, logoUri || null, now]
  );
}

export function updateBusiness(id: number, name: string, logoUri?: string) {
  db.runSync(
    `UPDATE business 
     SET name = ?, logoUri = ?
     WHERE id = ?`,
    [name, logoUri || null, id]
  );
}

export function setReminderTime(id: number, time: string) {
  db.runSync(
    `UPDATE business SET reminderTime = ? WHERE id = ?`,
    [time, id]
  );
}

export function getReminderTime(id: number): string {
  const row = db.getFirstSync(`SELECT reminderTime FROM business WHERE id = ?`, [id]) as { reminderTime: string | null } | undefined;
  return row?.reminderTime || '20:00';
}

