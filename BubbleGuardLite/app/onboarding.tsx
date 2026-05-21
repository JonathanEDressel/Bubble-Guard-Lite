import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { ASYNC_KEYS } from '../constants/config';

const { width: W, height: H } = Dimensions.get('window');
const ILLUS_H = H * 0.44;

// ── Bubble SVG helper ─────────────────────────────────────────────────────────

type BProps = { cx: number; cy: number; r: number; fill: string; stroke: string };
function B({ cx, cy, r, fill, stroke }: BProps) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={r > 30 ? 2 : 1.5} />
      <Circle cx={cx - r * 0.28} cy={cy - r * 0.28} r={r * 0.18} fill="rgba(255,255,255,0.68)" />
    </G>
  );
}

// ── Per-slide illustrations ───────────────────────────────────────────────────

function IllusSvg({ children }: { children: React.ReactNode }) {
  return <Svg width={W} height={ILLUS_H}>{children}</Svg>;
}

function Illus0() {
  return (
    <IllusSvg>
      <B cx={W*0.50} cy={ILLUS_H*0.60} r={68} fill="rgba(45,156,219,0.75)"  stroke="#1a87c7" />
      <B cx={W*0.20} cy={ILLUS_H*0.38} r={44} fill="rgba(155,81,224,0.72)"  stroke="#8b3db4" />
      <B cx={W*0.80} cy={ILLUS_H*0.44} r={38} fill="rgba(39,174,96,0.72)"   stroke="#1d8f50" />
      <B cx={W*0.13} cy={ILLUS_H*0.74} r={24} fill="rgba(242,153,74,0.72)"  stroke="#d4820e" />
      <B cx={W*0.86} cy={ILLUS_H*0.20} r={22} fill="rgba(235,87,87,0.72)"   stroke="#c83030" />
      <B cx={W*0.62} cy={ILLUS_H*0.22} r={18} fill="rgba(45,156,219,0.58)"  stroke="#1a87c7" />
    </IllusSvg>
  );
}

function Illus1() {
  return (
    <IllusSvg>
      {/* Growing side — bright, solid */}
      <B cx={W*0.22} cy={ILLUS_H*0.58} r={52} fill="rgba(155,81,224,0.78)" stroke="#8b3db4" />
      <B cx={W*0.40} cy={ILLUS_H*0.36} r={32} fill="rgba(45,156,219,0.75)" stroke="#1a87c7" />
      <B cx={W*0.12} cy={ILLUS_H*0.26} r={20} fill="rgba(39,174,96,0.72)"  stroke="#1d8f50" />
      {/* Arrow */}
      <Path d={`M ${W*0.53} ${ILLUS_H*0.50} L ${W*0.64} ${ILLUS_H*0.50}`}
        stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" />
      <Path d={`M ${W*0.60} ${ILLUS_H*0.43} L ${W*0.665} ${ILLUS_H*0.50} L ${W*0.60} ${ILLUS_H*0.57}`}
        stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Popping side — dashed, faded */}
      <Circle cx={W*0.78} cy={ILLUS_H*0.50} r={42}
        fill="rgba(155,81,224,0.13)" stroke="rgba(155,81,224,0.38)"
        strokeWidth={1.5} strokeDasharray="5,4" />
      <Circle cx={W*0.88} cy={ILLUS_H*0.27} r={22}
        fill="rgba(45,156,219,0.12)" stroke="rgba(45,156,219,0.32)"
        strokeWidth={1.5} strokeDasharray="4,3" />
      <Circle cx={W*0.68} cy={ILLUS_H*0.28} r={16}
        fill="rgba(39,174,96,0.12)" stroke="rgba(39,174,96,0.30)"
        strokeWidth={1.5} strokeDasharray="3,3" />
    </IllusSvg>
  );
}

