import React, { useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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

  const canvasW = width;
  const canvasH = height - insets.top - insets.bottom - BANNER_HEIGHT - 49;
  const canvasCx = canvasW / 2;
  const canvasCy = canvasH / 2;

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
    canvasW,
    canvasH,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  canvas: {
    flex: 1,
  },
});
