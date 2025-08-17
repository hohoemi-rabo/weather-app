import { WeatherType } from '@/types/weather';

// 天気アイコンのマッピング
export const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  thunder: '⛈️',
  snow: '❄️',
};

// 天気の日本語表示
export const WEATHER_TEXT: Record<WeatherType, string> = {
  sunny: '晴れ',
  cloudy: '曇り',
  rainy: '雨',
  thunder: '雷雨',
  snow: '雪',
};

// OpenWeatherMap weather codeから内部タイプへの変換
export function getWeatherType(weatherCode: number): WeatherType {
  if (weatherCode >= 200 && weatherCode < 300) return 'thunder';
  if (weatherCode >= 300 && weatherCode < 600) return 'rainy';
  if (weatherCode >= 600 && weatherCode < 700) return 'snow';
  if (weatherCode >= 700 && weatherCode < 800) return 'cloudy';
  if (weatherCode === 800) return 'sunny';
  if (weatherCode > 800 && weatherCode < 900) return 'cloudy';
  return 'cloudy'; // デフォルト
}