function Illus2() {
  const px = W * 0.5, py = ILLUS_H * 0.52;
  const pw = 80, ph = 130;
  return (
    <IllusSvg>
      {/* Phone body */}
      <Rect x={px - pw/2} y={py - ph/2} width={pw} height={ph}
        rx={14} fill="rgba(30,42,58,0.07)" stroke="#334155" strokeWidth={2.5} />
      {/* Screen */}
      <Rect x={px - pw/2 + 7} y={py - ph/2 + 16} width={pw - 14} height={ph - 32}
        rx={8} fill="rgba(30,42,58,0.05)" stroke="#94A3B8" strokeWidth={1} />
      {/* Notification dots */}
      <Circle cx={px - 16} cy={py - 8} r={6} fill="rgba(235,87,87,0.90)" />
      <Circle cx={px}      cy={py - 8} r={6} fill="rgba(242,153,74,0.90)" />
      <Circle cx={px + 16} cy={py - 8} r={6} fill="rgba(45,156,219,0.90)" />
      {/* Orbiting disruption bubbles */}
      <B cx={W*0.14} cy={ILLUS_H*0.28} r={28} fill="rgba(235,87,87,0.72)"  stroke="#c83030" />
      <B cx={W*0.86} cy={ILLUS_H*0.28} r={24} fill="rgba(242,153,74,0.72)" stroke="#d4820e" />
      <B cx={W*0.18} cy={ILLUS_H*0.76} r={20} fill="rgba(155,81,224,0.68)" stroke="#8b3db4" />
      <B cx={W*0.82} cy={ILLUS_H*0.76} r={22} fill="rgba(45,156,219,0.68)" stroke="#1a87c7" />
    </IllusSvg>
  );
}

function Illus3() {
  const baseY = ILLUS_H * 0.88;
  const barW = 40;
  const bars = [
    { x: W*0.28, h: ILLUS_H*0.36, fill: 'rgba(45,156,219,0.75)',  stroke: '#1a87c7' },
    { x: W*0.50, h: ILLUS_H*0.58, fill: 'rgba(155,81,224,0.75)',  stroke: '#8b3db4' },
    { x: W*0.72, h: ILLUS_H*0.44, fill: 'rgba(39,174,96,0.75)',   stroke: '#1d8f50' },
  ];
  return (
    <IllusSvg>
      {bars.map((b, i) => (
        <G key={i}>
          <Rect x={b.x - barW/2} y={baseY - b.h} width={barW} height={b.h}
            rx={10} fill={b.fill} stroke={b.stroke} strokeWidth={1.5} />
          <B cx={b.x} cy={baseY - b.h - 22} r={20} fill={b.fill} stroke={b.stroke} />
        </G>
      ))}
    </IllusSvg>
  );
}

function Illus4() {
  const cx = W * 0.5, cy = ILLUS_H * 0.54;
  return (
    <IllusSvg>
      <Circle cx={cx} cy={cy} r={96}
        fill="rgba(45,156,219,0.05)" stroke="rgba(45,156,219,0.18)" strokeWidth={1.5} />
      <Circle cx={cx} cy={cy} r={70}
        fill="rgba(45,156,219,0.09)" stroke="rgba(45,156,219,0.30)" strokeWidth={1.5} />
      <B cx={cx}     cy={cy}          r={50} fill="rgba(45,156,219,0.80)"  stroke="#1a87c7" />
      <B cx={W*0.18} cy={ILLUS_H*0.22} r={28} fill="rgba(155,81,224,0.72)" stroke="#8b3db4" />
      <B cx={W*0.82} cy={ILLUS_H*0.76} r={24} fill="rgba(39,174,96,0.72)"  stroke="#1d8f50" />
      <B cx={W*0.12} cy={ILLUS_H*0.70} r={18} fill="rgba(242,153,74,0.72)" stroke="#d4820e" />
      <B cx={W*0.88} cy={ILLUS_H*0.30} r={20} fill="rgba(235,87,87,0.70)"  stroke="#c83030" />
    </IllusSvg>
  );
}

