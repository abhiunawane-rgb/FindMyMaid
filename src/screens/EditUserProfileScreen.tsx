import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import type { UserStackParamList } from '../navigation/types';
import { colors, radius, spacing, touchMin, typography } from '../theme';

type Props = NativeStackScreenProps<UserStackParamList, 'EditUserProfile'>;

export function EditUserProfileScreen({ navigation }: Props) {
  const { state, updateUserProfile } = useApp();
  const profile = state.userProfile;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setPhotoUri(profile.photoUri ?? null);
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
    const f = firstName.trim();
    if (f.length < 1) {
      Alert.alert('Name required', 'Please enter your first name.');
      return;
    }
    updateUserProfile({
      firstName: f,
      lastName: lastName.trim(),
      photoUri,
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
      <Text style={styles.sub}>Update your name and photo. Mobile number cannot be changed.</Text>

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

      <Text style={styles.label}>First name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="words"
        accessibilityLabel="First name"
      />

      <Text style={styles.label}>Last name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last name (optional)"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="words"
        accessibilityLabel="Last name"
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
    marginBottom: spacing.sm,
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
