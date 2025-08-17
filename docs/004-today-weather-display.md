# 004: 今日の天気表示機能

## 概要
今日の天気情報をメイン画面に表示する機能の実装

## 要件
- 天気アイコンの大きな表示
- 天気テキスト（晴れ、曇り、雨など）
- 最高気温/最低気温の表示
- 時間帯別降水確率の表示（朝・昼・夕・夜）

## タスク

### コンポーネント実装
- [ ] TodayWeatherコンポーネント (components/weather/TodayWeather.tsx)
  - [ ] 天気アイコンの表示
  - [ ] 天気テキストの表示
  - [ ] 気温表示（最高/最低）
  - [ ] レイアウト調整
- [ ] RainProbabilityコンポーネント (components/weather/RainProbability.tsx)
  - [ ] 時間帯ラベル（朝・昼・夕・夜）
  - [ ] パーセンテージ表示
  - [ ] ビジュアル表現（バーグラフなど）
- [ ] WeatherIconコンポーネント (components/weather/WeatherIcon.tsx)
  - [ ] 天気タイプに応じたアイコン表示
  - [ ] アニメーション効果（オプション）

### データ連携
- [ ] useWeatherDataフックの実装 (hooks/useWeatherData.ts)
  - [ ] 天気データの取得
  - [ ] ローディング状態の管理
  - [ ] エラー状態の管理
- [ ] メイン画面との統合 (app/(tabs)/index.tsx)

## 実装詳細

### TodayWeather.tsx
```typescript
interface TodayWeatherProps {
  weather: WeatherType;
  weatherText: string;
  tempMax: number;
  tempMin: number;
  rainChance: [number, number, number, number];
}

// レイアウト構成
<View>
  <Text>今日の天気</Text>
  <WeatherIcon type={weather} size="large" />
  <Text>{weatherText}</Text>
  <View>
    <Text>{tempMax}℃ / {tempMin}℃</Text>
  </View>
  <RainProbability data={rainChance} />
</View>
```

### 天気アイコンマッピング
```typescript
const weatherIcons = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  thunder: '⛈️',
  snow: '❄️'
};
```

### RainProbability.tsx
```typescript
interface RainProbabilityProps {
  data: [number, number, number, number];
}

// 時間帯ラベル
const timeLabels = ['朝', '昼', '夕', '夜'];

// 表示形式
朝    昼    夕    夜
0%   10%   30%   60%
[バーグラフまたはビジュアル表現]
```

## UI/UX要件
- 天気アイコンは画面中央に大きく配置
- フォントサイズは視認性を重視（最低16pt以上）
- 降水確率は横並びで均等配置
- 色使いはシンプルに（背景色との調和）

## スタイリング
- ThemedTextとThemedViewの活用
- ダークモード対応
- レスポンシブレイアウト（各画面サイズ対応）

## アクセシビリティ
- [ ] 天気アイコンにaccessibilityLabel追加
- [ ] 気温情報の読み上げ対応
- [ ] 降水確率の読み上げ対応

## テストケース
- [ ] 各天気タイプの表示確認
- [ ] 気温の正しい表示
- [ ] 降水確率の表示
- [ ] データなし状態の表示
- [ ] ローディング状態の表示

## 完了基準
- [ ] 今日の天気情報が正しく表示される
- [ ] レイアウトが要件通りに配置されている
- [ ] ダークモード対応が完了している
- [ ] アクセシビリティ対応が完了している

## 関連チケット
- 前: 003-weather-api-integration
- 次: 005-tomorrow-weather-display