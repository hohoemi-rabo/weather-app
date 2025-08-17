import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LocationPermission } from '@/components/LocationPermission';
import { useLocation } from '@/hooks/useLocation';

export default function HomeScreen() {
  const {
    location,
    loading,
    error,
    hasPermission,
    requestPermission,
    refreshLocation,
    openSettings,
  } = useLocation();

  // デバッグ情報を表示
  console.log('HomeScreen render:', {
    hasPermission,
    loading,
    error,
    location: location ? 'exists' : 'null'
  });

  // 位置情報の権限がない場合のみ権限画面を表示
  // エラーがあっても権限があれば再試行可能にする
  if (hasPermission === false) {
    return (
      <LocationPermission
        error={error}
        hasPermission={hasPermission}
        loading={loading}
        onRequestPermission={requestPermission}
        onOpenSettings={openSettings}
      />
    );
  }

  // ローディング中
  if (loading && !location) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText>位置情報を取得中...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>今日の天気</ThemedText>
        
        {location ? (
          <ThemedView style={styles.locationInfo}>
            <ThemedText style={styles.locationText}>
              📍 位置情報取得成功
            </ThemedText>
            <ThemedText style={styles.coordinates}>
              緯度: {location.latitude.toFixed(4)}
            </ThemedText>
            <ThemedText style={styles.coordinates}>
              経度: {location.longitude.toFixed(4)}
            </ThemedText>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
              <ThemedText style={styles.refreshButtonText}>位置情報を更新</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.placeholder}>
              位置情報を取得できませんでした
            </ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
              <ThemedText style={styles.retryButtonText}>再試行</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
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
});
