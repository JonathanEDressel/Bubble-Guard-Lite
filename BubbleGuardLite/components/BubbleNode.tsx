import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import { Circle, Ellipse, G } from 'react-native-svg';
import { Bubble } from '@/store/useBubbleStore';

const AnimatedG = Animated.createAnimatedComponent(G);

interface BubbleNodeProps {
  bubble: Bubble;
}

export function BubbleNode({ bubble }: BubbleNodeProps) {
  const r = bubble.radius;

  // Fade in from nearly-invisible to fully opaque on spawn.
  // Animating opacity is reliable with useAnimatedProps on SVG elements;
  // animating transform strings is not.
  const opacity = useSharedValue(0.05);

  useEffect(() => {
    opacity.value = withSpring(1, { stiffness: 200, damping: 18 });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedG
      animatedProps={animatedProps}
      transform={`translate(${bubble.cx}, ${bubble.cy})`}
    >
      {/* Solid base tint so the bubble reads clearly on a dark background */}
      <Circle cx={0} cy={0} r={r} fill="rgba(130, 170, 255, 0.28)" />

      {/* Translucent body with soft iridescent radial gradient */}
      <Circle cx={0} cy={0} r={r} fill="url(#bubbleBody)" />

      {/* Thin iridescent rim (surface tension effect) */}
      <Circle
        cx={0}
        cy={0}
        r={r - 1}
        fill="none"
        stroke="url(#bubbleRim)"
        strokeWidth={3.5}
      />

      {/* Main gloss highlight — large tilted ellipse, upper-left */}
      <Ellipse
        cx={-r * 0.27}
        cy={-r * 0.3}
        rx={r * 0.3}
        ry={r * 0.17}
        fill="white"
        fillOpacity={0.82}
        transform={`rotate(-35, ${-r * 0.27}, ${-r * 0.3})`}
      />

      {/* Secondary specular dot, lower-right */}
      <Circle
        cx={r * 0.22}
        cy={r * 0.28}
        r={r * 0.07}
        fill="white"
        fillOpacity={0.5}
      />
    </AnimatedG>
  );
}


