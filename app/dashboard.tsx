import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddProductModal from "../components/AddProductModal";
import ProductAnalyticsCard from "../components/ProductAnalyticsCard";
import ProductCard from "../components/ProductCard";
import { db } from "../database/db";
import { getProductCurrentMonthSales, getProductMetrics } from "../services/analyticsService";
import { getBusiness } from "../services/businessService";

interface Business {
  id: number;
  name: string;
  logoUri: string | null;
  password: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  totalQuantity: number;
  currency: string;
  updatedAt: string;
}

interface ProductWithMetrics extends Product {
  metrics?: any;
}

export default function Dashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsWithMetrics, setProductsWithMetrics] = useState<ProductWithMetrics[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [view, setView] = useState<"products" | "analytics">("analytics");
  const { width } = Dimensions.get("window");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    refreshData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  function refreshData() {
    const businessData = getBusiness();
    if (businessData) {
      setBusiness(businessData);
    }

    loadProducts();
    refreshAnalytics();
  }

  function loadProducts() {
    const data = db.getAllSync(`SELECT * FROM product ORDER BY name ASC`) as Product[];
    setProducts(data || []);
  }

  function refreshAnalytics() {
    // Load products with their analytics metrics
    const data = db.getAllSync(`SELECT * FROM product ORDER BY name ASC`) as Product[];
    
    const productsWithData = data.map(product => {
      const metrics = getProductMetrics(product.id);
      const dailySales = getProductCurrentMonthSales(product.id);
      
      return {
        ...product,
        metrics: {
          ...metrics,
          dailySales,
        },
      };
    });
    
    setProductsWithMetrics(productsWithData);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        {business?.logoUri && (
          <Image 
            source={{ uri: business.logoUri }} 
            style={styles.logo}
          />
        )}
        <View style={styles.headerText}>
          <Text style={styles.businessName}>
            {business?.name || "BizTrack Lite"}
          </Text>
          <Text style={styles.subtitle}>{view === "products" ? "Products" : "Analytics"}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          onPress={() => setView("products")}
          style={[styles.toggleButton, view === "products" && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, view === "products" && styles.toggleTextActive]}>
            📦 Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setView("analytics")}
          style={[styles.toggleButton, view === "analytics" && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, view === "analytics" && styles.toggleTextActive]}>
            📊 Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {view === "products" ? (
        // PRODUCTS VIEW
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => setShowAddProductModal(true)}
            style={styles.addProductButton}
          >
            <Text style={styles.addProductButtonText}>➕ Add New Product</Text>
          </TouchableOpacity>

          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap "Add New Product" to get started</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ProductCard product={item} onRefresh={refreshData} />
              )}
              scrollEnabled={true}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      ) : (
        // ANALYTICS VIEW
        <ScrollView
          style={styles.analyticsContent}
          contentContainerStyle={styles.analyticsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {productsWithMetrics.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products yet</Text>
              <Text style={styles.emptyStateSubtext}>Add products to see analytics</Text>
            </View>
          ) : (
            <>
              <Text style={styles.analyticsHeader}>
                📊 Product Analytics
              </Text>
              <Text style={styles.analyticsSubheader}>
                Individual performance metrics for each product
              </Text>
              
              {productsWithMetrics.map((product) => (
                <ProductAnalyticsCard
                  key={product.id}
                  productId={product.id}
                  productName={product.name}
                  currency={product.currency}
                  metrics={product.metrics}
                />
              ))}
            </>
          )}

          {/* Footer Padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSaved={() => {
          setShowAddProductModal(false);
          refreshData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  businessName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaaaaa",
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#007AFF",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#aaaaaa",
  },
  toggleTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  addProductButton: {
    backgroundColor: "#4CAF50",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addProductButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsScrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  analyticsHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  analyticsSubheader: {
    fontSize: 14,
    color: "#aaaaaa",
    marginBottom: 20,
  },
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  settingsText: {
    fontSize: 30,
  },
});
