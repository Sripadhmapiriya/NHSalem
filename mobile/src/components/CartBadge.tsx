import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCartStore } from '../store/cartStore';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CartBadge({ color, size }: { color: string, size: number }) {
  const { items } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.container}>
      <Ionicons name="cart-outline" size={size} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error || '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
