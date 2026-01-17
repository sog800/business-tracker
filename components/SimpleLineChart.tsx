import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  currencySymbol?: string;
}

export default function SimpleLineChart({
  title,
  data,
  height = 240,
  color = "#007AFF",
  currencySymbol = "$"
}: SimpleLineChartProps) {
  const { width } = Dimensions.get("window");

  // Try to require gifted-charts at runtime (it may be installed)
  let Gifted: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Gifted = require('react-native-gifted-charts');
  } catch (e) {
    Gifted = null;
  }

  const chartData = (data || []).map(d => ({ value: d.value, label: d.label }));

  if (Gifted && Gifted.LineChart) {
    const LineChart = Gifted.LineChart;
    const minSpacing = 30;
    const spacing = Math.max(minSpacing, Math.floor((width - 80) / Math.max(chartData.length, 1)));
    const chartWidth = Math.max(width - 80, (chartData.length - 1) * spacing + 80);

    // Render gifted LineChart inside a horizontal ScrollView to allow many points
    // @ts-ignore runtime component
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {/* @ts-ignore */}
          <LineChart
            data={chartData}
            width={chartWidth}
            height={height}
            initialSpacing={10}
            spacing={spacing}
            hideDataPoints={false}
            dataPointsColor={color}
            color={color}
            lineThickness={3}
            areaChart={false}
            curved
            isAnimated
            showVerticalLines={false}
            yAxisColor="#eee"
            xAxisLabelTextStyle={{ color: '#999', fontSize: 11 }}
          />
        </ScrollView>
      </View>
    );
  }

  // Fallback if gifted-charts not available or data empty
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Simple fallback: list values horizontally
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.fallbackChart, { height }]}> 
          {chartData.map((d, i) => (
            <View key={i} style={styles.fallbackPoint}>
              <Text style={styles.pointValue}>{d.value}</Text>
              <Text style={styles.xLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  fallbackChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  fallbackPoint: {
    width: 60,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  xLabel: {
    color: "#999",
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  pointValue: {
    color: "#333",
    fontWeight: "700",
  },
  empty: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});
