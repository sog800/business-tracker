import { db } from "../database/db";

interface SaleData {
  id: number;
  productId: number;
  quantitySold: number;
  sellingPrice: number;
  profit: number;
  createdAt: string;
}

interface ProductInfo {
  id: number;
  name: string;
  sellingPrice: number;
  totalQuantity: number;
}

interface DailyProfit {
  date: string;
  profit: number;
  count: number;
}

interface ProfitMetrics {
  daily: number;
  weekly: number;
  monthly: number;
}

interface ProductStats {
  id: number;
  name: string;
  quantitySold: number;
  profit: number;
}

// Helper: Get date string in YYYY-MM-DD format
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper: Get dates for ranges
function getDatesForRange(daysBack: number): string[] {
  const dates: string[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(getDateString(date));
  }
  return dates;
}

export function getProfitMetrics(): ProfitMetrics {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const todayStr = getDateString(today);
  const yesterdayStr = getDateString(yesterday);
  const sevenDaysAgoStr = getDateString(sevenDaysAgo);
  const thirtyDaysAgoStr = getDateString(thirtyDaysAgo);

  // Daily profit (today only)
  const dailyResult = db.getFirstSync(
    `SELECT COALESCE(SUM(profit), 0) as total FROM sale WHERE DATE(createdAt) = ?`,
    [todayStr]
  ) as { total: number };

  // Weekly profit (last 7 days)
  const weeklyResult = db.getFirstSync(
    `SELECT COALESCE(SUM(profit), 0) as total FROM sale WHERE DATE(createdAt) > ?`,
    [sevenDaysAgoStr]
  ) as { total: number };

  // Monthly profit (last 30 days)
  const monthlyResult = db.getFirstSync(
    `SELECT COALESCE(SUM(profit), 0) as total FROM sale WHERE DATE(createdAt) > ?`,
    [thirtyDaysAgoStr]
  ) as { total: number };

  return {
    daily: Math.round(dailyResult.total),
    weekly: Math.round(weeklyResult.total),
    monthly: Math.round(monthlyResult.total),
  };
}

export function getDailyProfitData(daysBack: number = 7): DailyProfit[] {
  const dates = getDatesForRange(daysBack);
  
  return dates.map(date => {
    const result = db.getFirstSync(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(profit), 0) as total 
       FROM sale WHERE DATE(createdAt) = ?`,
      [date]
    ) as { count: number; total: number };

    return {
      date,
      profit: Math.round(result.total),
      count: result.count,
    };
  });
}

export function getWeeklyProfitData(weeksBack: number = 4): DailyProfit[] {
  const weeks: DailyProfit[] = [];
  
  for (let i = weeksBack - 1; i >= 0; i--) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (i * 7));
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    
    const endStr = getDateString(endDate);
    const startStr = getDateString(startDate);
    
    const result = db.getFirstSync(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(profit), 0) as total 
       FROM sale 
       WHERE DATE(createdAt) BETWEEN ? AND ?`,
      [startStr, endStr]
    ) as { count: number; total: number };

    weeks.push({
      date: `Week ${i + 1}`,
      profit: Math.round(result.total),
      count: result.count,
    });
  }
  
  return weeks;
}

export function getBestSellingProducts(limit: number = 5): ProductStats[] {
  const results = db.getAllSync(
    `SELECT 
      p.id,
      p.name,
      COALESCE(SUM(s.quantitySold), 0) as quantitySold,
      COALESCE(SUM(s.profit), 0) as profit
     FROM product p
     LEFT JOIN sale s ON p.id = s.productId
     GROUP BY p.id, p.name
     ORDER BY quantitySold DESC
     LIMIT ?`,
    [limit]
  ) as ProductStats[];

  return results;
}

