import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { Colors, Spacing, typography, shadows } from '../../src/constants/theme';
import ProductCard from '../../src/components/ProductCard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const categories = [
  { id: 'all', label: 'All', emoji: '🌊' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'prawns-shrimp', label: 'Prawns', emoji: '🦐' },
  { id: 'crabs', label: 'Crabs', emoji: '🦀' },
  { id: 'lobster', label: 'Lobster', emoji: '🦞' },
  { id: 'dried-fish', label: 'Dried Fish', emoji: '🐠' },
  { id: 'combos', label: 'Combos', emoji: '🎁' },
];

export default function CustomerHome() {
  const router = useRouter();
  const allProductsRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [email, setEmail] = useState('');

  const { data: promotions = [], isLoading: loadingPromotions } = useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/promotions/active');
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
      } catch (e) { return []; }
    }
  });

  const { data: allProducts = [], isLoading: loadingAll } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/products');
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
      } catch (e) { return []; }
    }
  });

  const freshToday = useMemo(() => allProducts.filter((p: any) => p.is_fresh_today), [allProducts]);
  const premiumPicks = useMemo(() => allProducts.filter((p: any) => p.is_premium), [allProducts]);
  const popularProducts = useMemo(() => [...allProducts].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)), [allProducts]);
  
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return allProducts;
    return allProducts.filter((p: any) => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  const handleNewsletterSubscribe = () => {
    // Basic newsletter subscribe logic
    setEmail('');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Logo + Brand */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>NH</Text>
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.brandName}>NH Salem Sea Foods</Text>
          <Text style={styles.brandTagline}>Fresh from the Sea</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Location bar */}
      <TouchableOpacity style={styles.locationBar}>
        <Ionicons name="location-outline" size={16} color="#86efac" />
        <Text style={styles.locationText}>
          Delivering to Salem, Tamil Nadu
        </Text>
        <Ionicons name="chevron-down" size={14} color="#86efac" />
      </TouchableOpacity>

      {/* Search bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <Text style={styles.searchPlaceholder}>
          Search for seafood...
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        ref={allProductsRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {renderHeader()}
        
        {/* 2B. Promo Banner */}
        <View style={styles.promoSection}>
          {!loadingPromotions && promotions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
              {promotions.map((promo: any, index: number) => (
                <View key={index} style={styles.promoCard}>
                  <Text style={styles.promoOfferLabel}>LIMITED OFFER</Text>
                  <Text style={styles.promoTitle}>{promo.title || promo.code}</Text>
                  <Text style={styles.promoDesc}>{promo.description}</Text>
                  <View style={styles.promoCodeBadge}>
                    <Text style={styles.promoCode}>{promo.code}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
              <View style={styles.promoCard}>
                <Text style={styles.promoOfferLabel}>LIMITED OFFER</Text>
                <Text style={styles.promoTitle}>🎉 Use WELCOME200 — ₹200 off first order</Text>
                <Text style={styles.promoDesc}>Claim your welcome bonus now!</Text>
                <View style={styles.promoCodeBadge}>
                  <Text style={styles.promoCode}>WELCOME200</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>

        {/* 2C. Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 2D & 2E. Fresh Today */}
        {freshToday.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fresh Today 🐟</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See All →</Text></TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={freshToday.slice(0, 5)}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} />
              )}
              contentContainerStyle={{ paddingLeft: Spacing.md }}
            />
          </View>
        )}

        {/* 2F. Subscribe & Save Banner */}
        <TouchableOpacity 
          style={styles.subscribeBanner}
          onPress={() => router.push('/(customer)/subscription')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.subscribeBadge}>🌟 SUBSCRIPTION</Text>
            <Text style={styles.subscribeTitle}>Subscribe & Save</Text>
            <Text style={styles.subscribeSubtitle}>
              Get fresh seafood delivered weekly on your schedule. Save up to 20%!
            </Text>
            <View style={styles.subscribeBtn}>
              <Text style={styles.subscribeBtnText}>View Plans →</Text>
            </View>
          </View>
          <Text style={{ fontSize: 60 }}>🐠</Text>
        </TouchableOpacity>

        {/* 2G. Popular Products */}
        {popularProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Most Popular</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See All →</Text></TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={popularProducts.slice(0, 5)}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} />
              )}
              contentContainerStyle={{ paddingLeft: Spacing.md }}
            />
          </View>
        )}

        {/* 2H. Premium Picks */}
        {premiumPicks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👑 Premium Selection</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See All →</Text></TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={premiumPicks.slice(0, 5)}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} />
              )}
              contentContainerStyle={{ paddingLeft: Spacing.md }}
            />
          </View>
        )}

        {/* 2I. All Products Grid */}
        <View style={[styles.section, { paddingHorizontal: Spacing.md }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.label}
            </Text>
            <Text style={styles.productCount}>{filteredProducts.length} products</Text>
          </View>
          
          {loadingAll ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <View style={styles.gridContainer}>
              {filteredProducts.map((item: any) => (
                <View key={item.id} style={styles.gridItem}>
                  <ProductCard 
                    product={item} 
                    onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} 
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 2J. Delivery Info */}
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>🚚 Fast Delivery Promise</Text>
          <View style={styles.deliveryStats}>
            <View style={styles.deliveryStat}>
              <Text style={styles.deliveryStatNum}>2h</Text>
              <Text style={styles.deliveryStatLabel}>Express Delivery</Text>
            </View>
            <View style={styles.deliveryStat}>
              <Text style={styles.deliveryStatNum}>95%</Text>
              <Text style={styles.deliveryStatLabel}>Freshness Score</Text>
            </View>
            <View style={styles.deliveryStat}>
              <Text style={styles.deliveryStatNum}>500+</Text>
              <Text style={styles.deliveryStatLabel}>Happy Customers</Text>
            </View>
          </View>
        </View>

        {/* 2K. Newsletter */}
        <View style={styles.newsletter}>
          <Text style={styles.newsletterTitle}>📧 Stay in the Loop</Text>
          <Text style={styles.newsletterSubtitle}>
            Get flash sales and seasonal catches to your inbox
          </Text>
          <View style={styles.newsletterInput}>
            <TextInput 
              placeholder="your@email.com" 
              style={styles.emailInput} 
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.subscribeEmailBtn} onPress={handleNewsletterSubscribe}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    backgroundColor: '#0f172a',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  logoContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  logoText: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 },
  brandName: { color: Colors.surface, fontSize: 18, fontWeight: '800' },
  brandTagline: { color: '#94a3b8', fontSize: 12 },
  notifBtn: { padding: 4 },
  locationBar: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  locationText: { color: '#86efac', marginLeft: 6, marginRight: 4, fontSize: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b',
    padding: 12, borderRadius: 8, gap: 8
  },
  searchPlaceholder: { color: '#94a3b8', fontSize: 16 },
  
  promoSection: { marginVertical: Spacing.md },
  promoCard: {
    backgroundColor: '#166534', borderRadius: 16, padding: 16,
    marginHorizontal: Spacing.md, width: SCREEN_WIDTH - 32,
  },
  promoOfferLabel: { color: '#86efac', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  promoTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  promoDesc: { color: '#bbf7d0', fontSize: 13, marginTop: 4 },
  promoCodeBadge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 8, alignSelf: 'flex-start', marginTop: 12 
  },
  promoCode: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  categoriesContainer: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: Colors.border
  },
  categoryChipActive: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  categoryEmoji: { marginRight: 6, fontSize: 16 },
  categoryLabel: { color: Colors.text, fontWeight: '600' },
  categoryLabelActive: { color: '#166534' },

  section: { marginBottom: Spacing.xxl },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm 
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  seeAll: { color: '#166534', fontWeight: '600' },
  productCount: { color: '#64748b', fontSize: 14 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%', padding: 0 },
  
  subscribeBanner: {
    flexDirection: 'row', backgroundColor: '#eff6ff', margin: Spacing.md, padding: 20, 
    borderRadius: 16, borderWidth: 1, borderColor: '#bfdbfe', alignItems: 'center'
  },
  subscribeBadge: { color: '#1d4ed8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  subscribeTitle: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', marginBottom: 4 },
  subscribeSubtitle: { fontSize: 14, color: '#3b82f6', marginBottom: 12, lineHeight: 20 },
  subscribeBtn: {
    backgroundColor: '#1d4ed8', paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 8, alignSelf: 'flex-start'
  },
  subscribeBtnText: { color: Colors.white, fontWeight: 'bold' },

  deliveryInfo: {
    backgroundColor: '#fff', margin: Spacing.md, padding: Spacing.lg,
    borderRadius: 16, ...shadows.sm
  },
  deliveryTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16, textAlign: 'center' },
  deliveryStats: { flexDirection: 'row', justifyContent: 'space-between' },
  deliveryStat: { alignItems: 'center', flex: 1 },
  deliveryStatNum: { fontSize: 24, fontWeight: '800', color: '#166534', marginBottom: 4 },
  deliveryStatLabel: { fontSize: 12, color: '#64748b', textAlign: 'center' },

  newsletter: {
    backgroundColor: '#0f172a', margin: Spacing.md, padding: Spacing.lg,
    borderRadius: 16, alignItems: 'center'
  },
  newsletterTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  newsletterSubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  newsletterInput: { flexDirection: 'row', width: '100%', gap: 8 },
  emailInput: { 
    flex: 1, backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 16, 
    height: 48, color: '#fff' 
  },
  subscribeEmailBtn: { 
    backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 16, borderRadius: 8, height: 48 
  }
});
