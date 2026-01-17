import { db } from "../database/db";

interface Product {
  id: number;
  name: string;
  imageUri: string | null;
  sellingPrice: number;
  totalQuantity: number;
  updatedAt: string | null;
}

interface StockBatch {
  id: number;
  productId: number;
  orderingPrice: number;
  totalCost: number;
  quantity: number;
  createdAt: string;
}

export function getLastStockBatch(productId: number): StockBatch | undefined {
  return db.getFirstSync(
    `SELECT * FROM stock_batch 
     WHERE productId = ? 
     ORDER BY createdAt DESC 
     LIMIT 1`,
    [productId]
  ) as StockBatch | undefined;
}

// Get weighted average cost per item for a product
function getAverageCostPerItem(productId: number): number {
  const result = db.getFirstSync(
    `SELECT 
      COALESCE(SUM(totalCost), 0) as totalCost,
      COALESCE(SUM(quantity), 0) as totalQuantity
     FROM stock_batch 
     WHERE productId = ? AND quantity > 0`,
    [productId]
  ) as { totalCost: number; totalQuantity: number };
  
  if (result.totalQuantity === 0) return 0;
  return result.totalCost / result.totalQuantity;
}

export function addItem(
  productId: number,
  quantity: number,
  totalCost: number
) {
  const product = db.getFirstSync(
    `SELECT * FROM product WHERE id = ?`,
    [productId]
  ) as Product | undefined;

  const now = new Date().toISOString();
  const costPerItem = totalCost / quantity;

  // Always create a new batch with the total cost
  db.runSync(
    `INSERT INTO stock_batch (productId, orderingPrice, totalCost, quantity, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, costPerItem, totalCost, quantity, now]
  );

  // Update product quantity
  db.runSync(
    `UPDATE product 
     SET totalQuantity = totalQuantity + ?, updatedAt = ?
     WHERE id = ?`,
    [quantity, now, productId]
  );
}


export function sellItem(productId: number, quantityToSell: number, sellingPrice: number) {
  const product = db.getFirstSync(
    `SELECT * FROM product WHERE id = ?`,
    [productId]
  ) as Product | undefined;

  if (!product || product.totalQuantity < quantityToSell) {
    throw new Error("Not enough stock");
  }

  const batches = db.getAllSync(
    `SELECT * FROM stock_batch 
     WHERE productId = ? AND quantity > 0
     ORDER BY createdAt ASC`,
    [productId]
  ) as StockBatch[];

  // Calculate weighted average cost per item from all available batches
  const avgCostPerItem = getAverageCostPerItem(productId);
  
  let remaining = quantityToSell;
  const now = new Date().toISOString();
  
  // sellingPrice is TOTAL for all items, not per item
  // Calculate total profit for this sale
  const totalRevenue = sellingPrice; // Already total amount
  const totalCost = avgCostPerItem * quantityToSell;
  const profit = totalRevenue - totalCost;

  // Record sale with calculated profit (store price per item for analytics)
  const pricePerItem = sellingPrice / quantityToSell;
  db.runSync(
    `INSERT INTO sale 
     (productId, quantitySold, sellingPrice, profit, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, quantityToSell, pricePerItem, profit, now]
  );

  // Reduce stock from batches (FIFO - First In First Out)
  for (const batch of batches) {
    if (remaining <= 0) break;

    const reduceQty = Math.min(batch.quantity, remaining);
    const costPerItem = batch.totalCost / batch.quantity;
    const newTotalCost = batch.totalCost - (costPerItem * reduceQty);
    
    // Reduce batch quantity and proportionally reduce totalCost
    db.runSync(
      `UPDATE stock_batch 
       SET quantity = quantity - ?, totalCost = ?
       WHERE id = ?`,
      [reduceQty, newTotalCost, batch.id]
    );

    remaining -= reduceQty;
  }

  // Update product quantity
  db.runSync(
    `UPDATE product 
     SET totalQuantity = totalQuantity - ?, updatedAt = ?
     WHERE id = ?`,
    [quantityToSell, now, productId]
  );
}

export function deleteProduct(productId: number) {
  // Delete all stock batches for this product
  db.runSync(`DELETE FROM stock_batch WHERE productId = ?`, [productId]);
  
  // Delete all sales for this product
  db.runSync(`DELETE FROM sale WHERE productId = ?`, [productId]);
  
  // Delete the product itself
  db.runSync(`DELETE FROM product WHERE id = ?`, [productId]);
}




