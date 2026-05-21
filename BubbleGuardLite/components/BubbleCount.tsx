import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBubbleStore } from '@/store/useBubbleStore';

interface Props {
  isMuted: boolean;
  onToggleMute: () => void;
}

export function BubbleCount({ isMuted, onToggleMute }: Props) {
  const count = useBubbleStore((s) => s.bubbles.length);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.badge}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>bubbles</Text>
      </View>
      <TouchableOpacity
        style={styles.muteBtn}
        onPress={onToggleMute}
        activeOpacity={0.75}
        accessibilityLabel={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        accessibilityRole="button"
      >
        <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#1E2A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  count: {
    color: '#1a87c7',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  label: {
    color: '#475569',
    fontSize: 11,
  },
  muteBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E2A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  muteIcon: {
    fontSize: 20,
  },
});
