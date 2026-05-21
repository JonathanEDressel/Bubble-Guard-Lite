import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
  const growRef = useRef<Audio.Sound | null>(null);
  const popRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });

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

    load().catch(() => {
      // Sound files not yet present; fail silently so the app still runs
    });

    return () => {
      mounted = false;
      growRef.current?.unloadAsync();
      popRef.current?.unloadAsync();
    };
  }, []);

  async function playGrow() {
    try {
      await growRef.current?.replayAsync();
    } catch {
      // Ignore — file missing or device muted
    }
  }

  async function playPop() {
    try {
      await popRef.current?.replayAsync();
    } catch {
      // Ignore
    }
  }

  return { playGrow, playPop };
}
