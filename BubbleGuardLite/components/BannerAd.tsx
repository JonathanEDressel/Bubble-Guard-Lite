import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BANNER_HEIGHT } from '@/constants/config';

/**
 * Expo Go–compatible banner stub.
 * Renders a placeholder view with the same height as a real AdMob adaptive banner.
 *
 * TODO (production build): Replace this component with the real AdMob banner:
 *   1. npx expo install react-native-google-mobile-ads
 *   2. Add plugin to app.json: ["react-native-google-mobile-ads", { "iosAppId": "..." }]
 *   3. Import BannerAd, BannerAdSize from react-native-google-mobile-ads
 *   4. Replace the View below with <BannerAd adUnitId={ADMOB_BANNER_ID} size={BannerAdSize.ADAPTIVE_BANNER} />
 */
export function BannerAd() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Advertisement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    backgroundColor: '#12122a',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a4a',
  },
  text: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
});
