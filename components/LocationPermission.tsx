import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LocationError } from '@/types/weather';

interface LocationPermissionProps {
  error: LocationError | null;
  hasPermission: boolean | null;
  loading: boolean;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
}

export function LocationPermission({
  error,
  hasPermission,
  loading,
  onRequestPermission,
  onOpenSettings,
}: LocationPermissionProps) {
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>位置情報を取得中...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.icon}>📍</ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          位置情報が必要です
        </ThemedText>
        <ThemedText style={styles.description}>
          お住まいの地域の天気を表示するために、{'\n'}
          位置情報の使用を許可してください。
        </ThemedText>
        
        <TouchableOpacity style={styles.button} onPress={onRequestPermission}>
          <ThemedText style={styles.buttonText}>位置情報を許可する</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onOpenSettings}>
          <ThemedText style={styles.buttonText}>設定を開く</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (error?.code === 'GPS_DISABLED') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.icon}>🛰️</ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          GPSが無効です
        </ThemedText>
        <ThemedText style={styles.description}>
          位置情報サービスを有効にしてください。
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
          <ThemedText style={styles.buttonText}>設定を開く</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.icon}>⚠️</ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          エラーが発生しました
        </ThemedText>
        <ThemedText style={styles.description}>
          {error.message}
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={onRequestPermission}>
          <ThemedText style={styles.buttonText}>再試行</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 20,
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
});