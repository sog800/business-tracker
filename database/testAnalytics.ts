import { db } from "./db";

console.log("\n=== Testing Analytics ===\n");

// Create test product
db.execSync(`DELETE FROM product`);
db.execSync(`DELETE FROM sale`);

const now = new Date();

db.runSync(
  `INSERT INTO product (name, sellingPrice, totalQuantity, updatedAt)
   VALUES (?, ?, ?, ?)`,
  ["Test Product 1", 100, 10, now.toISOString()]
);

const productId = db.getFirstSync(`SELECT last_insert_rowid() as id`).id;

console.log("1. Creating sample sales data:");

// Create sales from different dates
for (let i = 0; i < 10; i++) {
  const saleDate = new Date(now);
  saleDate.setDate(saleDate.getDate() - i);
  
  const profit = Math.random() * 100;
  db.runSync(
    `INSERT INTO sale (productId, quantitySold, sellingPrice, profit, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, Math.floor(Math.random() * 5) + 1, 100, profit, saleDate.toISOString()]
  );
}

// Test queries
console.log("2. Testing getProfitMetrics:");
const daily = db.getFirstSync(
  `SELECT COALESCE(SUM(profit), 0) as total FROM sale WHERE DATE(createdAt) = DATE(?)`,
  [now.toISOString()]
);
console.log("Today's profit:", daily.total);

console.log("\n3. Testing getDailyProfitData:");
const dailyData = db.getAllSync(
  `SELECT DATE(createdAt) as date, COUNT(*) as count, SUM(profit) as profit
   FROM sale
   GROUP BY DATE(createdAt)
   ORDER BY date DESC
   LIMIT 7`,
  []
);
console.log("Last 7 days:", dailyData);

console.log("\n4. Testing getBestSellingProducts:");
const bestSelling = db.getAllSync(
  `SELECT 
     p.id,
     p.name,
     SUM(s.quantitySold) as quantitySold,
     SUM(s.profit) as profit
    FROM product p
    LEFT JOIN sale s ON p.id = s.productId
    GROUP BY p.id
    ORDER BY quantitySold DESC
    LIMIT 5`,
  []
);
console.log("Best selling:", bestSelling);

console.log("\n✅ Analytics test complete!");
