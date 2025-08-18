// 天気タイプの定義
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'thunder' | 'snow';

// 今日の天気データ
export interface TodayWeather {
  weather: WeatherType;
  weatherText: string;
  tempMax: number;
  tempMin: number;
  rainChance: [number, number, number, number]; // 朝昼夕夜
  hourlyWeather: WeatherType[];
}

// 明日の天気データ
export interface TomorrowWeather {
  weather: WeatherType;
  tempMax: number;
  tempMin: number;
}

// 天気データ全体
export interface WeatherData {
  todayWeather: TodayWeather;
  tomorrowWeather: TomorrowWeather;
  lastUpdate: number;
}

// 位置情報データ
export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// エラータイプ
export interface LocationError {
  code: 'PERMISSION_DENIED' | 'GPS_DISABLED' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}