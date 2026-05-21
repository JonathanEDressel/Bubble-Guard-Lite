import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { BannerAd } from '@/components/BannerAd';
import { useBestScore, StoredStats } from '@/hooks/useBestScore';
import { useBubbleStore } from '@/store/useBubbleStore';

function formatFocusTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const EMPTY: StoredStats = {
  allTimeBest: 0,
  lastSessionCount: 0,
  lastSessionDate: '',
  totalSessions: 0,
  totalFocusMins: 0,
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { readAllStats, clearAll } = useBestScore();
  const storeAllTimeBest = useBubbleStore((s) => s.allTimeBest);
  const [stats, setStats] = useState<StoredStats>(EMPTY);

  async function load() {
    const s = await readAllStats();
    setStats(s);
  }

  // Reload stats every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  function confirmReset() {
    Alert.alert(
      'Reset all data?',
      'This will permanently clear your all-time best and all session history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            setStats(EMPTY);
          },
        },
      ]
    );
  }

  // Use in-memory allTimeBest if it's higher than stored (live session)
  const displayBest = Math.max(stats.allTimeBest, storeAllTimeBest);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <BannerAd />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
      <Text style={styles.heading}>Stats</Text>

      <View style={styles.card}>
        <StatRow label="All-Time Best" value={String(displayBest)} large />
        <StatRow label="Last Session Peak" value={String(stats.lastSessionCount)} />
        <StatRow label="Last Session" value={formatDate(stats.lastSessionDate)} />
        <StatRow label="Total Sessions" value={String(stats.totalSessions)} />
        <StatRow
          label="Total Focus Time"
          value={formatFocusTime(stats.totalFocusMins)}
          last
        />
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={confirmReset} activeOpacity={0.7}>
        <Text style={styles.resetText}>Clear All Data</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StatRow({
  label,
  value,
  large,
  last,
}: {
  label: string;
  value: string;
  large?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, large && styles.rowValueLarge]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EBF5FF',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E2A3A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 15,
    color: '#475569',
  },
  rowValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E2A3A',
  },
  rowValueLarge: {
    fontSize: 28,
    color: '#1a87c7',
  },
  resetBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FF4444',
  },
  resetText: {
    color: '#FF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
