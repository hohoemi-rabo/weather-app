import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LocationPermission } from '@/components/LocationPermission';
import { TomorrowWeather } from '@/components/weather/TomorrowWeather';
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
    weatherData,
    todayWeather,
    tomorrowWeather,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeatherData({ location });


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
            {/* 今日の天気をインラインで表示 */}
            <ThemedView style={styles.todayContainer}>
              <ThemedText type="title" style={styles.todayTitle}>今日の天気</ThemedText>
              
              <ThemedText style={styles.weatherIcon}>
                {WEATHER_ICONS[todayWeather.weather]}
              </ThemedText>
              
              <ThemedText style={styles.weatherText}>
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
                      <ThemedText style={styles.rainTimeIcon}>
                        {['🌅', '☀️', '🌆', '🌙'][index]}
                      </ThemedText>
                      <ThemedText style={styles.rainPeriod}>{period}</ThemedText>
                      <ThemedText style={[
                        styles.rainValue,
                        todayWeather.rainChance[index] >= 70 && styles.rainHigh,
                        todayWeather.rainChance[index] >= 40 && todayWeather.rainChance[index] < 70 && styles.rainMedium
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
            
            {/* 最終更新時刻 */}
            {weatherData && (
              <ThemedView style={styles.updateTimeContainer}>
                <ThemedText style={styles.updateTime}>
                  最終更新: {new Date(weatherData.lastUpdate).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </ThemedText>
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
    marginBottom: 12,
    fontWeight: '500',
  },
  rainValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
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
});
