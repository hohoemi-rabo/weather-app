import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppError } from '@/services/errorService';

interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <ThemedView style={styles.errorContainer}>
      <ThemedView style={styles.iconContainer}>
        <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.contentContainer}>
        <ThemedText style={styles.errorText}>{error.userMessage}</ThemedText>
        
        <ThemedView style={styles.buttonContainer}>
          {error.canRetry && onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <ThemedText style={styles.retryButtonText}>再試行</ThemedText>
            </TouchableOpacity>
          )}
          
          {error.action && (
            <TouchableOpacity 
              style={[styles.actionButton, !error.canRetry && styles.primaryButton]} 
              onPress={error.action.handler}
            >
              <ThemedText style={styles.actionButtonText}>{error.action.label}</ThemedText>
            </TouchableOpacity>
          )}
          
          {onDismiss && !error.action && !error.canRetry && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <ThemedText style={styles.dismissButtonText}>閉じる</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  errorIcon: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FF3B30',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderWidth: 0,
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dismissButtonText: {
    color: '#999',
    fontSize: 14,
  },
});