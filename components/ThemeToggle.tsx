import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { themeMode, setThemeMode, colorScheme } = useTheme();

  const handleModeSelect = (mode: 'auto' | 'light' | 'dark') => {
    setThemeMode(mode);
  };

  const isAuto = themeMode === 'auto';
  const isLight = themeMode === 'light';
  const isDark = themeMode === 'dark';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.settingRow}>
        <ThemedView style={styles.settingInfo}>
          <ThemedText style={styles.settingTitle}>テーマ</ThemedText>
          <ThemedText style={styles.settingDescription}>
            アプリの外観を選択
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.controls}>
          <TouchableOpacity 
            style={[styles.modeButton, isAuto && styles.modeButtonActive]}
            onPress={() => handleModeSelect('auto')}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.modeIcon, isAuto && styles.modeIconActive]}>
              🌓
            </ThemedText>
            <ThemedText style={[styles.modeText, isAuto && styles.modeTextActive]}>
              自動
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, isLight && styles.modeButtonActive]}
            onPress={() => handleModeSelect('light')}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.modeIcon, isLight && styles.modeIconActive]}>
              ☀️
            </ThemedText>
            <ThemedText style={[styles.modeText, isLight && styles.modeTextActive]}>
              ライト
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, isDark && styles.modeButtonActive]}
            onPress={() => handleModeSelect('dark')}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.modeIcon, isDark && styles.modeIconActive]}>
              🌙
            </ThemedText>
            <ThemedText style={[styles.modeText, isDark && styles.modeTextActive]}>
              ダーク
            </ThemedText>
          </TouchableOpacity>
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 52,
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  modeIconActive: {
    // アイコンは絵文字なので色変更不要
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
  },
  modeTextActive: {
    color: 'white',
    opacity: 1,
  },
});