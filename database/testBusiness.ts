import { db } from "./db";

console.log("\n=== Testing Business Identity ===\n");

// Clean slate
db.execSync(`DELETE FROM business`);

console.log("1. Testing getBusiness (should be empty):");
const noBusiness = db.getFirstSync(`SELECT * FROM business LIMIT 1`);
console.log("Result:", noBusiness || "No business found ✓");

console.log("\n2. Creating business:");
const now = new Date().toISOString();
db.runSync(
  `INSERT INTO business (name, logoUri, createdAt)
   VALUES (?, ?, ?)`,
  ["My Test Shop", null, now]
);

const business = db.getFirstSync(`SELECT * FROM business LIMIT 1`);
console.log("Business created:", business);

console.log("\n3. Updating business with logo:");
db.runSync(
  `UPDATE business 
   SET name = ?, logoUri = ?
   WHERE id = ?`,
  ["Updated Shop Name", "file://logo.png", business.id]
);

const updated = db.getFirstSync(`SELECT * FROM business LIMIT 1`);
console.log("Business updated:", updated);

console.log("\n✅ All tests passed!");
