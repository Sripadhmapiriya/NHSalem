import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/theme';

export default function AdminHome() {
  const { logout, user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.admin.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.admin.primary,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 40,
    color: Colors.textSecondary,
  }
});
