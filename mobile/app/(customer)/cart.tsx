import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Colors, Spacing } from '../../src/constants/theme';
import { useCartStore } from '../../src/store/cartStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();

  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>Looks like you haven't added any seafood yet.</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(customer)')}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const getImageUrl = () => {
            const img = item.image;
            if (!img) return 'https://via.placeholder.com/100';
            if (img.startsWith('/')) return `${process.env.EXPO_PUBLIC_API_URL}${img}`;
            return img;
          };

          return (
          <View style={styles.cartItem}>
            <Image source={{ uri: getImageUrl() }} style={styles.itemImage} />
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemVariant}>{item.variant}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
              
              <View style={styles.qtyContainer}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                  <Ionicons name="remove" size={16} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                  <Ionicons name="add" size={16} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.couponContainer}>
          <Text style={{display: 'none'}}>Placeholder</Text>
          <View style={{flex: 1}}><Text style={{display:'none'}}>Replace</Text></View>
        </View>
        
        {/* We will add real coupon state later, this is just UI update for now */}
        <View style={styles.couponContainer}>
          <TextInput 
            style={styles.couponInput} 
            placeholder="Enter Coupon Code" 
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.couponBtn}>
            <Text style={styles.couponBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Subtotal</Text>
            <Text style={styles.summaryValue}>₹{total}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>FREE</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.checkoutBtn} 
          onPress={() => router.push('/(customer)/checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  rightActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  deleteBtn: {
    padding: 4,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    width: 24,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 40,
  },
  couponContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: 16,
  },
  couponBtn: {
    backgroundColor: Colors.secondary || '#334155',
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    borderRadius: 8,
  },
  couponBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  shopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  }
});
