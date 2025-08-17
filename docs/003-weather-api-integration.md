# 003: 天気API統合

## 概要
OpenWeatherMap APIと連携し、天気データを取得・処理する機能の実装

## 要件
- OpenWeatherMap APIとの連携
- 3時間ごとの予報データから必要な情報を抽出
- APIレスポンスのデータ変換処理
- API制限の管理（1日1000回）

## タスク

### 必須タスク
- [ ] API設定の実装
  - [ ] APIキーの環境変数設定
  - [ ] エンドポイントURLの定義
  - [ ] APIキーのセキュア保存（expo-secure-store）
- [ ] 天気APIサービスの実装 (services/weatherApi.ts)
  - [ ] 現在の天気データ取得
  - [ ] 5日間予報データ取得
  - [ ] レスポンスデータの変換処理
- [ ] データ変換ロジックの実装
  - [ ] 時間帯別降水確率の計算
  - [ ] 天気アイコンのマッピング
  - [ ] 温度の整数変換（四捨五入）
  - [ ] 日本語への翻訳

### API仕様
- [ ] Current Weather Data API
  - [ ] 現在の天気情報取得
- [ ] 5 Day / 3 Hour Forecast API
  - [ ] 今日の時間帯別データ取得
  - [ ] 明日の天気データ取得

## 実装詳細

### weatherApi.ts
```typescript
interface WeatherApiService {
  getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather>;
  getForecast(lat: number, lon: number): Promise<ForecastData>;
  getWeatherForToday(lat: number, lon: number): Promise<TodayWeather>;
  getWeatherForTomorrow(lat: number, lon: number): Promise<TomorrowWeather>;
}

interface CurrentWeather {
  temp: number;
  weather: WeatherType;
  description: string;
}

interface TodayWeather {
  weather: WeatherType;
  tempMax: number;
  tempMin: number;
  rainChance: [number, number, number, number]; // 朝昼夕夜
  hourlyWeather: WeatherType[];
}

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'thunder' | 'snow';
```

### データ変換ロジック
```typescript
// OpenWeatherMapのweather codeから内部形式への変換
- 200-299: 'thunder' (雷雨)
- 300-599: 'rainy' (雨)
- 600-699: 'snow' (雪)
- 700-799: 'cloudy' (霧・もや含む)
- 800: 'sunny' (晴れ)
- 801-804: 'cloudy' (曇り)

// 時間帯の判定
- 朝: 0-6時のデータ
- 昼: 6-12時のデータ
- 夕: 12-18時のデータ
- 夜: 18-24時のデータ
```

## APIレート制限対策
- リクエスト間隔を最低1時間あける
- 1日のリクエスト数をカウント
- 制限に近づいたら警告表示

## エラー処理
- [ ] API制限エラー（429）の処理
- [ ] ネットワークエラーの処理
- [ ] 無効なAPIキーエラーの処理
- [ ] タイムアウト処理（10秒）

## テストケース
- [ ] 正常な天気データ取得
- [ ] 各天気タイプのマッピング確認
- [ ] 時間帯別データの正確性
- [ ] エラーレスポンスの処理

## 完了基準
- [ ] APIからデータが正常に取得できる
- [ ] データが適切な形式に変換される
- [ ] エラー時に適切な処理が行われる
- [ ] API制限が管理されている

## 関連チケット
- 前: 002-location-service
- 次: 004-today-weather-display