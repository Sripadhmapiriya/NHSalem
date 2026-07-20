import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../src/constants/theme';
import { useCartStore } from '../../src/store/cartStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getCartTotal, clearCart } = useCartStore();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [slot, setSlot] = useState('7-9 AM');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = 50; // Flat fee
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in your delivery address and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: items.map(i => ({
          productId: i.productId,
          weight: i.variant || 'Standard',
          quantity: i.quantity
        })),
        address: {
          line1: address,
          phone: phone,
          city: 'Salem',
        },
        slot: slot,
        paymentMethod: paymentMethod
      };

      if (paymentMethod === 'razorpay') {
        Alert.alert('Notice', 'Razorpay requires native modules which cannot run in Expo Go. For this demo, we will process your order as Cash on Delivery.', [
          { text: 'OK', onPress: () => {} }
        ]);
        orderData.paymentMethod = 'cod';
      }

      await apiClient.post('/api/orders', orderData);
      clearCart();
      Alert.alert('Success!', 'Your order has been placed successfully.', [
        { text: 'OK', onPress: () => router.replace('/(customer)/profile') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Cart is empty</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
          <Text style={styles.shopBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={styles.input} 
              value={phone} 
              onChangeText={setPhone} 
              placeholder="Enter your phone number" 
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              value={address} 
              onChangeText={setAddress} 
              placeholder="Enter your full address in Salem" 
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Delivery Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Slot</Text>
          <View style={styles.slotContainer}>
            {['7-9 AM', '12-2 PM', '6-8 PM'].map((time) => (
              <TouchableOpacity 
                key={time} 
                style={[styles.slotBtn, slot === time && styles.slotBtnActive]}
                onPress={() => setSlot(time)}
              >
                <Text style={[styles.slotText, slot === time && styles.slotTextActive]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {items.map((item, index) => (
              <View key={index} style={styles.summaryItemRow}>
                <Text style={styles.summaryItemName}>{item.quantity}x {item.name} ({item.variant})</Text>
                <Text style={styles.summaryItemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity 
            style={[styles.paymentMethodCard, paymentMethod === 'cod' && styles.paymentMethodActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.paymentMethodText, paymentMethod === 'cod' && { color: Colors.primary }]}>Cash on Delivery (COD)</Text>
            {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentMethodCard, paymentMethod === 'razorpay' && styles.paymentMethodActive]}
            onPress={() => setPaymentMethod('razorpay')}
          >
            <Ionicons name="card-outline" size={24} color={paymentMethod === 'razorpay' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.paymentMethodText, paymentMethod === 'razorpay' && { color: Colors.primary }]}>Pay Online (Razorpay)</Text>
            {paymentMethod === 'razorpay' && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.placeOrderBtnText}>Place Order • ₹{total}</Text>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingRight: 16,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  paymentMethodActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  slotContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  slotBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  slotBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  slotText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  slotTextActive: {
    color: Colors.primary,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 40,
  },
  placeOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  placeOrderBtnText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopBtnText: {
    color: Colors.surface,
    fontWeight: 'bold',
  }
});
