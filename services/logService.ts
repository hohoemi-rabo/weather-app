/**
 * エラーログサービス
 * 開発環境ではコンソールに出力、本番環境では外部サービスに送信可能
 */

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
  stack?: string;
}

class LogService {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  /**
   * 情報ログ
   */
  info(message: string, details?: any) {
    this.addLog('info', message, details);
    console.log(`ℹ️ [INFO] ${message}`, details || '');
  }

  /**
   * 警告ログ
   */
  warn(message: string, details?: any) {
    this.addLog('warn', message, details);
    console.warn(`⚠️ [WARN] ${message}`, details || '');
  }

  /**
   * エラーログ
   */
  error(message: string, error?: any) {
    const stack = error?.stack || new Error().stack;
    this.addLog('error', message, error, stack);
    console.error(`❌ [ERROR] ${message}`, error || '');
  }

  /**
   * ログをメモリに追加
   */
  private addLog(level: LogEntry['level'], message: string, details?: any, stack?: string) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      details,
      stack,
    };

    this.logs.push(entry);

    // 最大ログ数を超えたら古いものから削除
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 本番環境では外部サービスに送信
    if (!__DEV__ && level === 'error') {
      this.sendToExternalService(entry);
    }
  }

  /**
   * 外部サービスへの送信（将来実装）
   */
  private sendToExternalService(entry: LogEntry) {
    // TODO: Sentry, Bugsnag, Firebase Crashlytics等への送信
    // 現時点では実装なし
  }

  /**
   * 最近のログを取得
   */
  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * エラーログのみ取得
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }

  /**
   * ログをクリア
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * ログをエクスポート（デバッグ用）
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logService = new LogService();