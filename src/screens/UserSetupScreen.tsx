import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthBackRow } from '../components/AuthBackRow';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import type { Gender, UserOwnProfile } from '../types';
import { colors, radius, spacing, touchMin, typography } from '../theme';

export function UserSetupScreen() {
  const { state, saveUserProfile, backFromSetup } = useApp();
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photos to set your profile picture.');
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

  const done = () => {
    if (!gender) {
      return;
    }
    const raw = state.displayName.trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const p: UserOwnProfile = {
      displayName: raw,
      firstName,
      lastName,
      phone: state.phone,
      gender,
      city: city.trim() || undefined,
      photoUri,
    };
    saveUserProfile(p);
  };

  return (
    <Screen scroll>
      <AuthBackRow onPress={backFromSetup} label="Back to account" />
      <View style={styles.brandMark}>
        <BrandLogo size="nav" />
      </View>
      <Text style={styles.title}>Almost done</Text>
      <Text style={styles.sub}>
        Tell us how you identify so we can show the right options. Add your area if you want local
        context.
      </Text>

      <Text style={styles.label}>Your name</Text>
      <Text style={styles.readonly}>{state.displayName}</Text>

      <Pressable
        onPress={pickPhoto}
        style={styles.photoBox}
        accessibilityRole="button"
        accessibilityLabel="Choose profile photo"
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholderWrap}>
            <Ionicons name="person-circle-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.photoPlaceholder}>Add profile picture (optional)</Text>
          </View>
        )}
      </Pressable>

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
          <Text style={[styles.genderLabel, gender === 'female' && styles.genderLabelOn]}>Female</Text>
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

      <Text style={styles.label}>Area or city (optional)</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="e.g. Andheri West"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Area or city"
      />

      <PrimaryButton
        title="Start finding helpers"
        onPress={done}
        disabled={!gender}
      />
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
  label: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  readonly: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  photoBox: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  photoPlaceholder: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontSize: 11,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  genderBtn: {
    flex: 1,
    minHeight: touchMin + 8,
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
  input: {
    minHeight: touchMin,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 17,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    color: colors.text,
  },
});
