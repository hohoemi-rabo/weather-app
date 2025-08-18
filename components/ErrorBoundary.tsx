import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedText style={styles.icon}>🌧️</ThemedText>
            <ThemedText style={styles.title}>エラーが発生しました</ThemedText>
            <ThemedText style={styles.message}>
              申し訳ございません。予期しないエラーが発生しました。
            </ThemedText>
            
            {__DEV__ && this.state.error && (
              <ThemedView style={styles.errorDetails}>
                <ThemedText style={styles.errorName}>
                  {this.state.error.name}
                </ThemedText>
                <ThemedText style={styles.errorMessage}>
                  {this.state.error.message}
                </ThemedText>
                {this.state.errorInfo && (
                  <ThemedText style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </ThemedText>
                )}
              </ThemedView>
            )}
            
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <ThemedText style={styles.buttonText}>アプリを再起動</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  errorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
});