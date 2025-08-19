import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TomorrowWeather as TomorrowWeatherType } from '@/types/weather';
import { WEATHER_ICONS } from '@/constants/weatherIcons';

interface TomorrowWeatherProps {
  weather: TomorrowWeatherType;
}

const TomorrowWeatherComponent = memo(function TomorrowWeather({ weather }: TomorrowWeatherProps) {
  const weatherText = {
    sunny: '晴れ',
    cloudy: 'くもり',
    rainy: '雨',
    thunder: '雷雨',
    snow: '雪'
  }[weather.weather];

  return (
    <ThemedView 
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={`明日の天気: ${weatherText}、最高気温${weather.tempMax}度、最低気温${weather.tempMin}度`}
    >
      <ThemedText style={styles.title}>明日の天気</ThemedText>
      
      <ThemedView style={styles.content}>
        <ThemedText 
          style={styles.weatherIcon}
          accessibilityLabel={`天気アイコン: ${weatherText}`}
          accessibilityRole="image"
        >
          {WEATHER_ICONS[weather.weather]}
        </ThemedText>
        
        <ThemedView style={styles.tempInfo}>
          <ThemedText 
            style={styles.temperature}
            accessibilityLabel={`明日の気温、最高${weather.tempMax}度、最低${weather.tempMin}度`}
          >
            {weather.tempMax}° / {weather.tempMin}°
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
});

export { TomorrowWeatherComponent as TomorrowWeather };

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 30,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    opacity: 0.9,
    paddingLeft: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  weatherIcon: {
    fontSize: 50,
    lineHeight: 60,
    marginRight: 15,
  },
  tempInfo: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 20,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
});