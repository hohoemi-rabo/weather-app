import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface RainProbabilityProps {
  data: [number, number, number, number];
}

const TIME_LABELS = ['朝', '昼', '夕', '夜'];
const TIME_ICONS = ['🌅', '☀️', '🌆', '🌙'];

export function RainProbability({ data }: RainProbabilityProps) {
  const backgroundColor = useThemeColor(
    { light: 'rgba(0, 122, 255, 0.05)', dark: 'rgba(0, 122, 255, 0.1)' },
    'background'
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText style={styles.title}>降水確率</ThemedText>
      
      <ThemedView style={styles.grid}>
        {data.map((probability, index) => (
          <ThemedView key={index} style={styles.item}>
            <ThemedText style={styles.timeIcon}>{TIME_ICONS[index]}</ThemedText>
            <ThemedText style={styles.timeLabel}>{TIME_LABELS[index]}</ThemedText>
            
            <ThemedText 
              style={[
                styles.value,
                probability >= 70 && styles.highValue,
                probability >= 40 && probability < 70 && styles.mediumValue
              ]}
              accessibilityLabel={`降水確率${probability}パーセント`}
            >
              {probability}%
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  timeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  highValue: {
    color: '#FF3B30',
  },
  mediumValue: {
    color: '#FF9500',
  },
});