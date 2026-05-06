import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthBackRow } from '../components/AuthBackRow';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { API_SYNC_ENABLED } from '../constants/api';
import { OTP_MIN_DIGITS } from '../constants/auth';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing, touchMin, typography } from '../theme';

export function OtpScreen() {
  const { verifyOtpAndContinue, backFromOtp } = useApp();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = () => {
    void (async () => {
      if (busy) return;
      setBusy(true);
      try {
        const digits = code.replace(/\D/g, '');
        if (digits.length < OTP_MIN_DIGITS) {
          Alert.alert(
            'Code too short',
            `Enter the full code we sent (${OTP_MIN_DIGITS} digits or more).`
          );
          return;
        }
        await verifyOtpAndContinue(code);
      } finally {
        setBusy(false);
      }
    })();
  };

  return (
    <Screen scroll>
      <AuthBackRow onPress={backFromOtp} label="Edit details" />
      <View style={styles.brandMark}>
        <BrandLogo size="nav" />
      </View>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.sub}>
        {API_SYNC_ENABLED
          ? 'We sent a verification code by SMS. Enter it below.'
          : 'API sync is off on this build: enter any 6-digit code to continue on this device.'}
      </Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="• • • • • •"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        maxLength={10}
        style={styles.input}
        accessibilityLabel="Verification code"
        accessibilityHint="SMS verification code"
      />

      <PrimaryButton title="Verify and continue" onPress={submit} loading={busy} disabled={busy} />

      <View style={styles.tip}>
        <Text style={styles.tipText}>
          Didn’t get a text? Check the number on the previous screen and try sending the code again.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  input: {
    minHeight: touchMin + 4,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 24,
    letterSpacing: 8,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  tip: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
  },
  tipText: {
    ...typography.caption,
    color: colors.primaryDark,
    lineHeight: 20,
  },
});
