# 007: データキャッシュとオフライン対応

## 概要
天気データのキャッシュ機能とオフライン時のデータ表示機能の実装

## 要件
- AsyncStorageを使用したデータ永続化
- 1時間以内のデータ再利用
- オフライン時の最終データ表示
- キャッシュ有効期限の管理

## タスク

### キャッシュサービス実装
- [ ] CacheServiceの実装 (services/cacheService.ts)
  - [ ] データの保存機能
  - [ ] データの取得機能
  - [ ] 有効期限チェック
  - [ ] キャッシュクリア機能
- [ ] キャッシュ戦略の実装
  - [ ] 1時間以内のデータは再利用
  - [ ] 期限切れデータの自動削除
  - [ ] ストレージ容量管理

### オフライン対応
- [ ] ネットワーク状態の監視
  - [ ] オンライン/オフライン判定
  - [ ] 接続復帰時の自動更新
- [ ] オフライン時のUI表示
  - [ ] オフラインインジケーター
  - [ ] 最終更新時刻の強調表示
  - [ ] データの鮮度表示

## 実装詳細

### cacheService.ts
```typescript
interface CacheService {
  // データ保存
  saveWeatherData(key: string, data: WeatherData): Promise<void>;
  
  // データ取得
  getWeatherData(key: string): Promise<WeatherData | null>;
  
  // 有効期限チェック
  isDataFresh(timestamp: number, maxAge: number): boolean;
  
  // キャッシュクリア
  clearCache(): Promise<void>;
  
  // キャッシュサイズ取得
  getCacheSize(): Promise<number>;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

// キャッシュキー定義
const CACHE_KEYS = {
  WEATHER_DATA: 'weather_data',
  LOCATION: 'last_location',
  SETTINGS: 'app_settings'
};

// キャッシュ有効期限
const CACHE_DURATION = {
  WEATHER: 60 * 60 * 1000,    // 1時間
  LOCATION: 24 * 60 * 60 * 1000, // 24時間
};
```

### ネットワーク監視
```typescript
interface NetworkService {
  isOnline(): boolean;
  onConnectionChange(callback: (isOnline: boolean) => void): void;
}

// useNetworkStatus Hook
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  
  // ネットワーク状態の監視
  useEffect(() => {
    const subscription = NetworkService.onConnectionChange(setIsOnline);
    return () => subscription.unsubscribe();
  }, []);
  
  return { isOnline, lastOnlineTime };
}
```

### データ取得フロー
```typescript
async function getWeatherWithCache(location: Location) {
  // 1. キャッシュチェック
  const cached = await cacheService.getWeatherData(CACHE_KEYS.WEATHER_DATA);
  
  // 2. キャッシュが新鮮な場合は利用
  if (cached && cacheService.isDataFresh(cached.timestamp, CACHE_DURATION.WEATHER)) {
    return { data: cached.data, fromCache: true };
  }
  
  // 3. オンラインの場合はAPI取得
  if (networkService.isOnline()) {
    try {
      const fresh = await weatherApi.getWeather(location);
      await cacheService.saveWeatherData(CACHE_KEYS.WEATHER_DATA, fresh);
      return { data: fresh, fromCache: false };
    } catch (error) {
      // エラー時はキャッシュを返す
      if (cached) {
        return { data: cached.data, fromCache: true, stale: true };
      }
      throw error;
    }
  }
  
  // 4. オフライン時はキャッシュを返す
  if (cached) {
    return { data: cached.data, fromCache: true, offline: true };
  }
  
  throw new Error('No data available');
}
```

## UI表示要件

### オフラインインジケーター
```typescript
// オフライン時の表示
<View style={styles.offlineIndicator}>
  <Icon name="wifi-off" />
  <Text>オフライン - キャッシュデータを表示中</Text>
</View>

// データ鮮度の表示
<Text style={styles.lastUpdate}>
  最終更新: {formatRelativeTime(lastUpdateTime)}
  {isStale && " (古いデータ)"}
</Text>
```

## エラー処理
- [ ] ストレージ容量不足時の処理
- [ ] キャッシュ破損時の復旧
- [ ] バージョン不整合時の処理

## テストケース
- [ ] データの保存と取得
- [ ] 有効期限の判定
- [ ] オフライン時のデータ表示
- [ ] オンライン復帰時の更新
- [ ] キャッシュサイズ管理

## 完了基準
- [ ] データが正しくキャッシュされる
- [ ] オフライン時もデータが表示される
- [ ] キャッシュの有効期限が機能する
- [ ] ネットワーク状態が正しく表示される

## 関連チケット
- 前: 006-background-gradient-feature
- 次: 008-auto-update-feature