import { API_CONFIG } from '@/constants/api';
import { getWeatherType, WEATHER_TEXT } from '@/constants/weatherIcons';
import { 
  OpenWeatherCurrentResponse, 
  OpenWeatherForecastResponse 
} from '@/types/api';
import { 
  TodayWeather, 
  TomorrowWeather, 
  WeatherType 
} from '@/types/weather';

class WeatherApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_CONFIG.API_KEY;
    this.baseUrl = API_CONFIG.BASE_URL;
    
    if (!this.apiKey) {
      console.error('OpenWeatherMap APIキーが設定されていません');
    }
  }

  // 現在の天気を取得
  async getCurrentWeather(lat: number, lon: number): Promise<OpenWeatherCurrentResponse> {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CURRENT_WEATHER}`;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.apiKey,
      ...API_CONFIG.DEFAULT_PARAMS,
    });

    try {
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('現在の天気取得エラー:', error);
      throw error;
    }
  }

  // 5日間の予報を取得
  async getForecast(lat: number, lon: number): Promise<OpenWeatherForecastResponse> {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FORECAST}`;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.apiKey,
      ...API_CONFIG.DEFAULT_PARAMS,
    });

    try {
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('予報取得エラー:', error);
      throw error;
    }
  }

  // 今日の天気情報を取得して変換
  async getWeatherForToday(lat: number, lon: number): Promise<TodayWeather> {
    try {
      // 現在の天気と予報の両方を取得
      const [current, forecast] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        this.getForecast(lat, lon),
      ]);

      // 今日の日付を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 今日のデータをフィルタリング
      const todayForecasts = forecast.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= today && itemDate < tomorrow;
      });

      // 時間帯別の降水確率を計算
      const rainChance = this.calculateRainChanceByPeriod(todayForecasts);
      
      // 時間帯別の天気を取得
      const hourlyWeather = this.getHourlyWeatherTypes(todayForecasts);

      // 最高・最低気温を計算
      const temps = todayForecasts.map(item => item.main.temp);
      const tempMax = Math.round(Math.max(...temps, current.main.temp_max));
      const tempMin = Math.round(Math.min(...temps, current.main.temp_min));

      // 現在の天気タイプを取得
      const weatherType = getWeatherType(current.weather[0].id);
      const weatherText = WEATHER_TEXT[weatherType];

      return {
        weather: weatherType,
        weatherText,
        tempMax,
        tempMin,
        rainChance,
        hourlyWeather,
      };
    } catch (error) {
      console.error('今日の天気取得エラー:', error);
      throw error;
    }
  }

  // 明日の天気情報を取得して変換
  async getWeatherForTomorrow(lat: number, lon: number): Promise<TomorrowWeather> {
    try {
      const forecast = await this.getForecast(lat, lon);

      // 明日の日付を取得
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // 明日のデータをフィルタリング
      const tomorrowForecasts = forecast.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= tomorrow && itemDate < dayAfterTomorrow;
      });

      if (tomorrowForecasts.length === 0) {
        throw new Error('明日の天気データが見つかりません');
      }

      // 最高・最低気温を計算
      const temps = tomorrowForecasts.map(item => item.main.temp);
      const tempMax = Math.round(Math.max(...temps));
      const tempMin = Math.round(Math.min(...temps));

      // 最も頻繁に現れる天気を取得
      const weatherCodes = tomorrowForecasts.map(item => item.weather[0].id);
      const mostFrequentCode = this.getMostFrequentWeatherCode(weatherCodes);
      const weather = getWeatherType(mostFrequentCode);

      return {
        weather,
        tempMax,
        tempMin,
      };
    } catch (error) {
      console.error('明日の天気取得エラー:', error);
      throw error;
    }
  }

  // 時間帯別の降水確率を計算
  private calculateRainChanceByPeriod(forecasts: OpenWeatherForecastResponse['list']): [number, number, number, number] {
    const periods = {
      morning: [] as number[],   // 0-6時
      daytime: [] as number[],   // 6-12時
      evening: [] as number[],   // 12-18時
      night: [] as number[],     // 18-24時
    };

    forecasts.forEach(item => {
      const hour = new Date(item.dt * 1000).getHours();
      const rainChance = Math.round((item.pop || 0) * 100);

      if (hour >= 0 && hour < 6) {
        periods.morning.push(rainChance);
      } else if (hour >= 6 && hour < 12) {
        periods.daytime.push(rainChance);
      } else if (hour >= 12 && hour < 18) {
        periods.evening.push(rainChance);
      } else {
        periods.night.push(rainChance);
      }
    });

    return [
      periods.morning.length > 0 ? Math.max(...periods.morning) : 0,
      periods.daytime.length > 0 ? Math.max(...periods.daytime) : 0,
      periods.evening.length > 0 ? Math.max(...periods.evening) : 0,
      periods.night.length > 0 ? Math.max(...periods.night) : 0,
    ];
  }

  // 時間帯別の天気タイプを取得
  private getHourlyWeatherTypes(forecasts: OpenWeatherForecastResponse['list']): WeatherType[] {
    const hourlyTypes: WeatherType[] = [];
    const targetHours = [6, 12, 18]; // 朝、昼、夜の代表時刻

    targetHours.forEach(targetHour => {
      const nearestForecast = forecasts.find(item => {
        const hour = new Date(item.dt * 1000).getHours();
        return Math.abs(hour - targetHour) <= 3;
      });

      if (nearestForecast) {
        hourlyTypes.push(getWeatherType(nearestForecast.weather[0].id));
      } else if (forecasts.length > 0) {
        hourlyTypes.push(getWeatherType(forecasts[0].weather[0].id));
      } else {
        hourlyTypes.push('cloudy');
      }
    });

    return hourlyTypes;
  }

  // 最も頻繁に現れる天気コードを取得
  private getMostFrequentWeatherCode(codes: number[]): number {
    const frequency: Record<number, number> = {};
    
    codes.forEach(code => {
      frequency[code] = (frequency[code] || 0) + 1;
    });

    let maxFreq = 0;
    let mostFrequent = codes[0];

    Object.entries(frequency).forEach(([code, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mostFrequent = parseInt(code);
      }
    });

    return mostFrequent;
  }
}

export const weatherApiService = new WeatherApiService();