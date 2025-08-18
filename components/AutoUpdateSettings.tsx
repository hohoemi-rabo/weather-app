import React from 'react';
import { StyleSheet, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface AutoUpdateSettingsProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

export function AutoUpdateSettings({ enabled, onToggle }: AutoUpdateSettingsProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.settingRow}>
        <ThemedView style={styles.settingInfo}>
          <ThemedText style={styles.settingTitle}>自動更新</ThemedText>
          <ThemedText style={styles.settingDescription}>
            1時間ごとに天気データを自動更新
          </ThemedText>
        </ThemedView>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={enabled ? '#007AFF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
});