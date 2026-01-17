import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { getBusiness } from "../services/businessService";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Show splash for a moment
    setTimeout(() => {
      const business = getBusiness();
      
      if (business) {
        router.replace("/dashboard");
      } else {
        router.replace("/business-setup");
      }
      
      setLoading(false);
    }, 1500);
  }, []);

  const business = getBusiness();

  return (
    <View style={styles.container}>
      {business?.logoUri ? (
        <Image 
          source={{ uri: business.logoUri }} 
          style={styles.logo}
        />
      ) : (
        <Text style={styles.appName}>
          {business?.name || "BizTrack Lite"}
        </Text>
      )}
      
      <Text style={styles.tagline}>Business Tracking Made Simple</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
});
