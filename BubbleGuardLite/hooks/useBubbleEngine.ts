import { useEffect, useRef, useCallback } from 'react';
import { BUBBLE_PALETTE, BUBBLE_RADIUS, GROW_INTERVAL_MS, POP_INTERVAL_MS } from '@/constants/config';
import { Bubble, useBubbleStore } from '@/store/useBubbleStore';
import { useAppState } from './useAppState';

// ---------------------------------------------------------------------------
// Placement algorithm — pure function, no React deps
// ---------------------------------------------------------------------------
function randomColor(): string {
  return BUBBLE_PALETTE[Math.floor(Math.random() * BUBBLE_PALETTE.length)];
}

function findBubblePosition(
  existing: Bubble[],
  radius: number
): { cx: number; cy: number } {
  if (existing.length === 0) return { cx: 0, cy: 0 };

  const STEP = (15 * Math.PI) / 180;
  const ANGLES = 24; // 360° / 15°

  const noOverlap = (cx: number, cy: number) =>
    !existing.some(
      (b) => Math.sqrt((b.cx - cx) ** 2 + (b.cy - cy) ** 2) < b.radius + radius - 0.5
    );

  // Randomise both the starting angle and anchor order so bubbles form an
  // organic cluster instead of a straight line.
  const startAngle = Math.floor(Math.random() * ANGLES);
  const anchors = [...existing].sort(() => Math.random() - 0.5);

  for (let i = 0; i < ANGLES; i++) {
    const angle = ((startAngle + i) % ANGLES) * STEP;
    for (const anchor of anchors) {
      const dist = anchor.radius + radius;
      const cx = anchor.cx + Math.cos(angle) * dist;
      const cy = anchor.cy + Math.sin(angle) * dist;
      if (noOverlap(cx, cy)) return { cx, cy };
    }
  }

  // Fallback: place directly to the right of the last bubble
  const last = existing[existing.length - 1];
  return { cx: last.cx + last.radius + radius, cy: last.cy };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface UseBubbleEngineOptions {
  canvasCx: number;
  canvasCy: number;
  onSessionEnd: (peakCount: number, sessionDurationMs: number) => void;
  onSpawn?: () => void;
  onPop?: () => void;
}

export function useBubbleEngine({
  canvasCx,
  canvasCy,
  onSessionEnd,
  onSpawn,
  onPop,
}: UseBubbleEngineOptions) {
  const addBubble = useBubbleStore((s) => s.addBubble);
  const removeOldest = useBubbleStore((s) => s.removeOldest);
  const resetSession = useBubbleStore((s) => s.resetSession);
  const getBubbles = () => useBubbleStore.getState().bubbles;
  const getSessionPeak = () => useBubbleStore.getState().sessionPeak;
  const getSessionStartTime = () => useBubbleStore.getState().sessionStartTime;

  const isActive = useAppState();
  const growRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearGrow = useCallback(() => {
    if (growRef.current !== null) {
      clearInterval(growRef.current);
      growRef.current = null;
    }
  }, []);

  const clearPop = useCallback(() => {
    if (popRef.current !== null) {
      clearInterval(popRef.current);
      popRef.current = null;
    }
  }, []);

  const triggerSessionEnd = useCallback(() => {
    clearGrow();
    clearPop();
    const peak = getSessionPeak();
    const start = getSessionStartTime();
    const duration = start ? Date.now() - start : 0;
    onSessionEnd(peak, duration);

    // Restart after 1 second
    setTimeout(() => {
      resetSession({ cx: canvasCx, cy: canvasCy, radius: BUBBLE_RADIUS, color: randomColor() });
    }, 1000);
  }, [canvasCx, canvasCy, clearGrow, clearPop, onSessionEnd, resetSession]);

  // Mount: place initial bubble
  useEffect(() => {
    const bubbles = getBubbles();
    if (bubbles.length === 0) {
      addBubble({ cx: canvasCx, cy: canvasCy, radius: BUBBLE_RADIUS, color: randomColor() });
      useBubbleStore.setState({ sessionStartTime: Date.now() });
    }
  }, []);

  // React to foreground/background transitions
  useEffect(() => {
    if (isActive) {
      clearPop();
      growRef.current = setInterval(() => {
        const current = getBubbles();
        const pos = findBubblePosition(current, BUBBLE_RADIUS);
        addBubble({ ...pos, radius: BUBBLE_RADIUS, color: randomColor() });
        onSpawn?.();
      }, GROW_INTERVAL_MS);
    } else {
      clearGrow();
      popRef.current = setInterval(() => {
        const removed = removeOldest();
        if (removed) {
          onPop?.();
          const remaining = getBubbles();
          if (remaining.length === 0) {
            triggerSessionEnd();
          }
        }
      }, POP_INTERVAL_MS);
    }

    return () => {
      clearGrow();
      clearPop();
    };
  }, [isActive]);

  const resetManual = useCallback(() => {
    clearGrow();
    clearPop();
    const peak = getSessionPeak();
    const start = getSessionStartTime();
    const duration = start ? Date.now() - start : 0;
    onSessionEnd(peak, duration);
    resetSession({ cx: canvasCx, cy: canvasCy, radius: BUBBLE_RADIUS, color: randomColor() });
    useBubbleStore.setState({ sessionStartTime: Date.now() });
  }, [canvasCx, canvasCy, clearGrow, clearPop, onSessionEnd, resetSession]);

  return { resetManual };
}
