# 005: 明日の天気表示機能

## 概要
明日の天気情報をコンパクトに表示する機能の実装

## 要件
- 天気アイコンの表示
- 最高気温/最低気温の表示
- 今日の天気より控えめなサイズで表示

## タスク

### コンポーネント実装
- [ ] TomorrowWeatherコンポーネント (components/weather/TomorrowWeather.tsx)
  - [ ] 天気アイコンの表示（小サイズ）
  - [ ] 気温表示（最高/最低）
  - [ ] 横並びレイアウト
  - [ ] セクションタイトル「明日の天気」

### UI実装
- [ ] コンパクトなレイアウト設計
- [ ] 今日の天気との視覚的な差別化
- [ ] 適切な余白とサイズ調整

## 実装詳細

### TomorrowWeather.tsx
```typescript
interface TomorrowWeatherProps {
  weather: WeatherType;
  tempMax: number;
  tempMin: number;
}

// レイアウト構成（横並び）
<View style={styles.container}>
  <Text>明日の天気</Text>
  <View style={styles.content}>
    <WeatherIcon type={weather} size="small" />
    <Text>{tempMax}℃/{tempMin}℃</Text>
  </View>
</View>
```

### スタイリング要件
```typescript
const styles = {
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  }
}
```

## UI/UX要件
- 今日の天気の下部に配置
- 区切り線で視覚的に分離
- アイコンサイズは今日の天気の50%程度
- フォントサイズも今日より小さめ（14pt程度）

## レイアウト仕様
```
━━━━━━━━━━━━━━━
明日の天気
[☁️] 22℃/16℃
━━━━━━━━━━━━━━━
```

## 統合作業
- [ ] メイン画面への組み込み
- [ ] 今日の天気コンポーネントとの配置調整
- [ ] 全体のバランス確認

## アクセシビリティ
- [ ] 明日の天気であることを明確に示す
- [ ] 読み上げ時の順序を適切に設定

## テストケース
- [ ] 明日の天気データの表示
- [ ] 各天気タイプのアイコン表示
- [ ] レイアウトの崩れがないこと
- [ ] ダークモードでの表示

## 完了基準
- [ ] 明日の天気が正しく表示される
- [ ] UIが要件通りコンパクトである
- [ ] 今日の天気との差別化ができている
- [ ] 全体のレイアウトバランスが良い

## 関連チケット
- 前: 004-today-weather-display
- 次: 006-background-gradient-feature