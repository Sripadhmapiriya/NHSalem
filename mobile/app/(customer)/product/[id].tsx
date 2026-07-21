import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../src/api/client';
import { Colors, typography, shadows } from '../../../src/constants/theme';
import { useCartStore } from '../../../src/store/cartStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);

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

  const activeVariant = selectedVariant || (product.variants && product.variants[0]) || { label: 'Standard', price: product.base_price || product.basePrice };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image_url || product.image,
      price: activeVariant.price,
      quantity: qty,
      variant: activeVariant.label,
      weightLabel: activeVariant.label
    });
    router.push('/(customer)/cart');
  };

  const getImageUrl = () => {
    const img = product.image_url || product.image || product.images?.[0];
    if (!img) return 'https://placehold.co/400';
    if (img.startsWith('/')) return `${process.env.EXPO_PUBLIC_API_URL}${img}`;
    return img;
  };

  const getAttributes = () => {
    try {
      if (typeof product.attributes === 'string') {
        return JSON.parse(product.attributes);
      }
      if (Array.isArray(product.attributes)) {
        return product.attributes;
      }
    } catch (e) {}
    return [];
  };

  const attributesList = getAttributes();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false}>

        {/* Hero Image */}
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: getImageUrl() }}
            style={{ width: '100%', height: 300, resizeMode: 'cover' }}
          />
          {/* Back button overlay */}
          <TouchableOpacity 
            style={{
              position: 'absolute', top: 16, left: 16,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 20, padding: 8
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          {/* Wishlist button overlay */}
          <TouchableOpacity style={styles.wishlistBtn}>
            <Ionicons name="heart-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
          {/* Fresh badge overlay */}
          {product.is_fresh_today && (
            <View style={styles.freshBadge}>
              <Text style={styles.freshBadgeText}>🌿 Fresh Today</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          
          {/* Category */}
          <Text style={{
            fontSize: 11, fontWeight: '600', color: '#166534',
            letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6
          }}>
            {product.category?.replace('-', ' ')}
          </Text>

          {/* Name */}
          <Text style={{
            fontSize: 24, fontWeight: '800', color: '#0f172a',
            lineHeight: 30, marginBottom: 6
          }}>
            {product.name}
          </Text>

          {/* Tagline */}
          {product.tagline && (
            <Text style={{
              fontSize: 14, color: '#64748b', fontStyle: 'italic',
              marginBottom: 16
            }}>
              "{product.tagline}"
            </Text>
          )}

          {/* Price + Rating row */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 20
          }}>
            <Text style={{
              fontSize: 32, fontWeight: '900', color: '#166534'
            }}>
              ₹{activeVariant.price}
            </Text>
            {(product.rating > 0 || product.reviewCount > 0 || product.review_count > 0) && (
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#fef3c7', borderRadius: 20,
                paddingHorizontal: 12, paddingVertical: 6
              }}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={{
                  fontWeight: '700', color: '#92400e', marginLeft: 4
                }}>
                  {product.rating || 0} ({product.reviewCount || product.review_count || 0})
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Select Size/Weight */}
          {product.variants?.length > 0 && (
            <View style={{ marginVertical: 16 }}>
              <Text style={styles.sectionLabel}>Select Size/Weight</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.variants.map((variant: any, i: number) => {
                  const isActive = activeVariant.label === variant.label;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedVariant(variant)}
                      style={[
                        styles.variantChip,
                        isActive && styles.variantChipActive
                      ]}
                    >
                      <Text style={[
                        styles.variantWeight,
                        isActive && { color: '#fff' }
                      ]}>
                        {variant.label}
                      </Text>
                      <Text style={[
                        styles.variantPrice,
                        isActive && { color: '#bbf7d0' }
                      ]}>
                        ₹{variant.price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Attributes/Tags */}
          {attributesList.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {attributesList.map((attr: string, i: number) => (
                  <View key={i} style={styles.attributeChip}>
                    <Text style={styles.attributeText}>✓ {attr}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Freshness Score */}
          <View style={styles.freshnessCard}>
            <View style={{ flex: 1, paddingRight: 20 }}>
              <Text style={styles.freshnessLabel}>Freshness Score</Text>
              <Text style={styles.freshnessValue}>{product.freshness_score || 95}%</Text>
            </View>
            <View style={{ flex: 2 }}>
              <View style={styles.freshnessBar}>
                <View style={[
                  styles.freshnessBarFill,
                  { width: `${product.freshness_score || 95}%` }
                ]} />
              </View>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={{ marginVertical: 16 }}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Reviews section */}
          <View style={{ marginBottom: 100 }}>
            <Text style={styles.sectionLabel}>
              Customer Reviews ({product.reviewCount || product.review_count || 0})
            </Text>
            {/* Reviews go here */}
          </View>
        </View>
      </ScrollView>

      {/* Bottom sticky: Quantity + Add to Cart */}
      <View style={styles.bottomBar}>
        {/* Quantity selector */}
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            onPress={() => setQty(Math.max(1, qty - 1))}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity 
            onPress={() => setQty(qty + 1)}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity 
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            Add to Cart — ₹{activeVariant.price * qty}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  wishlistBtn: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20, padding: 8
  },
  freshBadge: {
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: '#166534', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6
  },
  freshBadgeText: {
    color: '#fff', fontWeight: 'bold', fontSize: 12
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  variantChip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  variantChipActive: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  variantWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  attributeChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  attributeText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  },
  freshnessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  freshnessLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  freshnessValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#166534',
  },
  freshnessBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  freshnessBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30, // safe area
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginHorizontal: 8,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#166534',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
