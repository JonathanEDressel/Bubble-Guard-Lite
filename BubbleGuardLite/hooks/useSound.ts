import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_KEYS } from '@/constants/config';

export function useSound() {
  const growRef = useRef<Audio.Sound | null>(null);
  const popRef = useRef<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const mutedRef = useRef(false);

  // Load persisted mute preference
  useEffect(() => {
    AsyncStorage.getItem(ASYNC_KEYS.IS_MUTED)
      .then((val) => {
        if (val === 'true') {
          mutedRef.current = true;
          setIsMuted(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,   // play even when the iOS silent switch is on
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const [grow, pop] = await Promise.all([
        Audio.Sound.createAsync(
          require('@/assets/sounds/bubble_grow.wav'),
          { shouldPlay: false }
        ),
        Audio.Sound.createAsync(
          require('@/assets/sounds/bubble_pop.wav'),
          { shouldPlay: false }
        ),
      ]);

      if (mounted) {
        growRef.current = grow.sound;
        popRef.current = pop.sound;
      } else {
        await grow.sound.unloadAsync();
        await pop.sound.unloadAsync();
      }
    }

    load().catch((e) => {
      console.error('[useSound] Failed to load audio:', e);
    });

    return () => {
      mounted = false;
      growRef.current?.unloadAsync();
      popRef.current?.unloadAsync();
    };
  }, []);

  const toggleMute = useCallback(async () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    await AsyncStorage.setItem(ASYNC_KEYS.IS_MUTED, next ? 'true' : 'false');
  }, []);

  async function playGrow() {
    if (mutedRef.current) return;
    try {
      await growRef.current?.replayAsync();
    } catch {
      // Ignore — file missing or device muted
    }
  }

  async function playPop() {
    if (mutedRef.current) return;
    try {
      await popRef.current?.replayAsync();
    } catch {
      // Ignore
    }
  }

  return { playGrow, playPop, isMuted, toggleMute };
}
