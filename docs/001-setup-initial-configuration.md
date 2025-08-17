# 001: プロジェクトセットアップと初期設定

## 概要
Expo React Nativeプロジェクトの初期セットアップと基本構成の実装

## 要件
- Expo SDK 53、React 19、TypeScript環境のセットアップ
- プロジェクト構造の整理
- 基本的な型定義の設定
- 必要なライブラリのインストール

## タスク

### 必須タスク
- [ ] プロジェクトの初期クリーンアップ
  - [ ] 不要なサンプルコードの削除
  - [ ] app-example/への既存コードの移動（必要に応じて）
- [ ] 基本的な型定義ファイルの作成
  - [ ] 天気データの型定義 (types/weather.ts)
  - [ ] API レスポンスの型定義 (types/api.ts)
- [ ] 定数ファイルの設定
  - [ ] API設定 (constants/api.ts)
  - [ ] 天気アイコンマッピング (constants/weatherIcons.ts)
- [ ] 環境変数の設定
  - [ ] .env.exampleファイルの作成
  - [ ] expo-constantsでの環境変数読み込み設定

### 依存ライブラリのインストール
- [ ] expo-location（位置情報取得）
- [ ] expo-secure-store（APIキーの安全な保存）
- [ ] @react-native-async-storage/async-storage（データキャッシュ）
- [ ] expo-linear-gradient（背景グラデーション）

## 実装詳細

### ディレクトリ構造
```
weather-app/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx（メイン画面）
│   └── _layout.tsx
├── components/
│   ├── weather/
│   │   ├── TodayWeather.tsx
│   │   ├── TomorrowWeather.tsx
│   │   └── RainProbability.tsx
│   └── ui/
│       └── GradientBackground.tsx
├── services/
│   ├── weatherApi.ts
│   ├── locationService.ts
│   └── cacheService.ts
├── types/
│   ├── weather.ts
│   └── api.ts
├── constants/
│   ├── Colors.ts（既存）
│   ├── api.ts
│   └── weatherIcons.ts
└── hooks/
    ├── useWeatherData.ts
    └── useLocation.ts
```

## 技術的考慮事項
- TypeScriptの厳密モードを有効化
- パスエイリアス（@/*）の活用
- Expo Routerの型付きルートの設定

## 完了基準
- [ ] プロジェクトが正常に起動する
- [ ] 型定義が正しく設定されている
- [ ] 必要なライブラリがインストールされている
- [ ] 環境変数が正しく設定されている

## 関連チケット
- 次: 002-location-service