import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ASYNC_KEYS } from '../constants/config';

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem(ASYNC_KEYS.HAS_SEEN_ONBOARDING);
        router.replace(val ? '/(tabs)' : '/onboarding');
      } finally {
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  // Transparent hold — splash screen covers this while the check runs
  return <View style={{ flex: 1 }} />;
}