const ILLUSTRATIONS = [Illus0, Illus1, Illus2, Illus3, Illus4];

// ── Slide data ────────────────────────────────────────────────────────────────

type Slide = {
  key: string;
  icon: string;
  title: string;
  body: string;
  accent: string;
  bgColor: string;
};

const SLIDES: Slide[] = [
  {
    key: 's1',
    icon: '🫧',
    title: 'Welcome to\nBubbleGuard',
    body: 'Train your focus.\nTame your phone.',
    accent: '#1a87c7',
    bgColor: '#EBF5FF',
  },
  {
    key: 's2',
    icon: '💡',
    title: 'How It Works',
    body: 'Stay in the app and a new bubble grows every few seconds.\n\nLeave and your bubbles start popping. Grow as many as you can.',
    accent: '#8b3db4',
    bgColor: '#F3EBFF',
  },
  {
    key: 's3',
    icon: '📵',
    title: 'Why It Matters',
    body: 'The average person checks their phone 96 times a day.\n\nConstant interruptions fragment attention and raise stress. Small focus sessions build lasting habits.',
    accent: '#1d8f50',
    bgColor: '#EBFFF4',
  },
  {
    key: 's4',
    icon: '📈',
    title: 'Track Your\nProgress',
    body: 'BubbleGuard tracks your all-time best, total focus time, and session history.\n\nChallenge yourself to beat your record.',
    accent: '#d4820e',
    bgColor: '#FFF4EB',
  },
  {
    key: 's5',
    icon: '✨',
    title: "You're Ready",
    body: 'Put the phone down.\nStay present.\nGrow.',
    accent: '#1a87c7',
    bgColor: '#EBF5FF',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function completeOnboarding() {
  await AsyncStorage.setItem(ASYNC_KEYS.HAS_SEEN_ONBOARDING, '1');
  router.replace('/(tabs)');
}

// ── SlideItem ─────────────────────────────────────────────────────────────────

function SlideItem({ slide, index }: { slide: Slide; index: number }) {
  const Illus = ILLUSTRATIONS[index];
  return (
    <View style={[styles.slide, { width: W, backgroundColor: slide.bgColor }]}>
      <View style={styles.illusArea}>
        <Illus />
      </View>
      <View style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: slide.accent + '1A' }]}>
          <Text style={styles.iconEmoji}>{slide.icon}</Text>
        </View>
        <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const flatRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  function goNext() {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }

  function skipToLast() {
    flatRef.current?.scrollToIndex({ index: SLIDES.length - 1, animated: true });
  }

  const isLast = activeIndex === SLIDES.length - 1;
  const accent = SLIDES[activeIndex].accent;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {!isLast && (
        <Pressable
          style={styles.skipBtn}
          onPress={skipToLast}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => <SlideItem slide={item} index={index} />}
        getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
      />

      <View style={styles.bottomBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex
                  ? [styles.dotActive, { backgroundColor: accent }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {isLast ? (
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: accent },
              pressed && styles.ctaPressed,
            ]}
            onPress={completeOnboarding}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              { borderColor: accent },
              pressed && styles.nextPressed,
            ]}
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel="Next slide"
          >
            <Text style={[styles.nextText, { color: accent }]}>Next →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STATUS_BAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FF',
  },
  slide: {
    height: H,
  },
  illusArea: {
    height: ILLUS_H,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 140,
    alignItems: 'center',
    shadowColor: '#1E2A3A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  skipBtn: {
    position: 'absolute',
    top: STATUS_BAR_H + 14,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  ctaButton: {
    paddingHorizontal: 52,
    paddingVertical: 15,
    borderRadius: 32,
  },
  ctaPressed: {
    opacity: 0.82,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  nextButton: {
    borderWidth: 1.5,
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  nextPressed: {
    opacity: 0.72,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
