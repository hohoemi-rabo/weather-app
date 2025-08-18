import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { LocationData, LocationError } from '@/types/weather';
import { locationService } from '@/services/locationService';

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  hasPermission: boolean | null;
  requestPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  openSettings: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // 権限をリクエスト
  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 現在の権限状態を再確認
      let granted = await locationService.checkPermissions();
      console.log('Current permission status:', granted);
      
      if (!granted) {
        // 権限がない場合のみリクエスト
        granted = await locationService.requestPermissions();
        console.log('Permission request result:', granted);
      }
      
      setHasPermission(granted);
      
      if (granted) {
        // 権限が取得できたら位置情報を取得
        try {
          const locationData = await locationService.getCurrentLocation();
          setLocation(locationData);
          setError(null);
          console.log('Location obtained after permission:', locationData);
        } catch (locationErr) {
          console.error('Failed to get location after permission:', locationErr);
          const locationError = locationErr as LocationError;
          setError(locationError);
        }
      } else {
        setError({
          code: 'PERMISSION_DENIED',
          message: '位置情報の使用を許可してください',
        });
      }
    } catch (err) {
      console.error('権限リクエストエラー:', err);
      setError({
        code: 'UNKNOWN',
        message: 'エラーが発生しました',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 位置情報を更新
  const refreshLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const locationData = await locationService.getCurrentLocation();
      setLocation(locationData);
      setHasPermission(true);
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError);
      
      if (locationError.code === 'PERMISSION_DENIED') {
        setHasPermission(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 設定画面を開く
  const openSettings = useCallback(() => {
    locationService.openLocationSettings();
  }, []);

  // 初期化
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // LocationServiceを初期化（キャッシュから位置情報を復元）
        await locationService.initialize();
        
        // 権限状態を確認
        const hasPermission = await locationService.checkPermissions();
        setHasPermission(hasPermission);
        
        if (hasPermission) {
          // 権限がある場合は位置情報を取得
          const locationData = await locationService.getCurrentLocation();
          setLocation(locationData);
          setError(null);
        } else {
          setError({
            code: 'PERMISSION_DENIED',
            message: '位置情報の使用を許可してください',
          });
        }
      } catch (err) {
        console.error('初期化エラー:', err);
        const locationError = err as LocationError;
        setError(locationError);
        
        if (locationError.code === 'PERMISSION_DENIED') {
          setHasPermission(false);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // アプリがフォアグラウンドに戻った時に権限を再確認
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App became active, checking permissions...');
        // アプリがアクティブになったら権限を再確認
        const nowHasPermission = await locationService.checkPermissions();
        console.log('Permission status:', nowHasPermission);
        
        if (nowHasPermission !== hasPermission) {
          setHasPermission(nowHasPermission);
        }
        
        if (nowHasPermission && !location) {
          console.log('Has permission, getting location...');
          setLoading(true);
          try {
            const locationData = await locationService.getCurrentLocation();
            setLocation(locationData);
            setError(null);
            console.log('Location obtained:', locationData);
          } catch (err) {
            console.error('Failed to get location:', err);
            const locationError = err as LocationError;
            setError(locationError);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [hasPermission, location]);

  return {
    location,
    loading,
    error,
    hasPermission,
    requestPermission,
    refreshLocation,
    openSettings,
  };
}