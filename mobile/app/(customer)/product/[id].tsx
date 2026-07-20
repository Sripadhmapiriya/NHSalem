import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../src/api/client';
import { Colors } from '../../../src/constants/theme';
import { useCartStore } from '../../../src/store/cartStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/products/${id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: Colors.error }}>Failed to load product details.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeVariant = selectedVariant || (product.variants && product.variants[0]) || { label: 'Standard', price: product.basePrice };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: activeVariant.price,
      quantity,
      variant: activeVariant.label,
      weightLabel: activeVariant.label
    });
    router.push('/(customer)/cart');
  };

  const getImageUrl = () => {
    const img = product.image || product.images?.[0];
    if (!img) return 'https://via.placeholder.com/400';
    if (img.startsWith('/')) return `${process.env.EXPO_PUBLIC_API_URL}${img}`;
    return img;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Image source={{ uri: getImageUrl() }} style={styles.image} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.name}</Text>
          {product.tagline && <Text style={styles.tagline}>{product.tagline}</Text>}
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{activeVariant.price}</Text>
            {product.reviewCount > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color={Colors.secondary} />
                <Text style={styles.ratingText}>{product.rating} ({product.reviewCount})</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Size/Weight</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsRow}>
                {product.variants.map((v: any, index: number) => {
                  const isSelected = activeVariant.label === v.label;
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.variantBadge, isSelected && styles.variantBadgeActive]}
                      onPress={() => setSelectedVariant(v)}
                    >
                      <Text style={[styles.variantText, isSelected && styles.variantTextActive]}>
                        {v.label}
                      </Text>
                      <Text style={[styles.variantPrice, isSelected && styles.variantTextActive]}>
                        ₹{v.price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
          
          {/* How to cook */}
          {product.howToCook && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Cook</Text>
              <Text style={styles.description}>{product.howToCook}</Text>
            </View>
          )}

          {/* Bottom Padding for floating bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.floatingBar}>
        <View style={styles.qtyControls}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart - ₹{activeVariant.price * quantity}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50, // rough safe area inset
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 14,
    color: Colors.primary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontWeight: '600',
    color: '#92400E',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  variantsRow: {
    gap: 12,
  },
  variantBadge: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  variantBadgeActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  variantText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  variantTextActive: {
    color: Colors.surface,
  },
  variantPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32, // safe area padding
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 16,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  }
});
