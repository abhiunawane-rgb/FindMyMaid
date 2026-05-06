import { colors } from '../theme';

/** Fitts’s Law: icon size; labels add recognition (Jakob’s Law / Material 3 nav bar). */
export const TAB_BAR_ICON_SIZE = 24;

/**
 * Bottom navigation: labeled tabs reduce memory load vs icon-only (recognition over recall).
 * Matches familiar iOS tab bar + Material 3 Navigation Bar patterns.
 */
export const tabBarCommonOptions = {
  tabBarShowLabel: true,
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabBarActiveTintColor: colors.primaryDark,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarIconStyle: {
    marginTop: 2,
  },
  tabBarItemStyle: {
    paddingVertical: 6,
    minHeight: 56,
    justifyContent: 'center' as const,
  },
  tabBarStyle: {
    minHeight: 64,
    paddingTop: 4,
    paddingBottom: 8,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.surface,
    elevation: 8,
  },
  tabBarHideOnKeyboard: true,
};
