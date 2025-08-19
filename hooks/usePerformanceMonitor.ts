import { useEffect } from 'react';

/**
 * パフォーマンス監視フック（開発環境のみ）
 */
export function usePerformanceMonitor() {
  useEffect(() => {
    if (!__DEV__) return;

    let renderCount = 0;
    const componentName = 'HomeScreen';

    renderCount++;
    console.log(`🔄 ${componentName} render count: ${renderCount}`);

    // 初回レンダリング時間を測定
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // 100ms以上の場合警告
        console.warn(`⚠️ ${componentName} 遅いレンダリング: ${renderTime.toFixed(2)}ms`);
      } else {
        console.log(`✅ ${componentName} レンダリング時間: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  // メモリ使用量監視（Web環境のみ）
  useEffect(() => {
    if (!__DEV__) return;
    
    // React Native環境ではwindow.performanceが利用できない
    if (typeof window === 'undefined' || !window.performance?.memory) {
      console.log('💾 メモリ監視: React Native環境では利用できません');
      return;
    }

    const checkMemory = () => {
      const memory = (window.performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      
      console.log(`💾 メモリ使用量: ${usedMB}MB / ${totalMB}MB`);
      
      if (usedMB > 100) {
        console.warn(`⚠️ メモリ使用量が多いです: ${usedMB}MB`);
      }
    };

    // 10秒ごとにメモリチェック
    const interval = setInterval(checkMemory, 10000);
    
    return () => clearInterval(interval);
  }, []);
}

/**
 * レンダリング回数を追跡するフック
 */
export function useRenderCount(componentName: string) {
  useEffect(() => {
    if (!__DEV__) return;
    
    // React Native環境でも動作するようにグローバル変数を使用
    const globalObj = typeof window !== 'undefined' ? window : global;
    const count = (globalObj as any)[`${componentName}_renderCount`] || 0;
    (globalObj as any)[`${componentName}_renderCount`] = count + 1;
    
    console.log(`🔄 ${componentName} レンダリング回数: ${count + 1}`);
  });
}