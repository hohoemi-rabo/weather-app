import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '@/types/weather';

// キャッシュキー定義
export const CACHE_KEYS = {
  WEATHER_DATA: 'weather_data',
  LOCATION: 'last_location',
  SETTINGS: 'app_settings',
} as const;

// キャッシュ有効期限（ミリ秒）
export const CACHE_DURATION = {
  WEATHER: 10 * 60 * 1000,       // 10分（テスト用に短縮）
  LOCATION: 24 * 60 * 60 * 1000, // 24時間
} as const;

// キャッシュデータの型定義
interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

// 現在のキャッシュバージョン
const CACHE_VERSION = '1.0.1';

class CacheService {
  /**
   * 天気データを保存
   */
  async saveWeatherData(data: WeatherData): Promise<void> {
    try {
      const cached: CachedData<WeatherData> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      
      const jsonData = JSON.stringify(cached);
      await AsyncStorage.setItem(CACHE_KEYS.WEATHER_DATA, jsonData);
      console.log('Weather data cached successfully');
    } catch (error) {
      console.error('Failed to cache weather data:', error);
    }
  }

  /**
   * 天気データを取得
   */
  async getWeatherData(): Promise<CachedData<WeatherData> | null> {
    try {
      const jsonData = await AsyncStorage.getItem(CACHE_KEYS.WEATHER_DATA);
      
      if (!jsonData) {
        return null;
      }
      
      const cached: CachedData<WeatherData> = JSON.parse(jsonData);
      
      // バージョンチェック
      if (cached.version !== CACHE_VERSION) {
        console.log('Cache version mismatch, clearing cache');
        await this.clearWeatherCache();
        return null;
      }
      
      // lastUpdateが文字列の場合は数値に変換
      if (cached.data && typeof cached.data.lastUpdate === 'string') {
        const parsed = parseInt(cached.data.lastUpdate, 10);
        if (!isNaN(parsed)) {
          cached.data.lastUpdate = parsed;
        } else {
          // 無効な値の場合は現在時刻を設定
          cached.data.lastUpdate = cached.timestamp;
        }
      }
      
      return cached;
    } catch (error) {
      console.error('Failed to get cached weather data:', error);
      return null;
    }
  }

  /**
   * 位置情報を保存
   */
  async saveLocation(latitude: number, longitude: number): Promise<void> {
    try {
      const cached: CachedData<{ latitude: number; longitude: number }> = {
        data: { latitude, longitude },
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      
      const jsonData = JSON.stringify(cached);
      await AsyncStorage.setItem(CACHE_KEYS.LOCATION, jsonData);
    } catch (error) {
      console.error('Failed to cache location:', error);
    }
  }

  /**
   * 位置情報を取得
   */
  async getLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const jsonData = await AsyncStorage.getItem(CACHE_KEYS.LOCATION);
      
      if (!jsonData) {
        return null;
      }
      
      const cached: CachedData<{ latitude: number; longitude: number }> = JSON.parse(jsonData);
      
      // 24時間以内のデータのみ有効
      if (!this.isDataFresh(cached.timestamp, CACHE_DURATION.LOCATION)) {
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Failed to get cached location:', error);
      return null;
    }
  }

  /**
   * データの鮮度をチェック
   */
  isDataFresh(timestamp: number, maxAge: number = CACHE_DURATION.WEATHER): boolean {
    const age = Date.now() - timestamp;
    return age < maxAge;
  }

  /**
   * 天気データキャッシュをクリア
   */
  async clearWeatherCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.WEATHER_DATA);
      console.log('Weather cache cleared');
    } catch (error) {
      console.error('Failed to clear weather cache:', error);
    }
  }

  /**
   * すべてのキャッシュをクリア
   */
  async clearAllCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.WEATHER_DATA,
        CACHE_KEYS.LOCATION,
        CACHE_KEYS.SETTINGS,
      ]);
      console.log('All cache cleared');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * キャッシュサイズを取得（概算）
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();