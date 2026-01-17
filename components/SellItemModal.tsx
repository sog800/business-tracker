import { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { sellItem } from "../services/inventoryService";
import { formatNumberWithCommas, parseNumberWithCommas } from "../utils/numberFormat";

export default function SellItemModal({
  visible,
  onClose,
  productId,
  onSaved
}: any) {
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleSave() {
    if (isSaving) return; // Prevent double submission
    
    if (!quantity || !sellingPrice) {
      Alert.alert("Error", "Please enter both quantity and selling price");
      return;
    }

    try {
      setIsSaving(true);
      sellItem(productId, parseNumberWithCommas(quantity), parseNumberWithCommas(sellingPrice));
      setQuantity("");
      setSellingPrice("");
      onSaved();
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sell item");
    } finally {
      setIsSaving(false);
    }
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
            backgroundColor: "white",
            borderRadius: 10,
            padding: 20
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Sell Item
          </Text>

          <TextInput
            placeholder="Quantity to sell"
            keyboardType="numeric"
            value={quantity}
            onChangeText={(text) => setQuantity(formatNumberWithCommas(text))}
            style={{ borderBottomWidth: 1, marginTop: 15, fontSize: 18 }}
          />

          <TextInput
            placeholder="Total Selling Price (for all items)"
            keyboardType="numeric"
            value={sellingPrice}
            onChangeText={(text) => setSellingPrice(formatNumberWithCommas(text))}
            style={{ borderBottomWidth: 1, marginTop: 15, fontSize: 18 }}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={{
              marginTop: 20,
              backgroundColor: isSaving ? "#cccccc" : "#4CAF50",
              padding: 12,
              borderRadius: 8,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              {isSaving ? "⏳ Processing..." : "💰 Sell"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            disabled={isSaving}
            style={{
              marginTop: 12,
              backgroundColor: "#f44336",
              padding: 12,
              borderRadius: 8,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              ❌ Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
