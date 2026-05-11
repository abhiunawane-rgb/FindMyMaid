import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthBackRow } from '../components/AuthBackRow';
import { AppNameMark } from '../components/AppNameMark';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { requestOtpDelivery } from '../services/backend';
import { colors, radius, spacing, touchMin, typography } from '../theme';

export function AuthScreen() {
  const { state, setDisplayName, setPhone, sendOtp, backFromAuth } = useApp();
  const [name, setName] = useState(state.displayName);
  const [phone, setPhoneLocal] = useState(state.phone);
  const [sending, setSending] = useState(false);
  const isLogin = state.authMode === 'login';

  const onContinue = () => {
    void (async () => {
      const n = name.trim();
      const p = phone.replace(/\D/g, '');
      if (!isLogin && n.length < 2) {
        Alert.alert('Add your name', 'Please enter the name you want on your profile.');
        return;
      }
      if (p.length < 8) {
        Alert.alert(
          'Check mobile number',
          'Enter a valid mobile number with country code if needed.'
        );
        return;
      }
      if (sending) return;
      setSending(true);
      try {
        const r = await requestOtpDelivery(phone);
        if (r === 'sms_not_configured') {
          Alert.alert(
            'SMS not ready',
            'The API is not set up to send SMS yet. Add Twilio credentials on the server, or set OTP_DEV_BYPASS=true for local development.'
          );
          return;
        }
        if (r === 'bad_request') {
          Alert.alert('Check mobile number', 'Enter a valid mobile number.');
          return;
        }
        if (r === 'invalid_phone') {
          Alert.alert(
            'Invalid phone number',
            'Use a valid number. Try including country code (for example: +91XXXXXXXXXX).'
          );
          return;
        }
        if (r === 'sms_send_failed') {
          Alert.alert(
            'SMS provider error',
            'Your server reached Twilio but SMS sending failed. Check Twilio Verify settings, sender country support, and trial number restrictions.'
          );
          return;
        }
        if (r !== 'ok') {
          Alert.alert(
            'Could not send code',
            'Could not reach the server. Check your internet connection and that the API URL is live.'
          );
          return;
        }
        if (!isLogin) {
          setDisplayName(n);
        }
        setPhone(phone);
        sendOtp();
      } finally {
        setSending(false);
      }
    })();
  };

  return (
    <Screen scroll>
      <AuthBackRow onPress={backFromAuth} />
      <View style={styles.brandMark}>
        <BrandLogo size="nav" />
        <AppNameMark variant="onLight" size="caption" alignCenter style={styles.brandTitle} />
      </View>
      <Text style={styles.title}>
        {isLogin
          ? state.role === 'maid'
            ? 'Login as helper'
            : 'Login with your number'
          : state.role === 'maid'
            ? 'Create your helper profile'
            : 'Create your account'}
      </Text>
      <Text style={styles.sub}>
        {isLogin
          ? 'Enter the mobile number you used before. We’ll text you a verification code.'
          : 'We’ll text a one-time code to your mobile number.'}
      </Text>

      {!isLogin ? (
        <>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Anita Sharma"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            accessibilityLabel="Your name"
            accessibilityHint="Shown on your profile after you sign in"
          />
        </>
      ) : (
        <Text style={styles.nameHint}>We’ll reload your saved profile after you verify.</Text>
      )}

      <Text style={styles.label}>Mobile number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhoneLocal}
        placeholder="e.g. 9876543210"
        placeholderTextColor={colors.textSecondary}
        keyboardType="phone-pad"
        style={styles.input}
        accessibilityLabel="Mobile number"
        accessibilityHint="Include country code if you use one"
      />

      <PrimaryButton
        title="Send verification code"
        onPress={onContinue}
        style={styles.btn}
        loading={sending}
        disabled={sending}
      />

      <Text style={styles.legal}>
        By continuing you agree that contact happens outside the app and you follow local laws.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandTitle: {
    marginTop: spacing.sm,
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
  nameHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  label: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: touchMin,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  btn: {
    marginBottom: spacing.md,
  },
  legal: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    lineHeight: 20,
  },
});
