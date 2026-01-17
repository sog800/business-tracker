import { Dimensions, StyleSheet, Text, View } from "react-native";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  color = "#007AFF",
  icon = "📊"
}: MetricCardProps) {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 480;
  
  return (
    <View style={[styles.card, { backgroundColor: color + "15", borderColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <Text style={[
        styles.value,
        { fontSize: isSmallScreen ? 24 : 32 }
      ]}>
        {value}
      </Text>
      
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  value: {
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
  },
});
