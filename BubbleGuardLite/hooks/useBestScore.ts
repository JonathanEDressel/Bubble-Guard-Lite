import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { ASYNC_KEYS } from '@/constants/config';
import { useBubbleStore } from '@/store/useBubbleStore';

export interface StoredStats {
  allTimeBest: number;
  lastSessionCount: number;
  lastSessionDate: string;
  totalSessions: number;
  totalFocusMins: number;
}

export function useBestScore() {
  const hydrateAllTimeBest = useBubbleStore((s) => s.hydrateAllTimeBest);

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_KEYS.ALL_TIME_BEST).then((val) => {
      if (val !== null) hydrateAllTimeBest(Number(val));
    });
  }, []);

  async function readAllStats(): Promise<StoredStats> {
    const keys = [
      ASYNC_KEYS.ALL_TIME_BEST,
      ASYNC_KEYS.LAST_SESSION_COUNT,
      ASYNC_KEYS.LAST_SESSION_DATE,
      ASYNC_KEYS.TOTAL_SESSIONS,
      ASYNC_KEYS.TOTAL_FOCUS_MINS,
    ] as const;
    const pairs = await AsyncStorage.multiGet(keys);
    const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
    return {
      allTimeBest: Number(map[ASYNC_KEYS.ALL_TIME_BEST] ?? 0),
      lastSessionCount: Number(map[ASYNC_KEYS.LAST_SESSION_COUNT] ?? 0),
      lastSessionDate: map[ASYNC_KEYS.LAST_SESSION_DATE] ?? '',
      totalSessions: Number(map[ASYNC_KEYS.TOTAL_SESSIONS] ?? 0),
      totalFocusMins: Number(map[ASYNC_KEYS.TOTAL_FOCUS_MINS] ?? 0),
    };
  }

  async function writeSessionEnd(
    peakCount: number,
    sessionDurationMs: number
  ) {
    const existing = await readAllStats();
    const newBest = Math.max(existing.allTimeBest, peakCount);
    const addedMins = Math.floor(sessionDurationMs / 60000);
    const pairs: [string, string][] = [
      [ASYNC_KEYS.ALL_TIME_BEST, String(newBest)],
      [ASYNC_KEYS.LAST_SESSION_COUNT, String(peakCount)],
      [ASYNC_KEYS.LAST_SESSION_DATE, new Date().toISOString()],
      [ASYNC_KEYS.TOTAL_SESSIONS, String(existing.totalSessions + 1)],
      [
        ASYNC_KEYS.TOTAL_FOCUS_MINS,
        String(existing.totalFocusMins + addedMins),
      ],
    ];
    await AsyncStorage.multiSet(pairs);
  }

  async function clearAll() {
    await AsyncStorage.multiRemove(Object.values(ASYNC_KEYS));
    hydrateAllTimeBest(0);
  }

  return { readAllStats, writeSessionEnd, clearAll };
}
