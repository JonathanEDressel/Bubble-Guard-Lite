import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Circle } from 'react-native-svg';
import { Bubble } from '@/store/useBubbleStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BubbleNodeProps {
  bubble: Bubble;
  spawning: boolean;
  onPopDone?: (id: number) => void;
}

export function BubbleNode({ bubble, spawning, onPopDone }: BubbleNodeProps) {
  const scale = useSharedValue(spawning ? 0 : 1);

  useEffect(() => {
    if (spawning) {
      scale.value = withSpring(1, { stiffness: 180, damping: 12 });
    }
  }, []);

  useEffect(() => {
    if (!spawning && onPopDone) {
      scale.value = withTiming(0, { duration: 150 }, (finished) => {
        if (finished) runOnJS(onPopDone)(bubble.id);
      });
    }
  }, [spawning]);

  const animatedProps = useAnimatedProps(() => ({
    r: bubble.radius * scale.value,
  }));

  // Derive a slightly more opaque stroke from the fill color
  const stroke = bubble.color.replace(/[\d.]+\)$/, '1)');

  return (
    <AnimatedCircle
      cx={bubble.cx}
      cy={bubble.cy}
      fill={bubble.color}
      stroke={stroke}
      strokeWidth={1.5}
      animatedProps={animatedProps}
    />
  );
}
