import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Categories</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  }
});
