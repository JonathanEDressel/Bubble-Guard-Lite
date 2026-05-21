import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { BannerAd } from '@/components/BannerAd';
import { BubbleCanvas } from '@/components/BubbleCanvas';
import { BubbleCount } from '@/components/BubbleCount';
import { useBubbleEngine } from '@/hooks/useBubbleEngine';
import { useBestScore } from '@/hooks/useBestScore';
import { useSound } from '@/hooks/useSound';
import { BANNER_HEIGHT } from '@/constants/config';

export default function BubbleScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const canvasCx = width / 2;
  const canvasCy = (height - insets.top - insets.bottom - BANNER_HEIGHT - 49) / 2;

  const { writeSessionEnd } = useBestScore();
  const { playGrow, playPop } = useSound();

  const handleSpawn = useCallback(() => {
    playGrow();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [playGrow]);

  const handlePop = useCallback(() => {
    playPop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [playPop]);

  const handleSessionEnd = useCallback(
    async (peakCount: number, durationMs: number) => {
      await writeSessionEnd(peakCount, durationMs);
    },
    [writeSessionEnd]
  );

  const { resetManual } = useBubbleEngine({
    canvasCx,
    canvasCy,
    onSessionEnd: handleSessionEnd,
    onSpawn: handleSpawn,
    onPop: handlePop,
  });

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <BannerAd />
      </View>
      <View style={styles.canvas}>
        <BubbleCanvas />
        <BubbleCount />
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={resetManual}
          activeOpacity={0.7}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  canvas: {
    flex: 1,
  },
  resetBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
