import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography, shadows } from '../../src/constants/theme';

export default function ContactScreen() {
  const router = useRouter();

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Get in touch with us! Our customer service team is ready to help you with any questions.
        </Text>

        <TouchableOpacity style={styles.contactCard} onPress={() => handleOpenUrl('tel:+919500829167')}>
          <View style={styles.iconContainer}><Ionicons name="call" size={24} color="#166534" /></View>
          <View>
            <Text style={styles.cardTitle}>Call Us</Text>
            <Text style={styles.cardDesc}>+91 9500829167</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={() => handleOpenUrl('mailto:carenhsalem@gmail.com')}>
          <View style={styles.iconContainer}><Ionicons name="mail" size={24} color="#166534" /></View>
          <View>
            <Text style={styles.cardTitle}>Email Us</Text>
            <Text style={styles.cardDesc}>carenhsalem@gmail.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={() => handleOpenUrl('https://wa.me/919500829167')}>
          <View style={styles.iconContainer}><Ionicons name="logo-whatsapp" size={24} color="#166534" /></View>
          <View>
            <Text style={styles.cardTitle}>WhatsApp</Text>
            <Text style={styles.cardDesc}>+91 9500829167</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={() => handleOpenUrl('https://www.nhsalem.com')}>
          <View style={styles.iconContainer}><Ionicons name="globe-outline" size={24} color="#166534" /></View>
          <View>
            <Text style={styles.cardTitle}>Visit Website</Text>
            <Text style={styles.cardDesc}>www.nhsalem.com</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border
  },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.sm },
  headerTitle: { ...typography.h3, flex: 1 },
  content: { padding: Spacing.md },
  description: { ...typography.body, marginBottom: Spacing.xl },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: Spacing.lg, borderRadius: 12, marginBottom: Spacing.md, ...shadows.sm
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md
  },
  cardTitle: { ...typography.h3, fontSize: 16 },
  cardDesc: { ...typography.body, color: Colors.textSecondary },
});
