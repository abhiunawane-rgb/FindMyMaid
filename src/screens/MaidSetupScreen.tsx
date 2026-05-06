import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AuthBackRow } from '../components/AuthBackRow';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { UI_CURRENCY_SYMBOL } from '../constants/localeDisplay';
import { useApp } from '../context/AppContext';
import { maidIdFromPhone } from '../utils/maidId';
import type { Gender, MaidOwnProfile, ServiceId } from '../types';
import { SERVICE_LABELS } from '../types';
import { colors, radius, spacing, touchMin, typography } from '../theme';

const ALL_SERVICES: ServiceId[] = [
  'cooking',
  'house_cleaning',
  'kitchen_utensils',
  'cloth_cleaning',
  'other',
];

export function MaidSetupScreen() {
  const { state, saveMaidProfile, backFromSetup } = useApp();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender>('female');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [m30, setM30] = useState('200');
  const [h1, setH1] = useState('350');
  const [h2, setH2] = useState('600');
  const [picked, setPicked] = useState<Set<ServiceId>>(new Set(['house_cleaning']));
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Please allow photos to add your profile picture.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets[0]) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const toggleService = (id: ServiceId) => {
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const next = () => {
    if (step === 0 && !photoUri) {
      Alert.alert('Photo', 'Add one clear indoor photo so families recognize you.');
      return;
    }
    if (step === 1) {
      const a = Number(m30);
      const b = Number(h1);
      const c = Number(h2);
      if (![a, b, c].every((n) => n > 0 && n < 100000)) {
        Alert.alert('Rates', 'Enter fair amounts for 30 min, 1 hour, and 2 hours.');
        return;
      }
    }
    if (step === 2 && picked.size === 0) {
      Alert.alert('Services', 'Pick at least one service you offer.');
      return;
    }
    if (step < 2) setStep(step + 1);
    else {
      void finishWithLocation();
    }
  };

  const finishWithLocation = async () => {
    setSaving(true);
    let locationLat: number | undefined;
    let locationLng: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        locationLat = pos.coords.latitude;
        locationLng = pos.coords.longitude;
      } else {
        Alert.alert(
          'Location permission',
          'Nearby families use distance to find helpers. You can allow location in system settings, then use My Profile → Update service location.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Location unavailable',
        'We could not read your position (GPS or permission). You can finish now and set your service area from My Profile → Update service location.',
        [{ text: 'OK' }]
      );
    }

    const profile: MaidOwnProfile = {
      id: maidIdFromPhone(state.phone),
      displayName: state.displayName,
      phone: state.phone,
      gender,
      photoUri,
      rates: {
        m30: Number(m30),
        h1: Number(h1),
        h2: Number(h2),
      },
      services: Array.from(picked),
      verified: true,
      ...(locationLat != null &&
      locationLng != null &&
      Number.isFinite(locationLat) &&
      Number.isFinite(locationLng)
        ? { locationLat, locationLng }
        : {}),
    };
    try {
      saveMaidProfile(profile);
    } finally {
      setSaving(false);
    }
  };

  const labels = ['Photo', 'Rates', 'Services'];

  const onBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      backFromSetup();
    }
  };

  return (
    <Screen scroll>
      <AuthBackRow
        onPress={onBack}
        label={step > 0 ? 'Previous step' : 'Back to account'}
      />
      <View style={styles.brandMark}>
        <BrandLogo size="nav" />
      </View>
      <Text style={styles.progress}>
        Step {step + 1} of 3 — {labels[step]}
      </Text>
      <Text style={styles.title}>Set up your profile</Text>
      <Text style={styles.sub}>Large buttons, simple steps. You can edit later.</Text>

      {step === 0 && (
        <View>
          <Text style={styles.label}>You are</Text>
          <View style={styles.genderRow}>
            <Pressable
              onPress={() => setGender('female')}
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: gender === 'female' }}
            >
              <Ionicons
                name="woman-outline"
                size={24}
                color={gender === 'female' ? colors.primaryDark : colors.textSecondary}
              />
              <Text style={[styles.genderLabel, gender === 'female' && styles.genderLabelOn]}>
                Female
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('male')}
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: gender === 'male' }}
            >
              <Ionicons
                name="man-outline"
                size={24}
                color={gender === 'male' ? colors.primaryDark : colors.textSecondary}
              />
              <Text style={[styles.genderLabel, gender === 'male' && styles.genderLabelOn]}>Male</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={pickPhoto}
            style={styles.photoBox}
            accessibilityRole="button"
            accessibilityLabel="Choose profile photo"
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>Tap to add indoor photo</Text>
            )}
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.label}>30 minutes ({UI_CURRENCY_SYMBOL})</Text>
          <TextInput
            value={m30}
            onChangeText={setM30}
            keyboardType="number-pad"
            style={styles.input}
            accessibilityLabel="Rate for 30 minutes"
          />
          <Text style={styles.label}>1 hour ({UI_CURRENCY_SYMBOL})</Text>
          <TextInput
            value={h1}
            onChangeText={setH1}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.label}>2 hours ({UI_CURRENCY_SYMBOL})</Text>
          <TextInput
            value={h2}
            onChangeText={setH2}
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
      )}

      {step === 2 && (
        <Text style={styles.locationHint}>
          When you finish, we ask for your current location once so families nearby can find you and
          see accurate distance.
        </Text>
      )}

      {step === 2 && (
        <View style={styles.chips}>
          {ALL_SERVICES.map((id) => {
            const on = picked.has(id);
            return (
              <Pressable
                key={id}
                onPress={() => toggleService(id)}
                style={[styles.chip, on && styles.chipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {SERVICE_LABELS[id]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <PrimaryButton
        title={step === 2 ? 'Finish and go to home' : 'Next'}
        onPress={next}
        loading={saving}
        disabled={saving}
        style={styles.btn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progress: {
    ...typography.small,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  locationHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  photoBox: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 280,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    textAlign: 'center',
    padding: spacing.lg,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  genderBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  genderBtnOn: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryMuted,
  },
  genderLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  genderLabelOn: {
    color: colors.primaryDark,
    fontWeight: '600',
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
    fontSize: 20,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextOn: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  btn: {
    marginTop: spacing.md,
  },
});
