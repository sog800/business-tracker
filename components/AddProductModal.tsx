import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../database/db";
import { formatNumberWithCommas, parseNumberWithCommas } from "../utils/numberFormat";

export default function AddProductModal({
  visible,
  onClose,
  onSaved
}: any) {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [currency, setCurrency] = useState("USD");

  const currencies = ["USD", "MWK"];

  function handleSave() {
    if (!productName.trim()) {
      Alert.alert("Error", "Please enter product name");
      return;
    }

    const now = new Date().toISOString();
    let productId: number;

    try {
      // Create product (selling price will be set when items are sold)
      db.runSync(
        `INSERT INTO product (name, sellingPrice, currency, totalQuantity, updatedAt)
         VALUES (?, ?, ?, ?, ?)`,
        [productName.trim(), 0, currency, quantity ? parseNumberWithCommas(quantity) : 0, now]
      );
    } catch (error: any) {
      // Fallback: insert without currency column (for old database schema)
      db.runSync(
        `INSERT INTO product (name, sellingPrice, totalQuantity, updatedAt)
         VALUES (?, ?, ?, ?)`,
        [productName.trim(), 0, quantity ? parseNumberWithCommas(quantity) : 0, now]
      );
    }

    // Get the product ID
    const result = db.getFirstSync(`SELECT last_insert_rowid() as id`) as { id: number };
    productId = result.id;

    // If quantity and total cost provided, create initial stock batch
    if (quantity && totalCost) {
      const parsedQuantity = parseNumberWithCommas(quantity);
      const parsedTotalCost = parseNumberWithCommas(totalCost);
      const costPerItem = parsedTotalCost / parsedQuantity;
      db.runSync(
        `INSERT INTO stock_batch (productId, orderingPrice, totalCost, quantity, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, costPerItem, parsedTotalCost, parsedQuantity, now]
      );
    }

    setProductName("");
    setQuantity("");
    setTotalCost("");
    setCurrency("USD");
    onSaved();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>➕ Add New Product</Text>

            <TextInput
              placeholder="Product Name"
              value={productName}
              onChangeText={setProductName}
              style={styles.input}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.helperText}>Add total initial stock</Text>

            <View style={styles.rowInputs}>
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                style={[styles.input, styles.halfInput]}
                placeholderTextColor="#999"
              />
              
              <TextInput
                placeholder="Total Cost"
                keyboardType="numeric"
                value={totalCost}
                onChangeText={(text) => setTotalCost(formatNumberWithCommas(text))}
                style={[styles.input, styles.halfInput]}
                placeholderTextColor="#999"
              />
            </View>
            
            <Text style={styles.helperTextSmall}>
              Total cost = items cost + shipping + transport + fees of all items you are registering now
            </Text>

            {/* <View style={styles.rowInputs}>
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                style={[styles.input, styles.halfInput]}
                placeholderTextColor="#999"
              />
            </View> */}

            <View style={styles.currencyContainer}>
              <Text style={styles.currencyLabel}>Currency:</Text>
              <View style={styles.currencyButtons}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    style={[
                      styles.currencyButton,
                      currency === curr && styles.currencyButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.currencyButtonText,
                      currency === curr && styles.currencyButtonTextActive
                    ]}>
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>💾 Create Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scrollContent: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  helperTextSmall: {
    fontSize: 11,
    color: "#888",
    marginTop: -10,
    marginBottom: 15,
    fontStyle: "italic",
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 18,
    color: "#333",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
    marginBottom: 15,
  },
  currencyContainer: {
    marginBottom: 20,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  currencyButtons: {
    flexDirection: "row",
    gap: 10,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  currencyButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  currencyButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
  },
  currencyButtonTextActive: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  cancelButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
