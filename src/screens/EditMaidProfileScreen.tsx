import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { CURRENCY_CONFIG } from '../constants/localeDisplay';
import { useApp } from '../context/AppContext';
import type { MaidStackParamList } from '../navigation/types';
import { colors, radius, spacing, touchMin, typography } from '../theme';

type Props = NativeStackScreenProps<MaidStackParamList, 'EditMaidProfile'>;

export function EditMaidProfileScreen({ navigation }: Props) {
  const { state, updateMaidProfile } = useApp();
  const profile = state.maidProfile;

  const [displayName, setDisplayName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [age, setAge] = useState('30');
  const [m30, setM30] = useState('200');
  const [h1, setH1] = useState('350');
  const [h2, setH2] = useState('600');
  const [h24, setH24] = useState('5200');

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? '');
    setPhotoUri(profile.photoUri ?? null);
    setAge(String(profile.age ?? 30));
    setM30(String(profile.rates.m30));
    setH1(String(profile.rates.h1));
    setH2(String(profile.rates.h2));
    setH24(String(profile.rates.h24));
  }, [profile]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photos to update your profile picture.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const onSave = () => {
    const name = displayName.trim();
    const ageNum = Number(age);
    if (name.length < 1) {
      Alert.alert('Name required', 'Please enter how you want families to see your name.');
      return;
    }
    if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 80) {
      Alert.alert('Age required', 'Enter your age between 18 and 80.');
      return;
    }
    const r30 = Number(m30);
    const r1 = Number(h1);
    const r2 = Number(h2);
    const r24 = Number(h24);
    if (![r30, r1, r2, r24].every((n) => Number.isFinite(n) && n > 0 && n < 10000000)) {
      Alert.alert('Rates', 'Enter valid amounts for 30 min, 1 hr, 2 hr, and 24 hr.');
      return;
    }
    updateMaidProfile({
      displayName: name,
      photoUri,
      age: Math.round(ageNum),
      rates: { m30: r30, h1: r1, h2: r2, h24: r24 },
    });
    navigation.goBack();
  };

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.missing}>No profile loaded.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Edit profile</Text>
      <Text style={styles.sub}>Update your profile picture and details. Mobile number cannot be changed.</Text>

      <Pressable
        onPress={pickPhoto}
        style={styles.photoBox}
        accessibilityRole="button"
        accessibilityLabel="Change profile picture"
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholderWrap}>
            <Ionicons name="person-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.photoHint}>Tap to add photo</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Name shown to families</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="words"
        accessibilityLabel="Display name"
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        placeholder="e.g. 30"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        keyboardType="number-pad"
        accessibilityLabel="Age"
      />

      <Text style={styles.ratesHeading}>Your rates ({CURRENCY_CONFIG[state.pricingCountry].currencyCode})</Text>

      <Text style={styles.label}>30 minutes</Text>
      <TextInput
        value={m30}
        onChangeText={setM30}
        keyboardType="number-pad"
        style={styles.input}
        accessibilityLabel="Rate for thirty minutes"
      />
      <Text style={styles.label}>1 hour</Text>
      <TextInput
        value={h1}
        onChangeText={setH1}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Text style={styles.label}>2 hours</Text>
      <TextInput
        value={h2}
        onChangeText={setH2}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Text style={styles.label}>24 hours — full day</Text>
      <TextInput
        value={h24}
        onChangeText={setH24}
        keyboardType="number-pad"
        style={styles.input}
        accessibilityLabel="Rate for twenty-four hours"
      />

      <Text style={styles.label}>Mobile number</Text>
      <View style={styles.phoneReadonly}>
        <Text style={styles.phoneText}>{state.phone || '—'}</Text>
        <Text style={styles.phoneNote}>Cannot be edited for security.</Text>
      </View>

      <PrimaryButton title="Save changes" onPress={onSave} style={styles.saveBtn} />
      <Pressable onPress={() => navigation.goBack()} style={styles.cancelWrap}>
        <Text style={styles.cancel}>Cancel</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 1,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  photoBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 4,
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
  phoneReadonly: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  phoneText: {
    ...typography.body,
    color: colors.text,
  },
  phoneNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  ratesHeading: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  saveBtn: { marginTop: spacing.sm },
  cancelWrap: { alignItems: 'center', paddingVertical: spacing.md },
  cancel: {
    ...typography.body,
    color: colors.primaryDark,
  },
  missing: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.lg,
  },
});
