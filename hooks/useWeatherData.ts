import { useState, useEffect, useCallback } from 'react';
import { LocationData, TodayWeather, TomorrowWeather, WeatherData } from '@/types/weather';
import { weatherApiService } from '@/services/weatherApi';
import { useNetworkStatus } from './useNetworkStatus';

interface UseWeatherDataProps {
  location: LocationData | null;
}

interface UseWeatherDataReturn {
  weatherData: WeatherData | null;
  todayWeather: TodayWeather | null;
  tomorrowWeather: TomorrowWeather | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isFromCache: boolean;
  isStale: boolean;
  isOffline: boolean;
}

export function useWeatherData({ location }: UseWeatherDataProps): UseWeatherDataReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [todayWeather, setTodayWeather] = useState<TodayWeather | null>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<TomorrowWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  const networkStatus = useNetworkStatus();

  // 天気データを取得（強制リフレッシュオプション付き）
  const fetchWeatherData = useCallback(async (forceRefresh: boolean = false) => {
    if (!location) {
      console.log('位置情報がないため天気データを取得できません');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('天気データを取得中...', {
        lat: location.latitude,
        lon: location.longitude,
        forceRefresh,
        isOnline: networkStatus.isOnline,
      });

      // キャッシュ機能付きでデータ取得
      const result = await weatherApiService.getWeatherWithCache(
        location.latitude,
        location.longitude,
        forceRefresh
      );

      console.log('天気データ取得結果:', {
        fromCache: result.fromCache,
        isStale: result.isStale,
        offline: result.offline,
      });

      // データを更新
      setWeatherData(result.data);
      setTodayWeather(result.data.todayWeather);
      setTomorrowWeather(result.data.tomorrowWeather);
      
      // キャッシュ状態を更新
      setIsFromCache(result.fromCache);
      setIsStale(result.isStale || false);
      setIsOffline(result.offline || false);
      
    } catch (err) {
      console.error('天気データ取得エラー:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [location, networkStatus.isOnline]);

  // 手動リフレッシュ（強制的にAPIから取得）
  const refresh = useCallback(async () => {
    await fetchWeatherData(true);
  }, [fetchWeatherData]);

  // 位置情報が変更されたら天気データを取得
  useEffect(() => {
    if (location) {
      fetchWeatherData(false);
    }
  }, [location, fetchWeatherData]);

  return {
    weatherData,
    todayWeather,
    tomorrowWeather,
    loading,
    error,
    refresh,
    isFromCache,
    isStale,
    isOffline: !networkStatus.isOnline,
  };
}