import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ProductProps {
  product: {
    id: string;
    name: string;
    basePrice: number;
    image?: string;
    images?: string[];
    category: string;
    rating?: number;
  };
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductProps) {
  const getImageUrl = () => {
    const img = product.image || product.images?.[0];
    if (!img) return 'https://via.placeholder.com/150';
    if (img.startsWith('/')) return `${process.env.EXPO_PUBLIC_API_URL}${img}`;
    return img;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image 
        source={{ uri: getImageUrl() }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{product.basePrice}</Text>
          <TouchableOpacity style={styles.addButton} onPress={onPress}>
            <Ionicons name="add" size={20} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginRight: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
