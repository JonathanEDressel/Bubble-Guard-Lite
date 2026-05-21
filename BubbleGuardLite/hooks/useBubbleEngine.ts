import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState } from 'react-native';
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
  radius: number,
  canvasW: number,
  canvasH: number
): { cx: number; cy: number } {
  if (existing.length === 0) return { cx: canvasW / 2, cy: canvasH / 2 };

  const ANGLES = 24;
  const GROW_MARGIN = BUBBLE_RADIUS * 3;

  const noOverlap = (cx: number, cy: number) =>
    !existing.some(
      (b) => Math.sqrt((b.cx - cx) ** 2 + (b.cy - cy) ** 2) < b.radius + radius - 0.5
    );

  // Compute world bounds from existing bubbles, expanded by a growth margin
  // so the cluster actively spreads outward beyond the current viewport.
  const xs = existing.map((b) => b.cx);
  const ys = existing.map((b) => b.cy);
  const worldMinX = Math.min(0, Math.min(...xs) - BUBBLE_RADIUS) - GROW_MARGIN;
  const worldMinY = Math.min(0, Math.min(...ys) - BUBBLE_RADIUS) - GROW_MARGIN;
  const worldMaxX = Math.max(canvasW, Math.max(...xs) + BUBBLE_RADIUS) + GROW_MARGIN;
  const worldMaxY = Math.max(canvasH, Math.max(...ys) + BUBBLE_RADIUS) + GROW_MARGIN;

  // Pick a random target point anywhere in the current world.
  const tx = worldMinX + Math.random() * (worldMaxX - worldMinX);
  const ty = worldMinY + Math.random() * (worldMaxY - worldMinY);

  // Collect every valid tangent position (anchor × angle) and return the
  // one closest to the random target — this makes bubbles appear at random
  // points on screen while guaranteeing they always touch an existing bubble.
  const candidates: { cx: number; cy: number; d: number }[] = [];

  for (const anchor of existing) {
    const tangentDist = anchor.radius + radius;
    for (let i = 0; i < ANGLES; i++) {
      const angle = (i / ANGLES) * 2 * Math.PI;
      const cx = anchor.cx + Math.cos(angle) * tangentDist;
      const cy = anchor.cy + Math.sin(angle) * tangentDist;
      if (noOverlap(cx, cy)) {
        const d = Math.sqrt((cx - tx) ** 2 + (cy - ty) ** 2);
        candidates.push({ cx, cy, d });
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.d - b.d);
    return { cx: candidates[0].cx, cy: candidates[0].cy };
  }

  // Fallback (densely packed cluster — very rare): original sweep logic.
  const STEP = (15 * Math.PI) / 180;
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
}: UseBubbleEngineOptions) {
  const addBubble = useBubbleStore((s) => s.addBubble);
  const resetSession = useBubbleStore((s) => s.resetSession);
  const getBubbles = () => useBubbleStore.getState().bubbles;
  const getSessionPeak = () => useBubbleStore.getState().sessionPeak;
  const getSessionStartTime = () => useBubbleStore.getState().sessionStartTime;

  const appState = useAppState();
  const [restartKey, setRestartKey] = useState(0);
  const growRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // bgStartRef: set by the AppState listener when the app enters background.
  // lockedStartRef: tracks the last grow tick in locked state (dev build only).
  const bgStartRef = useRef<number | null>(null);
  const lockedStartRef = useRef<number | null>(null);

  const clearGrow = useCallback(() => {
    if (growRef.current !== null) {
      clearInterval(growRef.current);
      growRef.current = null;
    }
  }, []);

  const triggerSessionEnd = useCallback(() => {
    clearGrow();
    const peak = getSessionPeak();
    const start = getSessionStartTime();
    const duration = start ? Date.now() - start : 0;
    onSessionEnd(peak, duration);

    // Restart after 1 second
    setTimeout(() => {
      resetSession({ cx: canvasCx, cy: canvasCy, radius: BUBBLE_RADIUS, color: randomColor() });
      setRestartKey((k) => k + 1);
    }, 1000);
  }, [canvasCx, canvasCy, clearGrow, onSessionEnd, resetSession]);

  const triggerSessionEndRef = useRef(triggerSessionEnd);
  useEffect(() => { triggerSessionEndRef.current = triggerSessionEnd; }, [triggerSessionEnd]);

  // Mount: place initial bubble
  useEffect(() => {
    const bubbles = getBubbles();
    if (bubbles.length === 0) {
      addBubble({ cx: canvasCx, cy: canvasCy, radius: BUBBLE_RADIUS, color: randomColor() });
      useBubbleStore.setState({ sessionStartTime: Date.now() });
    }
  }, []);

  // Direct AppState listener — bypasses React 18 automatic batching.
  // React may batch inactive → background → active into a single 'foreground'
  // commit, so useEffect([appState]) never sees the intermediate 'background'
  // state: bgStartRef is never set and zero pops fire on return.
  // These callbacks run synchronously in the JS thread for every AppState event.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if ((next === 'inactive' || next === 'background') && bgStartRef.current === null) {
        bgStartRef.current = Date.now();
      } else if (next === 'active' && bgStartRef.current !== null) {
        const elapsed = Date.now() - bgStartRef.current;
        bgStartRef.current = null;
        const missed = Math.floor(elapsed / POP_INTERVAL_MS);
        for (let i = 0; i < missed; i++) {
          const removed = useBubbleStore.getState().removeOldest();
          if (!removed) break;
          if (useBubbleStore.getState().bubbles.length === 0) {
            triggerSessionEndRef.current();
            break;
          }
        }
      }
    });
    return () => sub.remove();
  }, []);

  // Grow timer: managed by React state transitions.
  useEffect(() => {
    // If we were locked, apply any grows that should have occurred while
    // the JS thread was suspended (capped to avoid UI freeze on very long gaps).
    if (lockedStartRef.current !== null) {
      const elapsed = Date.now() - lockedStartRef.current;
      const MAX_CATCHUP_GROWS = 60; // cap at 5 min worth to keep O(n) manageable
      const missed = Math.min(Math.floor(elapsed / GROW_INTERVAL_MS), MAX_CATCHUP_GROWS);
      lockedStartRef.current = null;
      for (let i = 0; i < missed; i++) {
        const current = getBubbles();
        const pos = findBubblePosition(current, BUBBLE_RADIUS, canvasCx * 2, canvasCy * 2);
        addBubble({ ...pos, radius: BUBBLE_RADIUS, color: randomColor() });
        // Skip per-grow sound during batch catch-up.
      }
    }

    // ── Set up timers for the current state ──────────────────────────────────

    if (appState === 'background') {
      clearGrow();
    } else if (appState === 'locked') {
      lockedStartRef.current = Date.now();
      growRef.current = setInterval(() => {
        // Update the timestamp so catch-up only covers the gap AFTER this tick.
        lockedStartRef.current = Date.now();
        const current = getBubbles();
        const pos = findBubblePosition(current, BUBBLE_RADIUS, canvasCx * 2, canvasCy * 2);
        addBubble({ ...pos, radius: BUBBLE_RADIUS, color: randomColor() });
        onSpawn?.();
      }, GROW_INTERVAL_MS);
    } else {
      // foreground
      growRef.current = setInterval(() => {
        const current = getBubbles();
        const pos = findBubblePosition(current, BUBBLE_RADIUS, canvasCx * 2, canvasCy * 2);
        addBubble({ ...pos, radius: BUBBLE_RADIUS, color: randomColor() });
        onSpawn?.();
      }, GROW_INTERVAL_MS);
    }

    return () => {
      clearGrow();
    };
  }, [appState, restartKey]);

  const resetManual = useCallback(() => {
    clearGrow();
    const peak = getSessionPeak();
    const start = getSessionStartTime();
    const duration = start ? Date.now() - start : 0;
    onSessionEnd(peak, duration);
    resetSession({ cx: canvasCx, cy: canvasCy, radius: BUBBLE_RADIUS, color: randomColor() });
    useBubbleStore.setState({ sessionStartTime: Date.now() });
  }, [canvasCx, canvasCy, clearGrow, onSessionEnd, resetSession]);

  return { resetManual };
}
