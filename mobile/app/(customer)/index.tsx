import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, FlatList,
  RefreshControl, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '../../src/api/client';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';

import {
  COLORS, SPACING, RADIUS, SHADOWS, globalStyles,
  SCREEN_WIDTH
} from '../../src/styles/global';

// ==========================================
// 1. HEADER COMPONENT
// ==========================================
const Header = ({ router }: any) => (
  <View style={{
    backgroundColor: COLORS.navy,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  }}>
    {/* Row 1: Logo + Brand + Notification */}
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    }}>
      <View style={{
        width: 44, height: 44,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}>
        <Text style={{ color: COLORS.surface, fontWeight: '900', fontSize: 16 }}>NH</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{
          color: COLORS.surface, fontWeight: '800', fontSize: 18,
          letterSpacing: 0.3,
        }}>NH Salem Sea Foods</Text>
        <Text style={{
          color: COLORS.primaryLight, fontSize: 11, marginTop: 1,
        }}>Fresh from the Sea 🐟</Text>
      </View>

      <TouchableOpacity style={{
        width: 38, height: 38,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name="notifications-outline" size={20} color={COLORS.surface} />
      </TouchableOpacity>
    </View>

    {/* Row 2: Location */}
    <TouchableOpacity style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    }}>
      <Ionicons name="location-outline" size={14} color={COLORS.primaryLight} />
      <Text style={{
        color: COLORS.border, fontSize: 12, marginLeft: SPACING.xs,
      }}>Delivering to Salem, Tamil Nadu</Text>
      <Ionicons name="chevron-down-outline" size={12} 
                color={COLORS.primaryLight} style={{ marginLeft: SPACING.xs }} />
    </TouchableOpacity>

    {/* Row 3: Search bar */}
    <TouchableOpacity
      onPress={() => router.push('/search')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        paddingHorizontal: 14,
        paddingVertical: 11,
        gap: SPACING.sm,
      }}
    >
      <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
      <Text style={{ color: COLORS.textLight, fontSize: 14, flex: 1 }}>
        Search for seafood...
      </Text>
      <View style={{
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.sm,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
      }}>
        <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>Search</Text>
      </View>
    </TouchableOpacity>
  </View>
);

// ==========================================
// 2. PROMO BANNER COMPONENT
// ==========================================
const promoBanners = [
  { id: '1', tag: 'WELCOME OFFER', title: '₹200 off your first order', subtitle: 'Use code at checkout', code: 'WELCOME200', bg: COLORS.primary, tagColor: COLORS.primaryLight },
  { id: '2', tag: 'FLASH SALE', title: '20% off all Fish today', subtitle: 'Limited time offer', code: 'FISH20', bg: '#1e3a5f', tagColor: '#93c5fd' },
  { id: '3', tag: 'FREE DELIVERY', title: 'Free delivery above ₹499', subtitle: 'On all orders today', code: 'FREEFISH', bg: '#7c3aed', tagColor: '#c4b5fd' },
];

const PromoBanner = () => {
  const bannerRef = useRef<FlatList>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeBanner + 1) % promoBanners.length;
      setActiveBanner(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeBanner]);

  return (
    <View style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.md }}>
      <FlatList
        ref={bannerRef}
        data={promoBanners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
          setActiveBanner(index);
        }}
        renderItem={({ item: banner }) => (
          <View style={{
            width: SCREEN_WIDTH - 32,
            backgroundColor: banner.bg,
            borderRadius: RADIUS.lg,
            padding: SPACING.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 90,
            maxHeight: 110,
          }}>
            <View style={{ flex: 1 }}>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: RADIUS.sm,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 3,
                alignSelf: 'flex-start',
                marginBottom: 6,
              }}>
                <Text style={{
                  color: banner.tagColor, fontSize: 9, fontWeight: '700', letterSpacing: 1,
                }}>{banner.tag}</Text>
              </View>
              <Text style={{
                color: COLORS.surface, fontSize: 16, fontWeight: '800', lineHeight: 20, marginBottom: 4,
              }}>{banner.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {banner.subtitle}
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: RADIUS.sm,
              paddingHorizontal: 10,
              paddingVertical: 6,
              marginLeft: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              borderStyle: 'dashed',
            }}>
              <Text style={{ color: COLORS.surface, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
                {banner.code}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm, gap: 4 }}>
        {promoBanners.map((_, i) => (
          <View key={i} style={{
            width: activeBanner === i ? 20 : 6,
            height: 6,
            borderRadius: RADIUS.sm,
            backgroundColor: activeBanner === i ? COLORS.primary : COLORS.border,
          }} />
        ))}
      </View>
    </View>
  );
};

