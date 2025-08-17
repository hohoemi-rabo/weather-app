# 006: 背景グラデーション機能

## 概要
1日の天気変化を背景色のグラデーションで表現する機能の実装

## 要件
- 朝・昼・夜の天気に基づいたグラデーション生成
- 天気タイプごとの色定義
- 動的な背景更新

## タスク

### コンポーネント実装
- [ ] GradientBackgroundコンポーネント (components/ui/GradientBackground.tsx)
  - [ ] expo-linear-gradientの実装
  - [ ] 天気に応じた色の計算
  - [ ] アニメーション効果（オプション）
- [ ] グラデーション色定義 (constants/gradientColors.ts)
  - [ ] 天気タイプ別の色設定
  - [ ] 時間帯別の色調整

### ロジック実装
- [ ] グラデーション計算ロジック
  - [ ] 朝（6時）、昼（12時）、夜（18時）の天気取得
  - [ ] 優先順位による色決定（雨 > 曇り > 晴れ）
  - [ ] 多色グラデーションの生成

## 実装詳細

### gradientColors.ts
```typescript
const weatherGradients = {
  sunny: {
    top: '#87CEEB',    // スカイブルー
    bottom: '#FFB347'  // オレンジ
  },
  cloudy: {
    top: '#B0B0B0',    // 濃いグレー
    bottom: '#D3D3D3'  // 薄いグレー
  },
  rainy: {
    top: '#4A4A4A',    // ダークグレー
    bottom: '#8A8A8A'  // ライトグレー
  },
  thunder: {
    top: '#2C2C2C',    // ほぼ黒
    bottom: '#5A5A5A'  // ミディアムグレー
  }
};
```

### GradientBackground.tsx
```typescript
interface GradientBackgroundProps {
  hourlyWeather: WeatherType[];
  children: React.ReactNode;
}

// グラデーション計算ロジック
function calculateGradientColors(hourlyWeather: WeatherType[]) {
  const morning = hourlyWeather[6];  // 6時
  const noon = hourlyWeather[12];    // 12時
  const evening = hourlyWeather[18]; // 18時
  
  // 優先順位で判定
  const dominantWeather = getDominantWeather([morning, noon, evening]);
  
  // 複数の天気がある場合は中間色を計算
  return interpolateColors(morning, noon, evening);
}
```

### 判定ロジック
```typescript
// 天気の優先順位
const weatherPriority = {
  thunder: 4,
  rainy: 3,
  cloudy: 2,
  sunny: 1
};

// 支配的な天気を判定
function getDominantWeather(weathers: WeatherType[]): WeatherType {
  return weathers.reduce((dominant, current) => 
    weatherPriority[current] > weatherPriority[dominant] 
      ? current 
      : dominant
  );
}
```

## UI/UX要件
- グラデーションは画面全体の背景として適用
- コンテンツの視認性を保つため透明度調整
- 滑らかな色の遷移
- パフォーマンスを考慮した実装

## アニメーション（オプション）
- [ ] 天気更新時のグラデーション遷移
- [ ] フェードイン/フェードアウト効果
- [ ] 実行時間：1-2秒

## ダークモード対応
- [ ] ダークモード時の色調整
- [ ] コントラスト比の確保
- [ ] 視認性の維持

## テストケース
- [ ] 各天気タイプのグラデーション表示
- [ ] 複数天気の組み合わせ
- [ ] パフォーマンステスト
- [ ] ダークモードでの表示

## 完了基準
- [ ] 天気に応じたグラデーションが表示される
- [ ] 色の遷移が自然である
- [ ] コンテンツの視認性が保たれている
- [ ] パフォーマンスに問題がない

## 関連チケット
- 前: 005-tomorrow-weather-display
- 次: 007-data-caching-offline-support