import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { LocationData, LocationError } from '@/types/weather';

class LocationService {
  private cachedLocation: LocationData | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

  // 権限をリクエスト
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('位置情報権限のリクエストに失敗:', error);
      return false;
    }
  }

  // 権限状態を確認
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('権限状態の確認に失敗:', error);
      return false;
    }
  }

  // 現在地を取得（キャッシュ機能付き）
  async getCurrentLocation(forceRefresh: boolean = false): Promise<LocationData> {
    try {
      // キャッシュが有効な場合は返す
      if (!forceRefresh && this.cachedLocation && this.cacheTimestamp) {
        const cacheAge = Date.now() - this.cacheTimestamp;
        if (cacheAge < this.CACHE_DURATION) {
          console.log('位置情報キャッシュを使用');
          return this.cachedLocation;
        }
      }

      // 権限確認
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw this.createError('PERMISSION_DENIED', '位置情報の使用が許可されていません');
      }

      // GPSが有効か確認
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        throw this.createError('GPS_DISABLED', 'GPSが無効になっています');
      }

      console.log('新しい位置情報を取得中...');
      // 位置情報を取得（タイムアウト5秒、精度を下げて高速化）
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low, // 精度を下げて高速化
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(this.createError('TIMEOUT', '位置情報の取得がタイムアウトしました')), 5000)
        ),
      ]);

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };

      // キャッシュを更新
      this.cachedLocation = locationData;
      this.cacheTimestamp = Date.now();

      return locationData;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw this.createError('UNKNOWN', '位置情報の取得に失敗しました');
    }
  }

  // キャッシュをクリア
  clearCache(): void {
    this.cachedLocation = null;
    this.cacheTimestamp = null;
  }

  // 設定画面を開く
  openLocationSettings(): void {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  // エラーオブジェクトを作成
  private createError(code: LocationError['code'], message: string): LocationError {
    return { code, message };
  }
}

export const locationService = new LocationService();