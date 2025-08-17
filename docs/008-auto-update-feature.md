# 008: 自動更新機能

## 概要
天気データの自動更新機能の実装（1時間ごと、アプリ起動時）

## 要件
- 1時間ごとの定期更新
- アプリ起動時の自動更新
- バックグラウンド更新は実装しない
- 最終更新時刻の表示

## タスク

### 自動更新ロジック
- [ ] UpdateServiceの実装 (services/updateService.ts)
  - [ ] 定期更新タイマー
  - [ ] 更新間隔の管理
  - [ ] 更新トリガー
- [ ] useAutoUpdateフックの実装 (hooks/useAutoUpdate.ts)
  - [ ] タイマー管理
  - [ ] アプリ状態の監視
  - [ ] 更新実行

### アプリライフサイクル連携
- [ ] アプリフォアグラウンド復帰時の更新
- [ ] アプリバックグラウンド移行時の処理
- [ ] タイマーのクリーンアップ

### UI表示
- [ ] 最終更新時刻の表示
- [ ] 更新中インジケーター
- [ ] 次回更新までの時間（オプション）

## 実装詳細

### updateService.ts
```typescript
interface UpdateService {
  // 更新スケジュール設定
  scheduleUpdate(interval: number): void;
  
  // 即座に更新
  updateNow(): Promise<void>;
  
  // 更新停止
  stopUpdates(): void;
  
  // 最終更新時刻取得
  getLastUpdateTime(): Date | null;
  
  // 次回更新時刻取得
  getNextUpdateTime(): Date | null;
}

const UPDATE_INTERVAL = 60 * 60 * 1000; // 1時間

class WeatherUpdateService implements UpdateService {
  private updateTimer: NodeJS.Timeout | null = null;
  private lastUpdate: Date | null = null;
  
  scheduleUpdate(interval: number = UPDATE_INTERVAL) {
    this.stopUpdates();
    
    this.updateTimer = setInterval(async () => {
      await this.updateNow();
    }, interval);
  }
  
  async updateNow() {
    try {
      // 位置情報取得
      const location = await locationService.getCurrentLocation();
      
      // 天気データ取得
      const weather = await weatherApi.getWeather(location);
      
      // キャッシュ保存
      await cacheService.saveWeatherData(weather);
      
      this.lastUpdate = new Date();
      
      return weather;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }
}
```

### useAutoUpdate.ts
```typescript
function useAutoUpdate(enabled: boolean = true) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const updateService = new WeatherUpdateService();
    
    // 初回更新
    updateService.updateNow().then(() => {
      setLastUpdate(new Date());
    });
    
    // 定期更新設定
    updateService.scheduleUpdate();
    
    // クリーンアップ
    return () => {
      updateService.stopUpdates();
    };
  }, [enabled]);
  
  // アプリ復帰時の更新
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // 最終更新から1時間以上経過していたら更新
        if (shouldUpdate(lastUpdate)) {
          handleUpdate();
        }
      }
    });
    
    return () => subscription.remove();
  }, [lastUpdate]);
  
  return { isUpdating, lastUpdate, nextUpdate };
}
```

### 更新タイミング判定
```typescript
function shouldUpdate(lastUpdate: Date | null): boolean {
  if (!lastUpdate) return true;
  
  const now = new Date();
  const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
  
  return timeSinceUpdate >= UPDATE_INTERVAL;
}

// アプリ起動時の処理
function onAppLaunch() {
  // キャッシュチェック
  const cached = await cacheService.getWeatherData();
  
  if (shouldUpdate(cached?.timestamp)) {
    // 1時間以上経過していれば更新
    await updateService.updateNow();
  } else {
    // キャッシュを使用
    useDataFromCache(cached);
  }
}
```

### 最終更新時刻の表示
```typescript
function LastUpdateTime({ timestamp }: { timestamp: Date }) {
  const [relativeTime, setRelativeTime] = useState('');
  
  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime(formatRelativeTime(timestamp));
    };
    
    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000); // 1分ごと
    
    return () => clearInterval(interval);
  }, [timestamp]);
  
  return (
    <Text style={styles.lastUpdate}>
      最終更新: {relativeTime}
    </Text>
  );
}

// 相対時間フォーマット
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  
  return date.toLocaleString('ja-JP');
}
```

## パフォーマンス考慮
- [ ] 不要な再レンダリングの防止
- [ ] メモリリークの防止
- [ ] バッテリー消費の最適化

## テストケース
- [ ] 1時間ごとの自動更新
- [ ] アプリ起動時の更新判定
- [ ] フォアグラウンド復帰時の更新
- [ ] タイマーのクリーンアップ
- [ ] 最終更新時刻の表示

## 完了基準
- [ ] 定期更新が正しく動作する
- [ ] アプリ起動時に適切に更新される
- [ ] 最終更新時刻が正しく表示される
- [ ] メモリリークがない

## 関連チケット
- 前: 007-data-caching-offline-support
- 次: 009-error-handling