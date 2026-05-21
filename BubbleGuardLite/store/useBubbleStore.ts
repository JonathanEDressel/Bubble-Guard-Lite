import { create } from 'zustand';

export interface Bubble {
  id: number;
  cx: number;
  cy: number;
  radius: number;
  color: string;
}

interface BubbleState {
  bubbles: Bubble[];
  nextId: number;
  allTimeBest: number;
  sessionPeak: number;
  sessionStartTime: number | null;

  addBubble: (bubble: Omit<Bubble, 'id'>) => void;
  removeOldest: () => Bubble | null;
  setAllTimeBest: (count: number) => void;
  resetSession: (firstBubble: Omit<Bubble, 'id'>) => void;
  hydrateAllTimeBest: (count: number) => void;
}

export const useBubbleStore = create<BubbleState>((set, get) => ({
  bubbles: [],
  nextId: 1,
  allTimeBest: 0,
  sessionPeak: 0,
  sessionStartTime: null,

  addBubble: (bubble) =>
    set((s) => {
      const id = s.nextId;
      const newBubbles = [...s.bubbles, { ...bubble, id }];
      const newCount = newBubbles.length;
      console.log(`[BubbleGuard] +1 bubble added   | total: ${newCount}`);
      return {
        bubbles: newBubbles,
        nextId: id + 1,
        sessionPeak: Math.max(s.sessionPeak, newCount),
        allTimeBest: Math.max(s.allTimeBest, newCount),
      };
    }),

  removeOldest: () => {
    const { bubbles } = get();
    if (bubbles.length === 0) return null;
    const oldest = bubbles.reduce((a, b) => (a.id < b.id ? a : b));
    set((s) => ({ bubbles: s.bubbles.filter((b) => b.id !== oldest.id) }));
    const remainingCount = bubbles.length - 1;
    console.log(`[BubbleGuard] -1 bubble removed  | total: ${remainingCount}`);
    return oldest;
  },

  setAllTimeBest: (count) => set({ allTimeBest: count }),

  hydrateAllTimeBest: (count) =>
    set((s) => ({ allTimeBest: Math.max(s.allTimeBest, count) })),

  resetSession: (firstBubble) =>
    set((s) => ({
      bubbles: [{ ...firstBubble, id: s.nextId }],
      nextId: s.nextId + 1,
      sessionPeak: 1,
      sessionStartTime: Date.now(),
    })),
}));
