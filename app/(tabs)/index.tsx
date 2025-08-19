import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LocationPermission } from '@/components/LocationPermission';
import { TomorrowWeather } from '@/components/weather/TomorrowWeather';
import { AutoUpdateSettings } from '@/components/AutoUpdateSettings';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ErrorMessage } from '@/components/ErrorMessage';
import { WeatherSkeleton } from '@/components/SkeletonLoader';
import { FadeInView } from '@/components/FadeInView';
import { useLocation } from '@/hooks/useLocation';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { WEATHER_ICONS } from '@/constants/weatherIcons';
import { cacheService } from '@/services/cacheService';
import { errorService } from '@/services/errorService';
import { formatRelativeTime } from '@/utils/dateUtils';
import { debugInfo, validateAccessibility } from '@/utils/testUtils';

export default function HomeScreen() {
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  
  // パフォーマンス監視（開発環境のみ）
  usePerformanceMonitor();

  // 開発環境でのデバッグ情報表示
  React.useEffect(() => {
    if (__DEV__) {
      debugInfo();
      validateAccessibility();
    }
  }, []);
  
  const {
    location,
    loading: locationLoading,
    error: locationError,
    hasPermission,
    requestPermission,
    refreshLocation,
    openSettings,
  } = useLocation();

  const {
    weatherData,
    todayWeather,
    tomorrowWeather,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
    isFromCache,
    isStale,
    isOffline,
  } = useWeatherData({ location });

  // 自動更新機能
  const { isUpdating } = useAutoUpdate({
    onUpdate: refreshWeather,
    enabled: autoUpdateEnabled && !!location && !isOffline,
  });


  // リフレッシュ処理（位置情報がある場合は天気のみ更新）
  const handleRefresh = async () => {
    if (location) {
      // 位置情報がある場合は天気データのみ更新
      await refreshWeather();
    } else {
      // 位置情報がない場合は両方更新
      await refreshLocation();
      // 位置情報取得後、自動的に天気データも更新される
    }
  };

  // 降水確率の色を計算（memoized）
  const rainChanceColors = useMemo(() => {
    if (!todayWeather) return [];
    
    return todayWeather.rainChance.map((chance) => {
      if (chance >= 70) return styles.rainHigh;
      if (chance >= 40) return styles.rainMedium;
      return null;
    });
  }, [todayWeather?.rainChance]);

  // キャッシュクリア（デバッグ用）
  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'キャッシュクリア',
      'キャッシュをクリアして最新データを取得しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'クリア',
          style: 'destructive',
          onPress: async () => {
            await cacheService.clearAllCache();
            await refreshWeather();
            Alert.alert('完了', 'キャッシュをクリアしました');
          },
        },
      ]
    );
  }, [refreshWeather]);

  // 位置情報の権限がない場合のみ権限画面を表示
  // エラーがあっても権限があれば再試行可能にする
  if (hasPermission === false) {
    return (
      <LocationPermission
        error={locationError}
        hasPermission={hasPermission}
        loading={locationLoading}
        onRequestPermission={requestPermission}
        onOpenSettings={openSettings}
      />
    );
  }

  // ローディング中
  if (locationLoading && !location) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>位置情報を取得中...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }
  
  // 位置情報エラー（権限はあるが取得失敗）
  if (hasPermission && locationError && !location) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ErrorMessage 
            error={errorService.classifyError(locationError)}
            onRetry={refreshLocation}
          />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={weatherLoading || locationLoading}
          onRefresh={handleRefresh}
        />
      }
    >
      <ThemedView style={styles.content}>
        
        {weatherLoading && !todayWeather ? (
          <WeatherSkeleton />
        ) : weatherError ? (
          <ErrorMessage 
            error={errorService.classifyError(weatherError)}
            onRetry={refreshWeather}
          />
        ) : todayWeather ? (
          <FadeInView style={{ flex: 1, width: '100%' }}>
            <ThemedView style={styles.weatherContainer}>
            {/* 今日の天気をインラインで表示 */}
            <ThemedView 
              style={styles.todayContainer}
              accessibilityRole="summary"
              accessibilityLabel={`今日の天気: ${todayWeather.weatherText}、最高気温${todayWeather.tempMax}度、最低気温${todayWeather.tempMin}度`}
            >
              <ThemedText type="title" style={styles.todayTitle}>今日の天気</ThemedText>
              
              <ThemedText 
                style={styles.weatherIcon}
                accessibilityLabel={`天気アイコン: ${todayWeather.weatherText}`}
                accessibilityRole="image"
              >
                {WEATHER_ICONS[todayWeather.weather]}
              </ThemedText>
              
              <ThemedText style={styles.weatherText}>
                {todayWeather.weatherText}
              </ThemedText>
              
              <ThemedView 
                style={styles.tempContainer}
                accessibilityLabel={`気温: 最高${todayWeather.tempMax}度、最低${todayWeather.tempMin}度`}
              >
                <ThemedText style={styles.tempMax}>{todayWeather.tempMax}°</ThemedText>
                <ThemedText style={styles.tempSeparator}>/</ThemedText>
                <ThemedText style={styles.tempMin}>{todayWeather.tempMin}°</ThemedText>
              </ThemedView>
              
              {/* 降水確率 */}
              <ThemedView 
                style={styles.rainSection}
                accessibilityLabel="時間帯別降水確率"
              >
                <ThemedText style={styles.rainTitle}>降水確率</ThemedText>
                <ThemedView style={styles.rainGrid}>
                  {['朝', '昼', '夕', '夜'].map((period, index) => (
                    <ThemedView 
                      key={period} 
                      style={styles.rainItem}
                      accessibilityLabel={`${period}の降水確率: ${todayWeather.rainChance[index]}パーセント`}
                      accessibilityRole="text"
                    >
                      <ThemedText 
                        style={styles.rainTimeIcon}
                        accessibilityLabel={`${period}のアイコン`}
                        accessibilityRole="image"
                      >
                        {['🌅', '☀️', '🌆', '🌙'][index]}
                      </ThemedText>
                      <ThemedText style={styles.rainPeriod}>{period}</ThemedText>
                      <ThemedText style={[
                        styles.rainValue,
                        rainChanceColors[index]
                      ]}>
                        {todayWeather.rainChance[index]}%
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            {/* 明日の天気 - 専用コンポーネント使用 */}
            {tomorrowWeather && (
              <TomorrowWeather weather={tomorrowWeather} />
            )}
            
            {/* 自動更新設定 */}
            <AutoUpdateSettings
              enabled={autoUpdateEnabled}
              onToggle={setAutoUpdateEnabled}
            />
            
            {/* ダークモード切り替え */}
            <ThemeToggle />
            
            {/* 最終更新時刻とステータス */}
            {weatherData && (
              <ThemedView style={styles.updateTimeContainer}>
                {isOffline && (
                  <ThemedView style={styles.offlineIndicator}>
                    <ThemedText style={styles.offlineText}>📵 オフライン</ThemedText>
                  </ThemedView>
                )}
                <TouchableOpacity onLongPress={handleClearCache}>
                  <ThemedText style={[
                    styles.updateTime,
                    isStale && styles.staleText
                  ]}>
                    最終更新: {weatherData.lastUpdate ? formatRelativeTime(weatherData.lastUpdate) : '---'}
                    {isFromCache && ' (キャッシュ)'}
                    {isStale && ' ⚠️'}
                    {isUpdating && ' 🔄'}
                  </ThemedText>
                </TouchableOpacity>
                {isUpdating && (
                  <ThemedView style={styles.updatingIndicator}>
                    <ActivityIndicator size="small" />
                    <ThemedText style={styles.updatingText}>更新中...</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            )}
          </ThemedView>
          </FadeInView>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>天気情報を取得できません</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  placeholder: {
    fontSize: 16,
    opacity: 0.6,
  },
  locationInfo: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  locationText: {
    fontSize: 18,
    marginBottom: 10,
  },
  coordinates: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  refreshButton: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    opacity: 0.7,
  },
  weatherContainer: {
    width: '100%',
    alignItems: 'center',
  },
  todayContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 5,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },
  weatherIcon: {
    fontSize: 100,
    lineHeight: 120,
    marginVertical: 5,
  },
  weatherText: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 0,
    marginBottom: 10,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 25,
    paddingHorizontal: 10,
  },
  tempMax: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  tempSeparator: {
    fontSize: 30,
    marginHorizontal: 8,
    opacity: 0.4,
    lineHeight: 36,
  },
  tempMin: {
    fontSize: 36,
    opacity: 0.7,
    lineHeight: 40,
  },
  rainSection: {
    width: '100%',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  rainTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  rainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rainItem: {
    alignItems: 'center',
    flex: 1,
  },
  rainTimeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  rainPeriod: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
    fontWeight: '500',
  },
  rainValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rainHigh: {
    color: '#FF3B30',
  },
  rainMedium: {
    color: '#FF9500',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  updateTimeContainer: {
    marginTop: 25,
    paddingTop: 15,
    paddingBottom: 20,
  },
  updateTime: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  staleText: {
    color: '#FF9500',
  },
  updatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  updatingText: {
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.7,
  },
});
