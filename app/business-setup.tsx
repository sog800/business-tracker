import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBusiness } from "../services/businessService";

export default function BusinessSetup() {
  const [businessName, setBusinessName] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  }

  function handleSave() {
    if (!businessName.trim()) {
      Alert.alert("Error", "Please enter a business name");
      return;
    }

    createBusiness(businessName.trim(), logoUri || undefined);
    router.replace("/dashboard");
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome! 🎉</Text>
        <Text style={styles.subtitle}>Let's set up your business</Text>

        <TouchableOpacity 
          onPress={pickImage}
          style={styles.logoContainer}
        >
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>📷</Text>
              <Text style={styles.logoPlaceholderSubtext}>Tap to add logo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Business Name"
          value={businessName}
          onChangeText={setBusinessName}
          style={styles.input}
          autoFocus
        />

        <TouchableOpacity
          onPress={handleSave}
          style={styles.button}
        >
          <Text style={styles.buttonText}>✨ Start Tracking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 16,
    color: "#aaaaaa",
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444",
    borderStyle: "dashed",
  },
  logoPlaceholderText: {
    fontSize: 40,
  },
  logoPlaceholderSubtext: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  input: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
    paddingVertical: 10,
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
