import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { isProtectedDataAvailable, addLockStateListener } from 'lock-state';

export type AppStateExtended = 'foreground' | 'locked' | 'background';

function deriveState(appStatus: AppStateStatus, isLocked: boolean): AppStateExtended {
  console.log('status - ', appStatus, ', locked - ', isLocked);
  if (appStatus === 'active') return 'foreground';
  if (isLocked) return 'locked';
  return 'background';
}

export function useAppState(): AppStateExtended {
  // isLockedRef starts false; the useState lazy initializer sets the real
  // value once at mount via the native module. Keeping the call inside
  // useState(() => ...) prevents the native bridge call from re-evaluating
  // on every render (useRef's argument is always evaluated even though
  // React only uses it on the first call).
  const isLockedRef = useRef(false);
  const appStatusRef = useRef(AppState.currentState);

  const [state, setState] = useState<AppStateExtended>(() => {
    const isLocked = !isProtectedDataAvailable();
    isLockedRef.current = isLocked;
    return deriveState(AppState.currentState, isLocked);
  });

  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (next: AppStateStatus) => {
      appStatusRef.current = next;
      setState(deriveState(next, isLockedRef.current));
    });

    const lockSub = addLockStateListener(({ locked }) => {
      isLockedRef.current = locked;
      setState(deriveState(appStatusRef.current, locked));
    });

    return () => {
      appStateSub.remove();
      lockSub.remove();
    };
  }, []);

  return state;
}
