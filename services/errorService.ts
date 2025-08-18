import { Linking } from 'react-native';
import { LocationError } from '@/types/weather';
import { logService } from './logService';

// エラータイプの定義
export enum ErrorType {
  LOCATION_PERMISSION = 'LOCATION_PERMISSION',
  LOCATION_TIMEOUT = 'LOCATION_TIMEOUT',
  GPS_DISABLED = 'GPS_DISABLED',
  API_AUTH = 'API_AUTH',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_SERVER = 'API_SERVER',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

// エラーアクション
export interface ErrorAction {
  label: string;
  handler: () => void | Promise<void>;
}

// アプリエラー
export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  action?: ErrorAction;
  canRetry: boolean;
  originalError?: unknown;
}

// リトライオプション
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
  shouldRetry?: (error: unknown) => boolean;
}

class ErrorService {
  // エラー分類
  classifyError(error: unknown): AppError {
    // エラーをログに記録
    logService.error('エラーが発生しました', error);
    // 位置情報エラー
    if (this.isLocationError(error)) {
      return this.handleLocationError(error as LocationError);
    }
    
    // APIエラー
    if (this.isApiError(error)) {
      return this.handleApiError(error);
    }
    
    // ネットワークエラー
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error);
    }
    
    // 不明なエラー
    return this.handleUnknownError(error);
  }

  // 位置情報エラーの判定
  private isLocationError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as any).code === 'string' &&
      ['PERMISSION_DENIED', 'GPS_DISABLED', 'TIMEOUT'].includes((error as any).code)
    );
  }

  // APIエラーの判定
  private isApiError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('API') || error.message.includes('401') || error.message.includes('429');
    }
    return false;
  }

  // ネットワークエラーの判定
  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('Network') || 
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch')
      );
    }
    return false;
  }

  // 位置情報エラー処理
  private handleLocationError(error: LocationError): AppError {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return {
          type: ErrorType.LOCATION_PERMISSION,
          message: error.message,
          userMessage: '位置情報の使用を許可してください。設定から変更できます。',
          action: {
            label: '設定を開く',
            handler: () => Linking.openSettings()
          },
          canRetry: false,
          originalError: error
        };
      
      case 'GPS_DISABLED':
        return {
          type: ErrorType.GPS_DISABLED,
          message: error.message,
          userMessage: 'GPSを有効にしてください',
          action: {
            label: '設定を開く',
            handler: () => Linking.openSettings()
          },
          canRetry: false,
          originalError: error
        };
      
      case 'TIMEOUT':
        return {
          type: ErrorType.LOCATION_TIMEOUT,
          message: error.message,
          userMessage: '位置情報の取得に時間がかかっています。しばらくお待ちください。',
          canRetry: true,
          originalError: error
        };
      
      default:
        return {
          type: ErrorType.UNKNOWN,
          message: error.message,
          userMessage: '位置情報の取得に失敗しました',
          canRetry: true,
          originalError: error
        };
    }
  }

  // APIエラー処理
  private handleApiError(error: unknown): AppError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('401')) {
      return {
        type: ErrorType.API_AUTH,
        message: errorMessage,
        userMessage: 'APIキーが無効です。設定を確認してください。',
        canRetry: false,
        originalError: error
      };
    }
    
    if (errorMessage.includes('429')) {
      return {
        type: ErrorType.API_RATE_LIMIT,
        message: errorMessage,
        userMessage: 'API制限に達しました。しばらくお待ちください。',
        canRetry: false,
        originalError: error
      };
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return {
        type: ErrorType.API_SERVER,
        message: errorMessage,
        userMessage: 'サーバーエラーが発生しました。しばらく経ってから再試行してください。',
        canRetry: true,
        originalError: error
      };
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: errorMessage,
      userMessage: '天気データの取得に失敗しました',
      canRetry: true,
      originalError: error
    };
  }

  // ネットワークエラー処理
  private handleNetworkError(error: unknown): AppError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      type: ErrorType.NETWORK_OFFLINE,
      message: errorMessage,
      userMessage: 'インターネット接続を確認してください',
      canRetry: true,
      originalError: error
    };
  }

  // 不明なエラー処理
  private handleUnknownError(error: unknown): AppError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      type: ErrorType.UNKNOWN,
      message: errorMessage,
      userMessage: 'エラーが発生しました。しばらく経ってから再試行してください。',
      canRetry: true,
      originalError: error
    };
  }

  // リトライ機能
  async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 2,
      shouldRetry = () => true
    } = options;
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`試行 ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.error(`試行 ${attempt} 失敗:`, error);
        
        if (attempt === maxAttempts || !shouldRetry(error)) {
          throw error;
        }
        
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        console.log(`${waitTime}ms 待機中...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError!;
  }
}

export const errorService = new ErrorService();