import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { apiClient } from '../../src/api/client';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MyOrdersScreen() {
  const { isLoggedIn } = useAuthStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/orders');
      setOrders(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = (order: any) => {
    // Add all items to cart
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        addItem({
          id: Math.random().toString(), // Cart needs unique ID for line item
          productId: item.productId,
          name: item.name || 'Seafood Item',
          price: item.price,
          quantity: item.quantity,
          variant: item.weight || 'Standard'
        });
      });
      router.push('/(customer)/cart');
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="lock-closed-outline" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>Login Required</Text>
        <Text style={styles.emptySubtitle}>Please login to view your order history.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.primaryBtnText}>Login / Register</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>You haven't placed any orders with us yet.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(customer)')}>
          <Text style={styles.primaryBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item: any) => item.id || item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{item.id?.substring(0, 8) || item._id?.substring(0, 8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'delivered' ? '#dcfce7' : '#fef9c3' }]}>
                <Text style={[styles.statusText, { color: item.status === 'delivered' ? '#166534' : '#854d0e' }]}>
                  {item.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>

            <View style={styles.orderBody}>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.totalText}>Total: ₹{item.totalAmount}</Text>
            </View>

            <View style={styles.itemsPreview}>
              <Text style={styles.itemsText} numberOfLines={1}>
                {item.items?.map((i: any) => `${i.quantity}x ${i.name || 'Item'}`).join(', ')}
              </Text>
            </View>

            <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(item)}>
              <Ionicons name="refresh" size={16} color={Colors.primary} />
              <Text style={styles.reorderBtnText}>Reorder Items</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.md },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderId: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  dateText: { fontSize: 14, color: Colors.textSecondary },
  totalText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  itemsPreview: { backgroundColor: '#F3F4F6', padding: Spacing.sm, borderRadius: 6, marginBottom: Spacing.md },
  itemsText: { fontSize: 12, color: Colors.textSecondary },
  reorderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0F9FF', paddingVertical: 10, borderRadius: 8, gap: 8,
    borderWidth: 1, borderColor: '#BAE6FD'
  },
  reorderBtnText: { color: Colors.primary, fontWeight: 'bold' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: Spacing.xl },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  primaryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
