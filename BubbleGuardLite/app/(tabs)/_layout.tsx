import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#64B4FF',
        tabBarStyle: { backgroundColor: '#fff' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bubbles',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="circle.hexagongrid.fill"
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="chart.bar.fill"
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