// ==========================================
// 3. CATEGORY CHIPS
// ==========================================
const categoriesData = [
  { id: 'all',          label: 'All',      emoji: '🌊', color: COLORS.navy },
  { id: 'fish',         label: 'Fish',     emoji: '🐟', color: '#1e40af' },
  { id: 'prawns-shrimp',label: 'Prawns',   emoji: '🦐', color: COLORS.primary },
  { id: 'crabs',        label: 'Crabs',    emoji: '🦀', color: '#9f1239' },
  { id: 'lobster',      label: 'Lobster',  emoji: '🦞', color: '#92400e' },
  { id: 'dry-fish',     label: 'Dried',    emoji: '🐠', color: '#7c3aed' },
  { id: 'combos',       label: 'Combos',   emoji: '🎁', color: '#0e7490' },
];

const CategoryChips = ({ selected, onSelect }: any) => (
  <FlatList
    horizontal
    showsHorizontalScrollIndicator={false}
    data={categoriesData}
    keyExtractor={item => item.id}
    contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm }}
    renderItem={({ item: cat }) => (
      <TouchableOpacity
        onPress={() => onSelect(cat.id)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: selected === cat.id ? cat.color : COLORS.background,
          borderRadius: RADIUS.xl,
          paddingHorizontal: 14,
          paddingVertical: SPACING.sm,
          gap: 6,
          borderWidth: 1.5,
          borderColor: selected === cat.id ? cat.color : COLORS.border,
        }}
      >
        <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          color: selected === cat.id ? COLORS.surface : COLORS.text,
        }}>{cat.label}</Text>
      </TouchableOpacity>
    )}
  />
);

// ==========================================
// 4. PRODUCT CARDS
// ==========================================
const HorizontalProductCard = ({ product, onPress, onAdd }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
    elevation: 3,
  }}>
    <View style={{ position: 'relative' }}>
      <Image
        source={{ uri: product.image_url || product.image || 'https://placehold.co/300x300/e2e8f0/94a3b8?text=NH+Salem' }}
        style={{ width: 160, height: 130, resizeMode: 'cover' }}
      />
      {product.is_fresh_today && (
        <View style={{ position: 'absolute', top: SPACING.sm, left: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ color: COLORS.surface, fontSize: 9, fontWeight: '700' }}>🌿 FRESH</Text>
        </View>
      )}
      {product.is_premium && (
        <View style={{ position: 'absolute', top: SPACING.sm, right: SPACING.sm, backgroundColor: '#7c3aed', borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ color: COLORS.surface, fontSize: 9, fontWeight: '700' }}>👑 PREMIUM</Text>
        </View>
      )}
    </View>
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.primary, letterSpacing: 0.5, marginBottom: 3 }} numberOfLines={1}>
        {product.category?.replace('-', ' ').toUpperCase()}
      </Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, lineHeight: 17, marginBottom: 6 }} numberOfLines={2}>
        {product.name}
      </Text>
      {product.rating > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Ionicons name="star" size={11} color={COLORS.warning} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#92400e', marginLeft: 3 }}>{product.rating}</Text>
          <Text style={{ fontSize: 11, color: COLORS.textLight, marginLeft: 2 }}>({product.review_count || product.reviewCount})</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontWeight: '900', color: COLORS.primary }}>₹{product.base_price || product.basePrice}</Text>
        <TouchableOpacity style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} onPress={() => onAdd(product)}>
          <Ionicons name="add" size={18} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const GridProductCard = ({ product, onPress, onAdd }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    margin: 6,
    overflow: 'hidden',
    ...SHADOWS.sm,
    elevation: 2,
  }}>
    <View style={{ position: 'relative', width: '100%', aspectRatio: 1 }}>
      <Image
        source={{ uri: product.image_url || product.image || 'https://placehold.co/300x300/e2e8f0/94a3b8?text=NH+Salem' }}
        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
      />
      {product.is_fresh_today && (
        <View style={{ position: 'absolute', top: SPACING.sm, left: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Text style={{ color: COLORS.surface, fontSize: 9, fontWeight: '700' }}>🌿 FRESH</Text>
        </View>
      )}
    </View>
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 }} numberOfLines={1}>
        {product.category?.replace('-', ' ').toUpperCase()}
      </Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, lineHeight: 17, marginBottom: 4 }} numberOfLines={2}>
        {product.name}
      </Text>
      {product.rating > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="star" size={11} color={COLORS.warning} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#92400e', marginLeft: 2 }}>{product.rating}</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: COLORS.primary }}>₹{product.base_price || product.basePrice}</Text>
        <TouchableOpacity style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }} onPress={(e) => { e.stopPropagation(); onAdd(product); }}>
          <Ionicons name="add" size={18} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// ==========================================
// 5. SECTIONS & EXTRA COMPONENTS
// ==========================================
const SectionHeader = ({ title, onSeeAll }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text }}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>See All →</Text>
      </TouchableOpacity>
    )}
  </View>
);



const DeliveryInfoSection = () => (
  <View style={{
    marginHorizontal: SPACING.lg, marginVertical: SPACING.md, backgroundColor: '#f0fdf4',
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: '#bbf7d0', padding: SPACING.lg,
  }}>
    <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'center', marginBottom: SPACING.lg }}>🚚 Our Delivery Promise</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      {[
        { value: '2hr', label: 'Express\nDelivery', icon: '⚡' },
        { value: '95%', label: 'Freshness\nScore',   icon: '🌿' },
        { value: '500+', label: 'Happy\nCustomers',  icon: '😊' },
      ].map((stat) => (
        <View key={stat.value} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.primary }}>{stat.value}</Text>
          <Text style={{ fontSize: 11, color: '#4ade80', textAlign: 'center', lineHeight: 15 }}>{stat.label}</Text>
        </View>
      ))}
    </View>
  </View>
);



