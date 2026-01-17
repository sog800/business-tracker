import { useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { addItem } from "../services/inventoryService";
import { formatNumberWithCommas, parseNumberWithCommas } from "../utils/numberFormat";

export default function AddItemModal({
  visible,
  onClose,
  productId,
  onSaved
}: any) {
  const [totalCost, setTotalCost] = useState("");
  const [quantity, setQuantity] = useState("");

  function handleSave() {
    if (!totalCost || !quantity) return;

    addItem(
      productId,
      parseNumberWithCommas(quantity),
      parseNumberWithCommas(totalCost)
    );

    setTotalCost("");
    setQuantity("");
    onSaved();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 20
        }}
      >
        <View
          style={{
            backgroundColor: "#1e1e1e",
            borderRadius: 10,
            padding: 20
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#ffffff" }}>
            Add Items to Stock
          </Text>
          
          <Text style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
            Enter total cost including shipping, transport, etc.
          </Text>

          <TextInput
            placeholder="Quantity"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={quantity}
            onChangeText={(text) => setQuantity(formatNumberWithCommas(text))}
            style={{ borderBottomWidth: 1, borderBottomColor: "#333", color: "#fff", marginTop: 15, paddingVertical: 8, fontSize: 18 }}
          />

          <TextInput
            placeholder="Total cost for all items"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={totalCost}
            onChangeText={(text) => setTotalCost(formatNumberWithCommas(text))}
            style={{ borderBottomWidth: 1, borderBottomColor: "#333", color: "#fff", marginTop: 15, paddingVertical: 8, fontSize: 18 }}
          />

          <TouchableOpacity
            onPress={handleSave}
            style={{ marginTop: 20, backgroundColor: "#007AFF", padding: 12, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>💾 Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 10, alignItems: "center" }}
          >
            <Text style={{ color: "#888" }}>❌ Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
