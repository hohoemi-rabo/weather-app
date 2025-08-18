import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TodayWeather as TodayWeatherType } from '@/types/weather';
import { WEATHER_ICONS } from '@/constants/weatherIcons';
import { RainProbability } from './RainProbability';
import { WeatherIcon } from './WeatherIcon';

interface TodayWeatherProps {
  weather: TodayWeatherType;
}

export function TodayWeather({ weather }: TodayWeatherProps) {
  return (
    <ThemedView style={styles.container}>
      {/* タイトル */}
      <ThemedText type="title" style={styles.title}>今日の天気</ThemedText>
      
      {/* メインの天気表示 */}
      <ThemedView style={styles.mainWeatherSection}>
        <WeatherIcon 
          type={weather.weather} 
          size="large"
          accessibilityLabel={`${weather.weatherText}の天気アイコン`}
        />
        
        <ThemedText 
          style={styles.weatherText}
          accessibilityLabel={`今日の天気は${weather.weatherText}`}
        >
          {weather.weatherText}
        </ThemedText>
        
        {/* 気温表示 */}
        <ThemedView style={styles.tempContainer}>
          <ThemedText 
            style={styles.tempMax}
            accessibilityLabel={`最高気温${weather.tempMax}度`}
          >
            {weather.tempMax}°
          </ThemedText>
          <ThemedText style={styles.tempSeparator}>/</ThemedText>
          <ThemedText 
            style={styles.tempMin}
            accessibilityLabel={`最低気温${weather.tempMin}度`}
          >
            {weather.tempMin}°
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* 降水確率セクション */}
      <RainProbability data={weather.rainChance} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 40,
  },
  mainWeatherSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  weatherText: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 25,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tempMax: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  tempSeparator: {
    fontSize: 30,
    marginHorizontal: 8,
    opacity: 0.4,
  },
  tempMin: {
    fontSize: 36,
    opacity: 0.7,
  },
});