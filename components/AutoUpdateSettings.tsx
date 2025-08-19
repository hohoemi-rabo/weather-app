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
        <ThemedView style={styles.iconContainer}>
          <ThemedText style={styles.icon}>🔄</ThemedText>
        </ThemedView>
        <ThemedView style={styles.settingInfo}>
          <ThemedText style={styles.settingTitle}>自動更新</ThemedText>
          <ThemedText style={styles.settingDescription}>
            {enabled ? 'オン - 1時間ごとに更新' : 'オフ - 手動で更新'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.switchContainer}>
          <ThemedText style={styles.statusText}>
            {enabled ? 'ON' : 'OFF'}
          </ThemedText>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={enabled ? '#007AFF' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </ThemedView>
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
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 28,
  },
});