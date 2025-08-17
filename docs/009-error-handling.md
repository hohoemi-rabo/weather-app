# 009: エラーハンドリング

## 概要
アプリ全体のエラー処理とユーザーフレンドリーなエラー表示の実装

## 要件
- 位置情報エラーの処理
- API関連エラーの処理
- ネットワークエラーの処理
- ユーザーへの適切なフィードバック

## タスク

### エラー処理実装
- [ ] ErrorServiceの実装 (services/errorService.ts)
  - [ ] エラー分類
  - [ ] エラーメッセージ生成
  - [ ] リトライロジック
- [ ] エラーバウンダリーの実装
  - [ ] アプリクラッシュの防止
  - [ ] フォールバックUI
- [ ] エラー表示コンポーネント
  - [ ] ErrorMessageコンポーネント
  - [ ] ErrorScreenコンポーネント

### 各種エラー対応
- [ ] 位置情報エラー
  - [ ] 権限拒否
  - [ ] GPS無効
  - [ ] タイムアウト
- [ ] API関連エラー
  - [ ] 認証エラー（401）
  - [ ] レート制限（429）
  - [ ] サーバーエラー（500）
- [ ] ネットワークエラー
  - [ ] オフライン
  - [ ] タイムアウト
  - [ ] DNS解決失敗

## 実装詳細

### errorService.ts
```typescript
enum ErrorType {
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

interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  action?: ErrorAction;
  canRetry: boolean;
}

interface ErrorAction {
  label: string;
  handler: () => void;
}

class ErrorService {
  // エラー分類
  classifyError(error: unknown): AppError {
    if (error instanceof LocationError) {
      return this.handleLocationError(error);
    }
    if (error instanceof ApiError) {
      return this.handleApiError(error);
    }
    if (error instanceof NetworkError) {
      return this.handleNetworkError(error);
    }
    return this.handleUnknownError(error);
  }
  
  // ユーザーメッセージ生成
  getUserMessage(type: ErrorType): string {
    const messages = {
      [ErrorType.LOCATION_PERMISSION]: '位置情報の使用を許可してください',
      [ErrorType.GPS_DISABLED]: 'GPSを有効にしてください',
      [ErrorType.API_RATE_LIMIT]: 'API制限に達しました。しばらくお待ちください',
      [ErrorType.NETWORK_OFFLINE]: 'インターネットに接続できません',
      // ... 他のメッセージ
    };
    return messages[type] || 'エラーが発生しました';
  }
}
```

### エラーバウンダリー
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
    error: null
  };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログ送信（将来実装）
    console.error('App crashed:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          error={this.state.error}
          onReset={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### エラー表示コンポーネント
```typescript
// ErrorMessage.tsx - インラインエラー表示
interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function ErrorMessage({ error, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" color="red" />
      <Text style={styles.errorText}>{error.userMessage}</Text>
      
      {error.canRetry && onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retryButton}>再試行</Text>
        </TouchableOpacity>
      )}
      
      {error.action && (
        <TouchableOpacity onPress={error.action.handler}>
          <Text style={styles.actionButton}>{error.action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ErrorScreen.tsx - フルスクリーンエラー表示
function ErrorScreen({ error, onReset }: ErrorScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="cloud-off" size={80} color="#999" />
        <Text style={styles.title}>エラーが発生しました</Text>
        <Text style={styles.message}>{error.userMessage}</Text>
        
        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>アプリを再起動</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
```

### リトライロジック
```typescript
async function withRetry<T>(
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
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}
```

### 具体的なエラー処理例
```typescript
// 位置情報エラー
async function handleLocationPermissionDenied() {
  return {
    type: ErrorType.LOCATION_PERMISSION,
    userMessage: '天気情報を表示するには位置情報が必要です',
    action: {
      label: '設定を開く',
      handler: () => Linking.openSettings()
    },
    canRetry: false
  };
}

// API制限エラー
async function handleApiRateLimit() {
  const cached = await cacheService.getWeatherData();
  
  if (cached) {
    // キャッシュがあれば使用
    return { useCache: true, data: cached };
  }
  
  return {
    type: ErrorType.API_RATE_LIMIT,
    userMessage: '更新制限に達しました。1時間後に再試行してください',
    canRetry: false
  };
}
```

## テストケース
- [ ] 各エラータイプの分類
- [ ] エラーメッセージの表示
- [ ] リトライ機能
- [ ] エラーバウンダリー
- [ ] 設定画面への遷移

## 完了基準
- [ ] すべてのエラーが適切に処理される
- [ ] ユーザーフレンドリーなメッセージが表示される
- [ ] アプリがクラッシュしない
- [ ] 適切なリカバリーオプションが提供される

## 関連チケット
- 前: 008-auto-update-feature
- 次: 010-ui-ux-polish-testing