import { useState, useEffect, useCallback } from 'react';
import { LocationData, TodayWeather, TomorrowWeather, WeatherData } from '@/types/weather';
import { weatherApiService } from '@/services/weatherApi';

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
}

export function useWeatherData({ location }: UseWeatherDataProps): UseWeatherDataReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [todayWeather, setTodayWeather] = useState<TodayWeather | null>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<TomorrowWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 天気データを取得
  const fetchWeatherData = useCallback(async () => {
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
      });

      // 今日と明日の天気を並行して取得
      const [today, tomorrow] = await Promise.all([
        weatherApiService.getWeatherForToday(location.latitude, location.longitude),
        weatherApiService.getWeatherForTomorrow(location.latitude, location.longitude),
      ]);

      console.log('天気データ取得成功:', { today, tomorrow });

      // データを更新
      setTodayWeather(today);
      setTomorrowWeather(tomorrow);
      
      // 全体のデータも構築
      const fullWeatherData: WeatherData = {
        lastUpdate: new Date().toISOString(),
        location: {
          lat: location.latitude,
          lon: location.longitude,
        },
        today,
        tomorrow,
      };
      
      setWeatherData(fullWeatherData);
    } catch (err) {
      console.error('天気データ取得エラー:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [location]);

  // 手動リフレッシュ
  const refresh = useCallback(async () => {
    await fetchWeatherData();
  }, [fetchWeatherData]);

  // 位置情報が変更されたら天気データを取得
  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location, fetchWeatherData]);

  return {
    weatherData,
    todayWeather,
    tomorrowWeather,
    loading,
    error,
    refresh,
  };
}