export function getLossmakingProducts(): ProductStats[] {
  const results = db.getAllSync(
    `SELECT 
      p.id,
      p.name,
      COALESCE(SUM(s.quantitySold), 0) as quantitySold,
      COALESCE(SUM(s.profit), 0) as profit
     FROM product p
     LEFT JOIN sale s ON p.id = s.productId
     GROUP BY p.id, p.name
     HAVING profit < 0 OR (profit = 0 AND quantitySold > 0)
     ORDER BY profit ASC`,
    []
  ) as ProductStats[];

  return results;
}

export function getTotalSales(): number {
  const result = db.getFirstSync(
    `SELECT COUNT(*) as count FROM sale`,
    []
  ) as { count: number };

  return result.count;
}

// Per-Product Analytics Functions

interface ProductMonthlyData {
  month: string;
  profit: number;
  totalSold: number;
  revenue: number;
}

interface ProductMetrics {
  totalProfit: number;
  totalRevenue: number;
  totalSold: number;
  avgProfit: number;
  monthlyData: ProductMonthlyData[];
}

export function getProductMonthlyData(productId: number, monthsBack: number = 6): ProductMonthlyData[] {
  const months: ProductMonthlyData[] = [];
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthStr = `${year}-${month}`;
    
    // Get the month name for display
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const result = db.getFirstSync(
      `SELECT 
        COALESCE(SUM(profit), 0) as totalProfit,
        COALESCE(SUM(quantitySold), 0) as totalSold,
        COALESCE(SUM(sellingPrice * quantitySold), 0) as revenue
       FROM sale 
       WHERE productId = ? AND strftime('%Y-%m', createdAt) = ?`,
      [productId, monthStr]
    ) as { totalProfit: number; totalSold: number; revenue: number };

    months.push({
      month: monthName,
      profit: Math.round(result.totalProfit),
      totalSold: result.totalSold,
      revenue: Math.round(result.revenue),
    });
  }
  
  return months;
}

export function getProductMetrics(productId: number): ProductMetrics {
  // Get all-time metrics
  const allTimeResult = db.getFirstSync(
    `SELECT 
      COALESCE(SUM(profit), 0) as totalProfit,
      COALESCE(SUM(sellingPrice * quantitySold), 0) as totalRevenue,
      COALESCE(SUM(quantitySold), 0) as totalSold,
      COALESCE(AVG(profit), 0) as avgProfit
     FROM sale 
     WHERE productId = ?`,
    [productId]
  ) as { totalProfit: number; totalRevenue: number; totalSold: number; avgProfit: number };

  // Get monthly data for the last 6 months
  const monthlyData = getProductMonthlyData(productId, 6);

  return {
    totalProfit: Math.round(allTimeResult.totalProfit),
    totalRevenue: Math.round(allTimeResult.totalRevenue),
    totalSold: allTimeResult.totalSold,
    avgProfit: Math.round(allTimeResult.avgProfit),
    monthlyData,
  };
}

interface DailySalesData {
  day: string; // numeric day of month
  quantitySold: number;
  monthLabel: string; // e.g., Jan
  monthYear: string; // e.g., January 2026
}

export function getProductCurrentMonthSales(productId: number): DailySalesData[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentMonth = `${year}-${month}`;
  const monthLabel = now.toLocaleDateString('en-US', { month: 'short' });
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Include the full calendar month (fill future days with zeros)
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
  
  const dailySales: DailySalesData[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${currentMonth}-${dayStr}`;
    
    const result = db.getFirstSync(
      `SELECT COALESCE(SUM(quantitySold), 0) as totalSold
       FROM sale 
       WHERE productId = ? AND DATE(createdAt) = ?`,
      [productId, dateStr]
    ) as { totalSold: number };
    
    dailySales.push({
      day: day.toString(),
      quantitySold: result.totalSold,
      monthLabel,
      monthYear,
    });
  }
  
  // Debug: log month and returned length to help diagnose missing days
  try {
    // eslint-disable-next-line no-console
    console.log(`[analytics] getProductCurrentMonthSales productId=${productId} month=${currentMonth} daysInMonth=${daysInMonth} returned=${dailySales.length}`);
  } catch (e) {
    // ignore
  }

  return dailySales;
}
