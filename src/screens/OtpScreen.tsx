import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthBackRow } from '../components/AuthBackRow';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { API_SYNC_ENABLED } from '../constants/api';
import { OTP_MIN_DIGITS } from '../constants/auth';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing, touchMin, typography } from '../theme';

export function OtpScreen() {
  const { verifyOtpAndContinue, backFromOtp, retrySendOtp, state } = useApp();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [retryBusy, setRetryBusy] = useState(false);
  const isLogin = state.authMode === 'login';

  React.useEffect(() => {
    if (retryCooldown <= 0) return;
    const t = setInterval(() => {
      setRetryCooldown((x) => (x <= 1 ? 0 : x - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [retryCooldown]);

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

  const onRetryOtp = useCallback(() => {
    void (async () => {
      if (retryBusy || retryCooldown > 0) return;
      setRetryBusy(true);
      try {
        const r = await retrySendOtp();
        if (r === 'sms_not_configured') {
          Alert.alert(
            'SMS not ready',
            'The API cannot resend OTP yet (Twilio or server config).'
          );
          return;
        }
        if (r === 'invalid_phone' || r === 'bad_request') {
          Alert.alert('Check number', 'Go back and confirm your mobile number.');
          return;
        }
        if (r !== 'ok') {
          Alert.alert('Could not send', 'Try again shortly or check your connection.');
          return;
        }
        setRetryCooldown(30);
        Alert.alert('Sent', 'A fresh verification code is on its way.');
      } finally {
        setRetryBusy(false);
      }
    })();
  }, [retryBusy, retryCooldown, retrySendOtp]);

  return (
    <Screen scroll>
      <AuthBackRow onPress={backFromOtp} label={isLogin ? 'Change number' : 'Edit details'} />
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

      <View style={styles.retryRow}>
        <Pressable
          onPress={onRetryOtp}
          disabled={retryBusy || retryCooldown > 0}
          style={[
            styles.retryBtn,
            (retryBusy || retryCooldown > 0) && styles.retryBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code"
          accessibilityHint="Sends a new SMS OTP to your phone"
        >
          <Text style={styles.retryBtnText}>
            {retryCooldown > 0
              ? `Resend OTP in ${retryCooldown}s`
              : retryBusy
                ? 'Sending…'
                : 'Resend OTP'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipText}>
          Didn’t get a text? Try Resend OTP, or check spam / blocked SMS. You can change your number
          with the link above.
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
  retryRow: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  retryBtn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentDark,
    backgroundColor: colors.primaryMuted,
  },
  retryBtnDisabled: {
    opacity: 0.55,
  },
  retryBtnText: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  tip: {
    marginTop: spacing.md,
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
