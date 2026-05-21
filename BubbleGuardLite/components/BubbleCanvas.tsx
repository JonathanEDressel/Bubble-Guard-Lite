import React, { useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Svg from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BANNER_HEIGHT, BUBBLE_RADIUS } from '@/constants/config';
import { useBubbleStore } from '@/store/useBubbleStore';
import { BubbleNode } from './BubbleNode';

const PAD = BUBBLE_RADIUS * 2;

function computeViewBox(
  bubbles: ReturnType<typeof useBubbleStore.getState>['bubbles'],
  fallbackW: number,
  fallbackH: number
): string {
  if (bubbles.length === 0) {
    return `${-fallbackW / 2} ${-fallbackH / 2} ${fallbackW} ${fallbackH}`;
  }
  const xs = bubbles.map((b) => b.cx);
  const ys = bubbles.map((b) => b.cy);
  const minX = Math.min(...xs) - PAD;
  const maxX = Math.max(...xs) + PAD;
  const minY = Math.min(...ys) - PAD;
  const maxY = Math.max(...ys) + PAD;
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
}

export function BubbleCanvas() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bubbles = useBubbleStore((s) => s.bubbles);

  // Track which bubble ids are newly spawned so BubbleNode plays spawn anim
  const prevIdsRef = useRef<Set<number>>(new Set());
  const newIds = useMemo(() => {
    const current = new Set(bubbles.map((b) => b.id));
    const spawned = new Set([...current].filter((id) => !prevIdsRef.current.has(id)));
    prevIdsRef.current = current;
    return spawned;
  }, [bubbles]);

  const canvasHeight =
    height - insets.top - insets.bottom - BANNER_HEIGHT - 49; // 49 = tab bar height

  const viewBox = useMemo(
    () => computeViewBox(bubbles, width, canvasHeight),
    [bubbles, width, canvasHeight]
  );

  return (
    <Svg
      width={width}
      height={canvasHeight}
      viewBox={viewBox}
      style={{ backgroundColor: 'transparent' }}
    >
      {bubbles.map((bubble) => (
        <BubbleNode
          key={bubble.id}
          bubble={bubble}
          spawning={newIds.has(bubble.id)}
        />
      ))}
    </Svg>
  );
}
