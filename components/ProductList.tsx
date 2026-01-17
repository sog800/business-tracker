import { FlatList, StyleSheet, Text, View } from "react-native";

interface ProductItem {
  id: number;
  name: string;
  quantitySold: number;
  profit: number;
}

interface ProductListProps {
  title: string;
  products: ProductItem[];
  icon?: string;
  currencySymbol?: string;
}

export default function ProductList({
  title,
  products,
  icon = "📦",
  currencySymbol = "$"
}: ProductListProps) {
  if (!products || products.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{icon} {title}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No products yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{icon} {title}</Text>
      
      <FlatList
        data={products}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productStats}>
                {item.quantitySold} sold
              </Text>
            </View>
            <Text style={[
              styles.profit,
              { color: item.profit >= 0 ? "#4CAF50" : "#FF6B6B" }
            ]}>
              {item.profit < 0 ? '-' : ''}{currencySymbol}{Math.abs(item.profit)}
            </Text>
          </View>
        )}
      />
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productStats: {
    fontSize: 12,
    color: "#999",
  },
  profit: {
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 60,
    textAlign: "right",
  },
  empty: {
    paddingVertical: 30,
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
