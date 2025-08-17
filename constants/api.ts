// API設定
export const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  ENDPOINTS: {
    CURRENT_WEATHER: '/weather',
    FORECAST: '/forecast',
  },
  DEFAULT_PARAMS: {
    units: 'metric', // 摂氏温度
    lang: 'ja', // 日本語
  },
  TIMEOUT: 10000, // 10秒
  CACHE_DURATION: 60 * 60 * 1000, // 1時間
  UPDATE_INTERVAL: 60 * 60 * 1000, // 1時間
};