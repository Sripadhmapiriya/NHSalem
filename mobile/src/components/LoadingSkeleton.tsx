import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTextTitle} />
      <View style={styles.skeletonTextDesc} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonTextTitle: {
    width: '60%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTextDesc: {
    width: '40%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});
