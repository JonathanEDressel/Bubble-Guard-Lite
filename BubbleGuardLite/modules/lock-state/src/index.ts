import { requireNativeModule, EventEmitter } from 'expo-modules-core';
import { Platform } from 'react-native';

let LockStateNative: any = null;
try {
  if (Platform.OS === 'ios') {
    LockStateNative = requireNativeModule('LockState');
  }
} catch {
  // Module not available (web, or native project not yet built)
}

const emitter = LockStateNative ? new EventEmitter(LockStateNative) : null;

/**
 * True when the native lock-state module is loaded (i.e. running in a dev/prod
 * build). False in Expo Go, where the custom native module is not bundled.
 */
export const isLockDetectionAvailable = LockStateNative !== null;

/**
 * Returns true when protected data is available, i.e. the phone is NOT locked.
 * Returns true on non-iOS platforms (no lock detection available).
 */
export function isProtectedDataAvailable(): boolean {
  return LockStateNative?.isProtectedDataAvailable() ?? true;
}

/**
 * Subscribe to lock/unlock events. The listener receives `{ locked: true }`
 * when the phone locks and `{ locked: false }` when it unlocks.
 * Returns a subscription with a `.remove()` method.
 */
export function addLockStateListener(
  listener: (event: { locked: boolean }) => void
): { remove: () => void } {
  if (!emitter) return { remove: () => {} };
  return emitter.addListener<{ locked: boolean }>('onLockStateChange', listener);
}
