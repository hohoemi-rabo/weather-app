# 002: 位置情報サービス機能

## 概要
ユーザーの現在地を取得し、天気情報取得のための位置情報管理機能を実装

## 要件
- GPSによる現在地の自動取得
- 位置情報の許可リクエスト処理
- 位置情報エラーのハンドリング

## タスク

### 必須タスク
- [ ] 位置情報サービスの実装 (services/locationService.ts)
  - [ ] 位置情報権限のリクエスト
  - [ ] 現在地の取得（緯度・経度）
  - [ ] エラーハンドリング
- [ ] useLocationカスタムフックの作成 (hooks/useLocation.ts)
  - [ ] 位置情報の状態管理
  - [ ] 権限状態の管理
  - [ ] エラー状態の管理
- [ ] 位置情報許可画面のUI実装
  - [ ] 許可前の説明画面
  - [ ] 設定画面への誘導ボタン

### エラー処理
- [ ] 位置情報が拒否された場合の処理
- [ ] GPSが無効な場合の処理
- [ ] タイムアウト処理（10秒）

## 実装詳細

### locationService.ts
```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationError {
  code: 'PERMISSION_DENIED' | 'GPS_DISABLED' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

// 主要メソッド
- requestPermissions(): Promise<boolean>
- getCurrentLocation(): Promise<LocationData>
- openLocationSettings(): void
```

### useLocation.ts
```typescript
interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}
```

## UI/UX要件
- 位置情報許可前に「なぜ位置情報が必要か」を説明
- 許可を求めるタイミングはアプリ初回起動時
- 拒否された場合も手動で地域選択できる代替案を将来実装予定

## 技術的考慮事項
- expo-locationの使用
- iOS/Android両対応の権限処理
- バックグラウンドでの位置情報取得は不要（フォアグラウンドのみ）

## テストケース
- [ ] 初回起動時の権限リクエスト
- [ ] 権限許可後の位置情報取得
- [ ] 権限拒否時のエラー表示
- [ ] GPS無効時のエラー表示
- [ ] 設定画面への遷移

## 完了基準
- [ ] 位置情報の権限リクエストが正常に動作する
- [ ] 現在地の緯度・経度が取得できる
- [ ] エラー時に適切なメッセージが表示される
- [ ] 設定画面への誘導が機能する

## 関連チケット
- 前: 001-setup-initial-configuration
- 次: 003-weather-api-integration