import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useBubbleStore } from '@/store/useBubbleStore';

export function BubbleCount() {
  const count = useBubbleStore((s) => s.bubbles.length);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.badge}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>bubbles</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 16,
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  count: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
});
