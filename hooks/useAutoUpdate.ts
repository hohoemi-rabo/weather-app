import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAutoUpdateProps {
  onUpdate: () => Promise<void>;
  updateInterval?: number;
  enabled?: boolean;
}

// デフォルトの更新間隔（1時間）
const DEFAULT_UPDATE_INTERVAL = 60 * 60 * 1000;

export function useAutoUpdate({
  onUpdate,
  updateInterval = DEFAULT_UPDATE_INTERVAL,
  enabled = true,
}: UseAutoUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastAutoUpdate, setLastAutoUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // 更新を実行
  const performUpdate = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('自動更新を実行中...');
      await onUpdate();
      
      const now = new Date();
      setLastAutoUpdate(now);
      setNextUpdate(new Date(now.getTime() + updateInterval));
      
      console.log('自動更新完了');
    } catch (error) {
      console.error('自動更新エラー:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 更新が必要かチェック
  const shouldUpdate = (lastUpdate: Date | null): boolean => {
    if (!lastUpdate) return true;
    
    const now = new Date();
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
    
    return timeSinceUpdate >= updateInterval;
  };

  // 定期更新の設定
  useEffect(() => {
    if (!enabled) {
      // 無効化されたらタイマーをクリア
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 初回チェック（最後の更新から1時間以上経過していたら更新）
    if (shouldUpdate(lastAutoUpdate)) {
      performUpdate();
    }

    // 定期更新タイマーを設定
    intervalRef.current = setInterval(() => {
      console.log('定期更新チェック...');
      performUpdate();
    }, updateInterval);

    // クリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, updateInterval]);

  // アプリの状態変化を監視
  useEffect(() => {
    if (!enabled) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('アプリ状態変化:', appStateRef.current, '->', nextAppState);
      
      // バックグラウンドからフォアグラウンドに復帰した場合
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('アプリがフォアグラウンドに復帰');
        
        // 最終更新から更新間隔以上経過していたら更新
        if (shouldUpdate(lastAutoUpdate)) {
          console.log('復帰時の自動更新を実行');
          performUpdate();
        }
      }
      
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, lastAutoUpdate, updateInterval]);

  return {
    isUpdating,
    lastAutoUpdate,
    nextUpdate,
  };
}