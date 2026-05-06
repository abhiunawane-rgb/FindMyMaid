import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PublicMaid } from '../types';

export type UserTabParamList = {
  Find: undefined;
  Premium: undefined;
  Account: undefined;
};

export type UserStackParamList = {
  UserTabs: NavigatorScreenParams<UserTabParamList>;
  MaidDetail: { maid: PublicMaid };
  EditUserProfile: undefined;
};

export type MaidTabParamList = {
  Home: undefined;
  Earn: undefined;
  Account: undefined;
};

export type MaidStackParamList = {
  MaidTabs: NavigatorScreenParams<MaidTabParamList>;
  EditMaidProfile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Otp: undefined;
  MaidSetup: undefined;
  UserSetup: undefined;
};
