import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppNameMark } from '../components/AppNameMark';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { AuthScreen } from '../screens/AuthScreen';
import { MaidDetailScreen } from '../screens/MaidDetailScreen';
import { MaidEarnScreen } from '../screens/MaidEarnScreen';
import { MaidHomeScreen } from '../screens/MaidHomeScreen';
import { MaidSetupScreen } from '../screens/MaidSetupScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { EditMaidProfileScreen } from '../screens/EditMaidProfileScreen';
import { EditUserProfileScreen } from '../screens/EditUserProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UserDiscoverScreen } from '../screens/UserDiscoverScreen';
import { UserPremiumScreen } from '../screens/UserPremiumScreen';
import { UserSetupScreen } from '../screens/UserSetupScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { colors } from '../theme';
import type { MaidStackParamList, UserStackParamList } from './types';
import { TAB_BAR_ICON_SIZE, tabBarCommonOptions } from './tabBarStyles';

const UserStack = createNativeStackNavigator<UserStackParamList>();
const MaidStack = createNativeStackNavigator<MaidStackParamList>();
const UserTab = createBottomTabNavigator();
const MaidTab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    text: colors.text,
    card: colors.surface,
    border: colors.border,
  },
};

/** Dark header — matches brand black; light chrome (Material 3 / iOS navigation bars). */
const darkHeaderOptions = {
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 17,
    color: colors.onDark,
  },
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: colors.primaryDark,
    borderBottomWidth: Platform.OS === 'android' ? 0 : StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  headerTintColor: colors.onDark,
};

function UserTabNavigator() {
  return (
    <UserTab.Navigator
      screenOptions={{
        ...tabBarCommonOptions,
        headerShown: true,
        ...darkHeaderOptions,
      }}
    >
      <UserTab.Screen
        name="Find"
        component={UserDiscoverScreen}
        options={{
          headerTitle: () => <AppNameMark variant="onDark" size="nav" />,
          headerTitleAlign: 'center',
          tabBarLabel: 'Find',
          tabBarAccessibilityLabel: `${APP_DISPLAY_NAME}. Find helpers near you`,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'location' : 'location-outline'}
              size={TAB_BAR_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <UserTab.Screen
        name="Premium"
        component={UserPremiumScreen}
        options={{
          title: 'Premium',
          tabBarLabel: 'Premium',
          tabBarAccessibilityLabel: 'Premium subscription',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'star' : 'star-outline'}
              size={TAB_BAR_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <UserTab.Screen
        name="Account"
        options={{
          title: 'My Profile',
          tabBarLabel: 'My Profile',
          tabBarAccessibilityLabel: 'My profile and settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={TAB_BAR_ICON_SIZE}
              color={color}
            />
          ),
        }}
      >
        {() => <SettingsScreen role="user" />}
      </UserTab.Screen>
    </UserTab.Navigator>
  );
}

function UserRoot() {
  return (
    <UserStack.Navigator>
      <UserStack.Screen
        name="UserTabs"
        component={UserTabNavigator}
        options={{ headerShown: false, title: 'Find My Maid' }}
      />
      <UserStack.Screen
        name="MaidDetail"
        component={MaidDetailScreen}
        options={{
          title: 'Profile',
          presentation: 'card',
          gestureEnabled: true,
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'generic',
          ...darkHeaderOptions,
        }}
      />
      <UserStack.Screen
        name="EditUserProfile"
        component={EditUserProfileScreen}
        options={{
          title: 'Edit profile',
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'generic',
          ...darkHeaderOptions,
        }}
      />
    </UserStack.Navigator>
  );
}

function MaidTabNavigator() {
  return (
    <MaidTab.Navigator
      screenOptions={{
        ...tabBarCommonOptions,
        headerShown: true,
        ...darkHeaderOptions,
      }}
    >
      <MaidTab.Screen
        name="Home"
        component={MaidHomeScreen}
        options={{
          title: 'My profile',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'My helper profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={TAB_BAR_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <MaidTab.Screen
        name="Earn"
        component={MaidEarnScreen}
        options={{
          title: 'Boost',
          tabBarLabel: 'Boost',
          tabBarAccessibilityLabel: 'Maid Pro and visibility',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={TAB_BAR_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <MaidTab.Screen
        name="Account"
        options={{
          title: 'My Profile',
          tabBarLabel: 'My Profile',
          tabBarAccessibilityLabel: 'My profile and settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={TAB_BAR_ICON_SIZE}
              color={color}
            />
          ),
        }}
      >
        {() => <SettingsScreen role="maid" />}
      </MaidTab.Screen>
    </MaidTab.Navigator>
  );
}

function MaidRoot() {
  return (
    <MaidStack.Navigator>
      <MaidStack.Screen name="MaidTabs" component={MaidTabNavigator} options={{ headerShown: false }} />
      <MaidStack.Screen
        name="EditMaidProfile"
        component={EditMaidProfileScreen}
        options={{
          title: 'Edit profile',
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'generic',
          ...darkHeaderOptions,
        }}
      />
    </MaidStack.Navigator>
  );
}

function AuthGate() {
  const { state } = useApp();

  switch (state.step) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'auth':
      return <AuthScreen />;
    case 'otp':
      return <OtpScreen />;
    case 'maid_setup':
      return <MaidSetupScreen />;
    case 'user_setup':
      return <UserSetupScreen />;
    case 'main':
      if (state.role === 'maid') return <MaidRoot />;
      return <UserRoot />;
    default:
      return <WelcomeScreen />;
  }
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <AuthGate />
    </NavigationContainer>
  );
}
