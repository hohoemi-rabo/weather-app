/**
 * テスト用ユーティリティ関数
 */

import { WeatherData, TodayWeather, TomorrowWeather } from '@/types/weather';

/**
 * テスト用の天気データを生成
 */
export function createMockWeatherData(): WeatherData {
  const todayWeather: TodayWeather = {
    weather: 'sunny',
    weatherText: '晴れ',
    tempMax: 25,
    tempMin: 18,
    rainChance: [10, 20, 30, 40],
    hourlyWeather: ['sunny', 'cloudy', 'sunny'],
  };

  const tomorrowWeather: TomorrowWeather = {
    weather: 'cloudy',
    tempMax: 22,
    tempMin: 16,
  };

  return {
    todayWeather,
    tomorrowWeather,
    lastUpdate: Date.now(),
  };
}

/**
 * パフォーマンステスト用の関数
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (!__DEV__) {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  const duration = end - start;
  
  console.log(`⏱️ [${name}] 実行時間: ${duration.toFixed(2)}ms`);
  
  if (duration > 100) {
    console.warn(`⚠️ [${name}] パフォーマンス警告: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * メモリ使用量をチェック
 */
export function checkMemoryUsage(label: string = 'Memory Check') {
  if (!__DEV__ || typeof window === 'undefined' || !window.performance?.memory) {
    return;
  }

  const memory = (window.performance as any).memory;
  const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
  const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
  const percentage = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
  
  console.log(`💾 [${label}] メモリ使用量: ${usedMB}MB / ${totalMB}MB (${percentage}%)`);
  
  if (percentage > 80) {
    console.warn(`⚠️ [${label}] メモリ使用量が多いです: ${percentage}%`);
  }
}

/**
 * アクセシビリティのテスト支援
 */
export function validateAccessibility() {
  if (!__DEV__) return;

  // React Nativeではdocumentが存在しないため、Webのみで実行
  if (typeof document === 'undefined') {
    console.log('♿ A11Y: React Native環境ではアクセシビリティチェックは手動で実施');
    return;
  }

  // タップ領域の最小サイズチェック
  const checkTouchTargets = () => {
    const buttons = document.querySelectorAll('button, [role="button"]');
    const minSize = 44; // 44pt minimum touch target

    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        console.warn(`⚠️ A11Y: ボタン ${index} のタップ領域が小さすぎます (${rect.width}x${rect.height})`);
      }
    });
  };

  // アクセシビリティラベルのチェック
  const checkAccessibilityLabels = () => {
    const interactiveElements = document.querySelectorAll('button, [role="button"], input, select');
    
    interactiveElements.forEach((element, index) => {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      element.textContent?.trim();
      
      if (!hasLabel) {
        console.warn(`⚠️ A11Y: 要素 ${index} にアクセシビリティラベルがありません`);
      }
    });
  };

  setTimeout(() => {
    checkTouchTargets();
    checkAccessibilityLabels();
  }, 1000);
}

/**
 * 機能テスト用のヘルパー
 */
export const TestHelpers = {
  /**
   * 位置情報のモック
   */
  mockLocation: {
    latitude: 35.6762,
    longitude: 139.6503, // 東京
    timestamp: Date.now(),
  },

  /**
   * エラーのモック
   */
  mockErrors: {
    locationTimeout: {
      code: 'TIMEOUT',
      message: '位置情報の取得がタイムアウトしました',
    },
    apiError: new Error('API Error: 500 Internal Server Error'),
    networkError: new Error('Network Error: Failed to fetch'),
  },

  /**
   * 待機用のヘルパー
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

/**
 * デバッグ情報を出力
 */
export function debugInfo() {
  if (!__DEV__) return;

  console.group('🔍 Debug Info');
  console.log('Platform:', process.env.NODE_ENV);
  
  // React Native環境チェック
  if (typeof window !== 'undefined') {
    console.log('User Agent:', navigator?.userAgent || 'N/A');
    console.log('Screen Size:', window.screen ? `${window.screen.width}x${window.screen.height}` : 'N/A');
    console.log('Viewport Size:', `${window.innerWidth}x${window.innerHeight}`);
    
    if (window.performance?.memory) {
      checkMemoryUsage('Debug Info');
    }
  } else {
    console.log('Environment: React Native');
  }
  
  console.groupEnd();
}