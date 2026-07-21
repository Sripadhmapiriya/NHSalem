import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function AuthGateModal() {
  const { authGateVisible, setAuthGateVisible } = useAuthStore();
  const router = useRouter();

  if (!authGateVisible) return null;

  const handleSignIn = () => {
    setAuthGateVisible(false);
    router.push({ pathname: '/(auth)/login', params: { mode: 'login' } });
  };

  const handleSignUp = () => {
    setAuthGateVisible(false);
    router.push({ pathname: '/(auth)/login', params: { mode: 'register' } });
  };

  const handleClose = () => {
    setAuthGateVisible(false);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={authGateVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="cart-outline" size={32} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Sign In Required</Text>
          <Text style={styles.description}>
            Create an account or sign in to save items to your cart, track deliveries, and subscribe.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSignUp}>
              <Text style={styles.secondaryBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeTextBtn} onPress={handleClose}>
            <Text style={styles.closeText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 5, 22, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(22, 101, 52, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  closeTextBtn: {
    paddingVertical: Spacing.xs,
  },
  closeText: {
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
});
