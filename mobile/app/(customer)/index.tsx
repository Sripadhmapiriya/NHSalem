import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { Colors } from '../../src/constants/theme';
import ProductCard from '../../src/components/ProductCard';
import { useAuthStore } from '../../src/store/authStore';

import { useRouter } from 'expo-router';

export default function CustomerHome() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/api/products');
      return response.data;
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</Text>
          <Text style={styles.subGreeting}>What fresh seafood are you looking for today?</Text>
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fresh Arrivals</Text>
          {isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 10, color: Colors.textSecondary }}>
                Connecting to: {apiClient.defaults.baseURL}
              </Text>
            </View>
          ) : error ? (
            <View style={{ padding: 20 }}>
              <Text style={{ color: Colors.error, fontWeight: 'bold' }}>Failed to load products.</Text>
              <Text style={{ color: Colors.textSecondary, marginTop: 5 }}>
                URL: {apiClient.defaults.baseURL}
              </Text>
              <Text style={{ color: Colors.error, marginTop: 5 }}>
                Error: {error instanceof Error ? error.message : String(error)}
              </Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard 
                  product={item} 
                  onPress={() => router.push(`/(customer)/product/${item.id}`)} 
                />
              )}
              contentContainerStyle={styles.productList}
            />
          )}
        </View>

        {/* Categories Section (Placeholder for now) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoryPlaceholder}>
            <Text style={{ color: Colors.textSecondary }}>Categories coming soon...</Text>
          </View>
        </View>

      </ScrollView>
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
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: '#E0F2FE',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 20,
    marginBottom: 16,
  },
  productList: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  errorText: {
    color: Colors.error,
    marginLeft: 20,
  },
  categoryPlaceholder: {
    marginHorizontal: 20,
    padding: 30,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
