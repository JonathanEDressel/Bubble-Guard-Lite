import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useBubbleStore } from '@/store/useBubbleStore';

export function BubbleCount() {
  const count = useBubbleStore((s) => s.bubbles.length);
  const best = useBubbleStore((s) => s.allTimeBest);
  const isNewBest = count > 0 && count >= best;

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isNewBest) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isNewBest]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.badge}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>bubbles</Text>
      </View>
      {isNewBest && (
        <Animated.View style={[styles.bestBadge, pulseStyle]}>
          <Text style={styles.bestText}>New Best!</Text>
        </Animated.View>
      )}
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
  bestBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
  },
});
