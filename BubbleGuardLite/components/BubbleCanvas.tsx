import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BANNER_HEIGHT } from '@/constants/config';
import { useBubbleStore } from '@/store/useBubbleStore';
import { BubbleNode } from './BubbleNode';

export function BubbleCanvas() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bubbles = useBubbleStore((s) => s.bubbles);

  const canvasHeight =
    height - insets.top - insets.bottom - BANNER_HEIGHT - 49;

  return (
    <Svg
      width={width}
      height={canvasHeight}
      viewBox={`0 0 ${width} ${canvasHeight}`}
    >
      <Defs>
        {/*
         * Soap bubble body: radial gradient offset upper-left to simulate
         * light hitting the translucent sphere. objectBoundingBox so it
         * scales correctly with every bubble's own bounding box.
         */}
        <RadialGradient
          id="bubbleBody"
          cx="0.38"
          cy="0.32"
          r="0.7"
          fx="0.38"
          fy="0.32"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.92} />
          <Stop offset="22%"  stopColor="#f8bbd0" stopOpacity={0.62} />
          <Stop offset="55%"  stopColor="#ce93d8" stopOpacity={0.52} />
          <Stop offset="100%" stopColor="#90caf9" stopOpacity={0.58} />
        </RadialGradient>

        {/*
         * Iridescent rim: diagonal linear gradient — pink → lavender → sky blue
         * — mimics the surface-tension rainbow on a real soap bubble edge.
         */}
        <LinearGradient
          id="bubbleRim"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0%"   stopColor="#f48fb1" stopOpacity={0.95} />
          <Stop offset="33%"  stopColor="#ce93d8" stopOpacity={0.95} />
          <Stop offset="66%"  stopColor="#81d4fa" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#f48fb1" stopOpacity={0.95} />
        </LinearGradient>
      </Defs>

      {bubbles.map((bubble) => (
        <BubbleNode key={bubble.id} bubble={bubble} />
      ))}
    </Svg>
  );
}

