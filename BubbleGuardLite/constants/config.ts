export const GROW_INTERVAL_MS = 5000;
export const POP_INTERVAL_MS = 2000;
export const BUBBLE_RADIUS = 55;
export const BANNER_HEIGHT = 60;

export const BUBBLE_PALETTE = [
  'rgba(100,180,255,0.75)',
  'rgba(180,100,255,0.75)',
  'rgba(100,235,180,0.75)',
  'rgba(255,170,90,0.75)',
  'rgba(255,100,150,0.75)',
  'rgba(90,210,255,0.75)',
  'rgba(255,220,80,0.75)',
  'rgba(130,255,130,0.75)',
];

export const ADMOB_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
export const ADMOB_BANNER_ID =
  process.env.EXPO_PUBLIC_ADMOB_BANNER_ID ?? ADMOB_TEST_BANNER_ID;

export const ASYNC_KEYS = {
  ALL_TIME_BEST: '@bubbleguard/all_time_best',
  LAST_SESSION_COUNT: '@bubbleguard/last_session_count',
  LAST_SESSION_DATE: '@bubbleguard/last_session_date',
  TOTAL_SESSIONS: '@bubbleguard/total_sessions',
  TOTAL_FOCUS_MINS: '@bubbleguard/total_focus_mins',
} as const;
