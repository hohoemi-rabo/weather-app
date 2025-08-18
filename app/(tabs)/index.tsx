import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LocationPermission } from '@/components/LocationPermission';
import { useLocation } from '@/hooks/useLocation';
import { useWeatherData } from '@/hooks/useWeatherData';
import { WEATHER_ICONS } from '@/constants/weatherIcons';

export default function HomeScreen() {
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
    todayWeather,
    tomorrowWeather,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeatherData({ location });

  // デバッグ情報を表示
  console.log('HomeScreen render:', {
    hasPermission,
    locationLoading,
    locationError,
    location: location ? 'exists' : 'null',
    todayWeather: todayWeather ? 'exists' : 'null',
    weatherLoading
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
        <ThemedText type="title" style={styles.title}>今日の天気</ThemedText>
        
        {weatherLoading && !todayWeather ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>天気情報を取得中...</ThemedText>
          </ThemedView>
        ) : weatherError ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>⚠️ 天気情報を取得できませんでした</ThemedText>
            <ThemedText style={styles.errorDetail}>{weatherError.message}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refreshWeather}>
              <ThemedText style={styles.retryButtonText}>再試行</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : todayWeather ? (
          <ThemedView style={styles.weatherContainer}>
            {/* 今日の天気 */}
            <ThemedView style={styles.todayWeatherSection}>
              <ThemedText style={styles.weatherIcon}>
                {WEATHER_ICONS[todayWeather.weather]}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.weatherText}>
                {todayWeather.weatherText}
              </ThemedText>
              <ThemedView style={styles.tempContainer}>
                <ThemedText style={styles.tempMax}>{todayWeather.tempMax}°</ThemedText>
                <ThemedText style={styles.tempSeparator}>/</ThemedText>
                <ThemedText style={styles.tempMin}>{todayWeather.tempMin}°</ThemedText>
              </ThemedView>
              
              {/* 降水確率 */}
              <ThemedView style={styles.rainSection}>
                <ThemedText style={styles.rainTitle}>降水確率</ThemedText>
                <ThemedView style={styles.rainGrid}>
                  {['朝', '昼', '夕', '夜'].map((period, index) => (
                    <ThemedView key={period} style={styles.rainItem}>
                      <ThemedText style={styles.rainPeriod}>{period}</ThemedText>
                      <ThemedText style={styles.rainValue}>
                        {todayWeather.rainChance[index]}%
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            {/* 明日の天気 */}
            {tomorrowWeather && (
              <ThemedView style={styles.tomorrowSection}>
                <ThemedText style={styles.tomorrowTitle}>明日の天気</ThemedText>
                <ThemedView style={styles.tomorrowContent}>
                  <ThemedText style={styles.tomorrowIcon}>
                    {WEATHER_ICONS[tomorrowWeather.weather]}
                  </ThemedText>
                  <ThemedText style={styles.tomorrowTemp}>
                    {tomorrowWeather.tempMax}° / {tomorrowWeather.tempMin}°
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
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
  todayWeatherSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  weatherIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  weatherText: {
    fontSize: 24,
    marginBottom: 15,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 30,
  },
  tempMax: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  tempSeparator: {
    fontSize: 30,
    marginHorizontal: 5,
    opacity: 0.5,
  },
  tempMin: {
    fontSize: 36,
    opacity: 0.7,
  },
  rainSection: {
    width: '100%',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  rainTitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.8,
  },
  rainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rainItem: {
    alignItems: 'center',
  },
  rainPeriod: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 5,
  },
  rainValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tomorrowSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 30,
    paddingTop: 20,
  },
  tomorrowTitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 10,
  },
  tomorrowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tomorrowIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  tomorrowTemp: {
    fontSize: 20,
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
});
