import React from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { WeatherType } from '@/types/weather';
import { WEATHER_ICONS } from '@/constants/weatherIcons';

interface WeatherIconProps {
  type: WeatherType;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  accessibilityLabel?: string;
}

export function WeatherIcon({ 
  type, 
  size = 'medium', 
  animated = true,
  accessibilityLabel 
}: WeatherIconProps) {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(1);
    }
  }, [type, animated]);

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  // 天気に応じた追加エフェクト
  const renderWeatherEffect = () => {
    if (type === 'rainy') {
      return (
        <View style={styles.rainEffect}>
          <ThemedText style={styles.rainDrop}>💧</ThemedText>
          <ThemedText style={[styles.rainDrop, styles.rainDrop2]}>💧</ThemedText>
          <ThemedText style={[styles.rainDrop, styles.rainDrop3]}>💧</ThemedText>
        </View>
      );
    }
    if (type === 'snow') {
      return (
        <View style={styles.snowEffect}>
          <ThemedText style={styles.snowFlake}>❄️</ThemedText>
          <ThemedText style={[styles.snowFlake, styles.snowFlake2]}>❄️</ThemedText>
        </View>
      );
    }
    return null;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }]
        }
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      <ThemedText style={[styles.icon, getSizeStyle()]}>
        {WEATHER_ICONS[type]}
      </ThemedText>
      {animated && renderWeatherEffect()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    minWidth: 80,
    minHeight: 80,
  },
  icon: {
    textAlign: 'center',
  },
  small: {
    fontSize: 32,
  },
  medium: {
    fontSize: 60,
  },
  large: {
    fontSize: 100,
  },
  rainEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainDrop: {
    position: 'absolute',
    fontSize: 12,
    opacity: 0.5,
    top: '70%',
  },
  rainDrop2: {
    left: '30%',
    top: '75%',
  },
  rainDrop3: {
    right: '30%',
    top: '65%',
  },
  snowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snowFlake: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.6,
  },
  snowFlake2: {
    left: '25%',
    top: '60%',
  },
});