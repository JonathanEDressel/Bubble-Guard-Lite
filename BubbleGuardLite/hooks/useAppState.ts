import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState() {
  const [isActive, setIsActive] = useState(
    AppState.currentState === 'active'
  );
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        const wasActive = appStateRef.current === 'active';
        const nowActive = nextState === 'active';
        appStateRef.current = nextState;
        if (wasActive !== nowActive) {
          setIsActive(nowActive);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  return isActive;
}