const ProductGridSkeleton = () => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 }}>
    {[1,2,3,4,5,6].map(i => (
      <View key={i} style={{ width: '50%', padding: 6 }}>
        <View style={{ backgroundColor: COLORS.background, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
          <View style={{ width: '100%', aspectRatio: 1, backgroundColor: COLORS.border }} />
          <View style={{ padding: 10, gap: 6 }}>
            <View style={{ height: 10, backgroundColor: COLORS.border, borderRadius: 5, width: '60%' }} />
            <View style={{ height: 13, backgroundColor: COLORS.border, borderRadius: 5, width: '90%' }} />
            <View style={{ height: 13, backgroundColor: COLORS.border, borderRadius: 5, width: '70%' }} />
            <View style={{ height: 16, backgroundColor: COLORS.border, borderRadius: 5, width: '40%' }} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

const EmptyState = ({ emoji, title, subtitle, action, onAction }: any) => (
  <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
    <Text style={{ fontSize: 56, marginBottom: SPACING.lg }}>{emoji}</Text>
    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' }}>{title}</Text>
    <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>
    {action && onAction && (
      <TouchableOpacity onPress={onAction} style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 24, paddingVertical: 12, marginTop: SPACING.lg }}>
        <Text style={{ color: COLORS.surface, fontWeight: '700' }}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ==========================================
// MAIN SCREEN
// ==========================================
export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [freshProducts, setFreshProducts] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const fetchAllData = async () => {
    try {
      const [allRes, popularRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/products?sort=rating`),
      ]);
      const [all, popular] = await Promise.all([
        allRes.json(),
        popularRes.json(),
      ]);
      
      const parsedAll = Array.isArray(all) ? all : [];
      const parsedPop = Array.isArray(popular) ? popular : [];

      setAllProducts(parsedAll);
      setFilteredProducts(parsedAll);
      setFreshProducts(parsedAll.filter(p => p.is_fresh_today || p.badges?.some((b:any)=>b.type==='fresh')).slice(0, 10));
      setPopularProducts(parsedPop.slice(0, 10));
      setPremiumProducts(parsedAll.filter(p => p.is_premium || p.badges?.some((b:any)=>b.type==='premium')).slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter(p => p.category === categoryId || p.category?.includes(categoryId)));
    }
  };

  const handleAddToCart = (product: any) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    const variant = (product.variants && product.variants[0]) || { label: 'Standard', price: product.base_price || product.basePrice };
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image_url || product.image,
      price: variant.price,
      quantity: 1,
      variant: variant.label,
      weightLabel: variant.label
    });
  };

  return (
    <SafeAreaView style={globalStyles.screen} edges={['top']}>
      <Header router={router} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllData(); }} colors={[COLORS.primary]} />}
      >
        <PromoBanner />
        <CategoryChips selected={selectedCategory} onSelect={handleCategoryFilter} />

        {freshProducts.length > 0 && (
          <View style={globalStyles.section}>
            <SectionHeader title="Fresh Today 🐟" onSeeAll={() => handleCategoryFilter('all')} />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={freshProducts}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 4 }}
              renderItem={({ item }) => (
                <HorizontalProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} onAdd={handleAddToCart} />
              )}
            />
          </View>
        )}


        {popularProducts.length > 0 && (
          <View style={globalStyles.section}>
            <SectionHeader title="⭐ Most Popular" onSeeAll={() => handleCategoryFilter('all')} />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={popularProducts}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 4 }}
              renderItem={({ item }) => (
                <HorizontalProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} onAdd={handleAddToCart} />
              )}
            />
          </View>
        )}

        {premiumProducts.length > 0 && (
          <View style={globalStyles.section}>
            <SectionHeader title="👑 Premium Picks" onSeeAll={() => handleCategoryFilter('all')} />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={premiumProducts}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 4 }}
              renderItem={({ item }) => (
                <HorizontalProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} onAdd={handleAddToCart} />
              )}
            />
          </View>
        )}

        <DeliveryInfoSection />

        <View style={globalStyles.section}>
          <SectionHeader title={selectedCategory === 'all' ? `All Products (${filteredProducts.length})` : `${selectedCategory} (${filteredProducts.length})`} />
          
          {loading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length === 0 ? (
            <EmptyState emoji="🐟" title="No products found" subtitle="Try a different category" action="Clear Filters" onAction={() => handleCategoryFilter('all')} />
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false} // Since it's inside a ScrollView
              contentContainerStyle={{ paddingHorizontal: 10 }}
              renderItem={({ item }) => (
                <GridProductCard product={item} onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} onAdd={handleAddToCart} />
              )}
            />
          )}
        </View>


        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
