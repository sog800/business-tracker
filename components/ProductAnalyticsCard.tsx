import { StyleSheet, Text, View } from "react-native";
import { getCurrencySymbol } from "../services/currencyService";
import SimpleLineChart from "./SimpleLineChart";

interface ProductMonthlyData {
  month: string;
  profit: number;
  totalSold: number;
  revenue: number;
}

interface DailySalesData {
  day: string;
  quantitySold: number;
  monthLabel: string;
  monthYear: string;
}

interface ProductMetrics {
  totalProfit: number;
  totalRevenue: number;
  totalSold: number;
  avgProfit: number;
  monthlyData: ProductMonthlyData[];
  dailySales: DailySalesData[];
}

interface ProductAnalyticsCardProps {
  productId: number;
  productName: string;
  currency: string;
  metrics: ProductMetrics;
}

export default function ProductAnalyticsCard({
  productId,
  productName,
  currency,
  metrics,
}: ProductAnalyticsCardProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const isProfit = metrics.totalProfit >= 0;
  const isLoss = metrics.totalProfit < 0;

  // Prepare chart data - current month daily sales (fallback to empty array if missing)
  const dailySales = metrics?.dailySales ?? [];
  const monthYear = dailySales[0]?.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const chartData = dailySales.map(d => ({
    label: `${d.monthLabel} ${d.day}`,
    value: d.quantitySold,
  }));

  return (
    <View style={styles.container}>
      {/* Product Header */}
      <View style={styles.header}>
        <Text style={styles.productName}>{productName}</Text>
        <Text style={styles.currency}>{currency}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Profit</Text>
          <Text style={[
            styles.metricValue,
            { color: isProfit ? "#4CAF50" : isLoss ? "#FF6B6B" : "#666" }
          ]}>
            {isLoss ? '-' : ''}{currencySymbol}{Math.abs(metrics.totalProfit)}
          </Text>
          {isLoss && <Text style={styles.lossIndicator}>⚠️ Loss</Text>}
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Revenue</Text>
          <Text style={styles.metricValue}>
            {currencySymbol}{metrics.totalRevenue}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Units Sold</Text>
          <Text style={styles.metricValue}>
            {metrics.totalSold}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Avg Profit/Sale</Text>
          <Text style={styles.metricValue}>
            {metrics.avgProfit < 0 ? '-' : ''}{currencySymbol}{Math.abs(metrics.avgProfit)}
          </Text>
        </View>
      </View>

      {/* Daily Sales Chart */}
      <SimpleLineChart
        title={monthYear ? `Units Sold per Day - ${monthYear}` : "Units Sold per Day"}
        data={chartData}
        color="#007AFF"
        height={200}
        currencySymbol=""
      />

      {/* Selling Rate Info */}
      <View style={styles.sellingRate}>
        <Text style={styles.sellingRateLabel}>📊 Selling Rate</Text>
        <Text style={styles.sellingRateValue}>
          {metrics.totalSold} units sold across all time
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  currency: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 10,
  },
  metricBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  lossIndicator: {
    fontSize: 11,
    color: "#FF6B6B",
    marginTop: 4,
    fontWeight: "600",
  },
  sellingRate: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  sellingRateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  sellingRateValue: {
    fontSize: 13,
    color: "#666",
  },
});
