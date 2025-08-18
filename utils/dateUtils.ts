/**
 * 相対時間をフォーマット（日本語）
 */
export function formatRelativeTime(date: Date | number): string {
  const timestamp = typeof date === 'number' ? date : date.getTime();
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  
  // 7日以上前の場合は日付を表示
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 次回更新までの時間をフォーマット
 */
export function formatTimeUntilUpdate(nextUpdate: Date): string {
  const now = Date.now();
  const diff = nextUpdate.getTime() - now;
  
  if (diff <= 0) return '更新中...';
  
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'まもなく更新';
  if (minutes < 60) return `${minutes}分後に更新`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}時間後に更新`;
  }
  
  return `${hours}時間${remainingMinutes}分後に更新`;
}

/**
 * 更新が必要かチェック
 */
export function shouldUpdate(lastUpdate: Date | number | null, intervalMs: number): boolean {
  if (!lastUpdate) return true;
  
  const timestamp = typeof lastUpdate === 'number' ? lastUpdate : lastUpdate.getTime();
  const now = Date.now();
  const timeSinceUpdate = now - timestamp;
  
  return timeSinceUpdate >= intervalMs;
}