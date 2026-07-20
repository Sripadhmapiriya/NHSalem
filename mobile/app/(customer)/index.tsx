import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { Colors, Spacing } from '../../src/constants/theme';
import ProductCard from '../../src/components/ProductCard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const CATEGORIES = ['All', 'Fish', 'Prawns', 'Crabs', 'Lobster', 'Dried Fish', 'Combos'];

export default function CustomerHome() {
  const router = useRouter();
  
  const { data: promotions, isLoading: loadingPromotions } = useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/promotions/active');
        return response.data?.data || [];
      } catch (e) { return []; }
    }
  });

  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await apiClient.get('/api/products?sort=az');
      return response.data?.data || response.data || [];
    }
  });

  const { data: allProducts, isLoading: loadingAll } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const response = await apiClient.get('/api/products');
      return response.data?.data || response.data || [];
    }
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {/* Placeholder for Logo */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>NH</Text>
        </View>
        <Text style={styles.headerTitle}>NH Salem Sea Foods</Text>
      </View>
      
      <View style={styles.locationBar}>
        <Ionicons name="location-sharp" size={16} color={Colors.surface} />
        <Text style={styles.locationText}>Delivering to Salem, Tamil Nadu</Text>
      </View>

      <TouchableOpacity 
        style={styles.searchBar} 
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={20} color={Colors.textLight} />
        <Text style={styles.searchText}>Search for seafood...</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Announcement Banner */}
        {!loadingPromotions && promotions?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerContainer}>
            {promotions.map((promo: any, index: number) => (
              <View key={index} style={styles.promoCard}>
                <Text style={styles.promoTitle}>{promo.title || promo.code}</Text>
                <Text style={styles.promoDesc}>{promo.description}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {CATEGORIES.map((cat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.categoryChip}
              onPress={() => router.push({ pathname: '/(customer)/categories', params: { selected: cat } })}
            >
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fresh Today 🐟</Text>
          {loadingFeatured ? <ActivityIndicator color={Colors.primary} /> : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={(featuredProducts || []).slice(0, 5)}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <ProductCard 
                  product={item} 
                  onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} 
                />
              )}
              contentContainerStyle={{ paddingLeft: Spacing.md }}
            />
          )}
        </View>

        {/* Subscribe Banner */}
        <TouchableOpacity style={styles.subscribeBanner} onPress={() => {/* router.push('/subscription') */}}>
          <Text style={styles.subscribeTitle}>Subscribe & Save 🐟</Text>
          <Text style={styles.subscribeDesc}>Get fresh seafood delivered weekly on your schedule.</Text>
          <View style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>View Plans</Text>
          </View>
        </TouchableOpacity>

        {/* All Products Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products</Text>
          {loadingAll ? <ActivityIndicator color={Colors.primary} /> : (
            <View style={styles.gridContainer}>
              {(allProducts || []).map((item: any) => (
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    backgroundColor: '#0f172a',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  logoText: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 },
  headerTitle: { color: Colors.surface, fontSize: 20, fontWeight: 'bold' },
  locationBar: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  locationText: { color: Colors.surface, marginLeft: 6, fontSize: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: 12, borderRadius: 8, gap: 8
  },
  searchText: { color: Colors.textLight, fontSize: 16 },
  
  bannerContainer: { marginTop: Spacing.md, paddingHorizontal: Spacing.md },
  promoCard: {
    backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: 12,
    marginRight: Spacing.md, width: 250,
  },
  promoTitle: { color: Colors.white, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  promoDesc: { color: '#E0F2FE', fontSize: 12 },

  categoriesContainer: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  categoryChip: {
    backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: Colors.border
  },
  categoryText: { color: Colors.text, fontWeight: '600' },

  section: { marginVertical: Spacing.sm },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginLeft: Spacing.md, marginBottom: Spacing.sm },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xs },
  gridItem: { width: '50%', padding: Spacing.xs },
  
  subscribeBanner: {
    backgroundColor: '#e0f2fe', margin: Spacing.md, padding: Spacing.lg, borderRadius: 12,
    borderWidth: 1, borderColor: '#bae6fd'
  },
  subscribeTitle: { fontSize: 18, fontWeight: 'bold', color: '#0369a1', marginBottom: 4 },
  subscribeDesc: { fontSize: 14, color: '#0284c7', marginBottom: 12 },
  subscribeBtn: {
    backgroundColor: '#0369a1', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, alignSelf: 'flex-start'
  },
  subscribeBtnText: { color: Colors.white, fontWeight: 'bold' }
});
