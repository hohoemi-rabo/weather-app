import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

interface SkeletonItemProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  marginBottom?: number;
}

function SkeletonItem({ width, height, borderRadius = 4, marginBottom = 8 }: SkeletonItemProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', '#F5F5F5'],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          width,
          height,
          borderRadius,
          marginBottom,
          backgroundColor,
        },
      ]}
    />
  );
}

export function WeatherSkeleton() {
  return (
    <ThemedView style={styles.container}>
      {/* 今日の天気タイトル */}
      <SkeletonItem width={120} height={24} marginBottom={20} />
      
      {/* 天気アイコン */}
      <SkeletonItem width={100} height={100} borderRadius={50} marginBottom={16} />
      
      {/* 天気テキスト */}
      <SkeletonItem width={80} height={20} marginBottom={16} />
      
      {/* 気温 */}
      <SkeletonItem width={120} height={32} marginBottom={24} />
      
      {/* 降水確率セクション */}
      <ThemedView style={styles.rainSection}>
        <SkeletonItem width={80} height={18} marginBottom={16} />
        <ThemedView style={styles.rainGrid}>
          {[1, 2, 3, 4].map((index) => (
            <ThemedView key={index} style={styles.rainItem}>
              <SkeletonItem width={24} height={24} borderRadius={12} marginBottom={4} />
              <SkeletonItem width={16} height={14} marginBottom={4} />
              <SkeletonItem width={24} height={16} />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
      
      {/* 明日の天気 */}
      <ThemedView style={styles.tomorrowSection}>
        <SkeletonItem width={100} height={18} marginBottom={16} />
        <ThemedView style={styles.tomorrowContent}>
          <SkeletonItem width={50} height={50} borderRadius={25} />
          <SkeletonItem width={80} height={20} />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skeletonItem: {
    backgroundColor: '#E0E0E0',
  },
  rainSection: {
    width: '100%',
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  rainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rainItem: {
    alignItems: 'center',
  },
  tomorrowSection: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  tomorrowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});