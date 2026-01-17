import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { deleteProduct } from "../services/inventoryService";
import AddItemModal from "./AddItemModal";
import SellItemModal from "./SellItemModal";

export default function ProductCard({ product, onRefresh }: any) {
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const currencySymbol = product.currency === "MWK" ? "MK" : "$";
  const isOutOfStock = product.totalQuantity === 0;
  const isLowStock = product.totalQuantity > 0 && product.totalQuantity <= 5;

  function handleDelete() {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This will remove all sales and inventory data for this product.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            onRefresh();
          }
        }
      ]
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
          </View>
          <View style={[styles.quantityBadge, isOutOfStock ? styles.badgeOut : isLowStock ? styles.badgeLow : null]}>
            <Text style={[styles.quantityText, isOutOfStock ? styles.badgeOutText : isLowStock ? styles.badgeLowText : null]}>
              {product.totalQuantity}
            </Text>
          </View>
        </View>

        {expanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={[styles.button, styles.buttonAdd]}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSellModal(true)}
              style={[styles.button, styles.buttonSell]}
            >
              <Text style={styles.buttonText}>Sell</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.button, styles.buttonDelete]}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      <AddItemModal
        visible={showAddModal}
        productId={product.id}
        onClose={() => setShowAddModal(false)}
        onSaved={onRefresh}
      />

      <SellItemModal
        visible={showSellModal}
        productId={product.id}
        onClose={() => setShowSellModal(false)}
        onSaved={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  quantityBadge: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonAdd: {
    backgroundColor: "#4CAF50",
  },
  buttonSell: {
    backgroundColor: "#FF9800",
  },
  buttonDelete: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  badgeOut: {
    backgroundColor: '#FF6B6B',
  },
  badgeOutText: {
    color: 'white',
  },
  badgeLow: {
    backgroundColor: '#FFF3CD',
  },
  badgeLowText: {
    color: '#856404',
  },
});
