import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { LocationData, LocationError } from '@/types/weather';
import { cacheService } from './cacheService';

class LocationService {
  private cachedLocation: LocationData | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

  // 初期化時にキャッシュから位置情報を復元
  async initialize() {
    try {
      const savedLocation = await cacheService.getLocation();
      if (savedLocation) {
        this.cachedLocation = {
          latitude: savedLocation.latitude,
          longitude: savedLocation.longitude,
          timestamp: Date.now(),
        };
        this.cacheTimestamp = Date.now();
        console.log('保存された位置情報を復元しました');
      }
    } catch (error) {
      console.log('位置情報の復元に失敗:', error);
    }
  }

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
      // 位置情報を取得（タイムアウト15秒、精度はBalancedに設定）
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // バランス型の精度
          mayShowUserSettingsDialog: true, // 必要に応じて設定ダイアログを表示
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(this.createError('TIMEOUT', '位置情報の取得がタイムアウトしました')), 15000)
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
      
      // AsyncStorageにも保存
      await cacheService.saveLocation(locationData.latitude, locationData.longitude);

      return locationData;
    } catch (error) {
      // タイムアウトエラーの場合、前回の位置情報があれば使用
      if (error && typeof error === 'object' && 'code' in error && error.code === 'TIMEOUT') {
        if (this.cachedLocation) {
          console.log('タイムアウトしたため、前回の位置情報を使用');
          return this.cachedLocation;
        }
      }
      
      // その他のエラーはそのまま投げる
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