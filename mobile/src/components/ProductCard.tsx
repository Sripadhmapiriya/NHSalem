import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Colors, shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/cartStore';

interface ProductProps {
  product: {
    id: string;
    name: string;
    base_price: number;
    image_url?: string;
    image?: string;
    images?: string[];
    category: string;
    rating?: number;
    review_count?: number;
    is_fresh_today?: boolean;
    is_premium?: boolean;
    weights?: string;
  };
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ProductCard({ product, onPress, style }: ProductProps) {
  const { addItem } = useCartStore();

  const getImageUrl = () => {
    const img = product.image_url || product.image || product.images?.[0];
    if (!img) return 'https://placehold.co/300';
    if (img.startsWith('/')) return `${process.env.EXPO_PUBLIC_API_URL}${img}`;
    return img;
  };

  const handleAddToCart = () => {
    let defaultVariant = { label: 'Standard', price: product.base_price };
    try {
      if (typeof product.weights === 'string') {
        const weightsArray = JSON.parse(product.weights);
        if (weightsArray && weightsArray.length > 0) {
          defaultVariant = weightsArray[0];
        }
      } else if (Array.isArray(product.weights) && product.weights.length > 0) {
        defaultVariant = product.weights[0];
      }
    } catch (e) {}

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(defaultVariant.price) || product.base_price,
      quantity: 1,
      variant: defaultVariant.label,
      image: getImageUrl(),
      weightLabel: defaultVariant.label,
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.is_fresh_today && (
          <View style={styles.freshBadge}>
            <Text style={styles.freshBadgeText}>🌿 Fresh</Text>
          </View>
        )}
        {product.is_premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>👑</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category?.replace('-', ' ').toUpperCase()}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {/* Rating */}
        {(product.rating && product.rating > 0) ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.review_count || 0})</Text>
          </View>
        ) : null}

        {/* Price + Add button */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.base_price}</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    margin: 6,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  freshBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freshBadgeText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '700',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
  },
  content: {
    padding: 10,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
  addBtn: {
    backgroundColor: '#166534',
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
