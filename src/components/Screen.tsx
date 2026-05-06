import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  /** Extra bottom padding for tab bar */
  bottomInset?: number;
  /**
   * Removes default top padding so banners/heroes sit flush under the nav bar
   * (matches how the Find tab lays out content without a top gap).
   */
  flushTop?: boolean;
  /**
   * When false, do not inset for the status bar on this screen. Use on tabs that already show a
   * navigation header — otherwise SafeAreaView adds a second top gap (looks like blank padding).
   */
  safeAreaTop?: boolean;
};

/** Responsive: caps content width on tablets (Material / Apple large layouts). */
export function Screen({ children, scroll, bottomInset = 0, flushTop = false, safeAreaTop = true }: Props) {
  const safeEdges: Edge[] = safeAreaTop ? ['top', 'left', 'right'] : ['left', 'right'];
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const maxPad = isWide ? { maxWidth: 560, width: '100%' as const, alignSelf: 'center' as const } : {};

  const pad = { paddingBottom: spacing.lg + bottomInset };
  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={safeEdges}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              flushTop && styles.scrollContentFlushTop,
              pad,
              maxPad,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <View style={[styles.flex, pad, maxPad]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  scrollContentFlushTop: {
    paddingTop: 0,
  },
});
