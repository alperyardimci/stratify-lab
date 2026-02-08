import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../constants/theme';
import { RootStackParamList, MainTabParamList } from '../types';
import { useLanguageStore } from '../store';

import {
  SimulatorScreen,
  StrategyBuilderScreen,
  SettingsScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icons as text (can be replaced with proper icons later)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIcon = () => {
    switch (name) {
      case 'Simulator':
        return '📊';
      case 'Strategy':
        return '🧩';
      case 'Settings':
        return '⚙️';
      default:
        return '•';
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{getIcon()}</Text>
    </View>
  );
};

const MainTabs = () => {
  const { t } = useLanguageStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Simulator"
        component={SimulatorScreen}
        options={{
          tabBarLabel: t('simulator.title'),
          tabBarAccessibilityLabel: t('simulator.title'),
        }}
      />
      <Tab.Screen
        name="Strategy"
        component={StrategyBuilderScreen}
        options={{
          tabBarLabel: t('strategies.title'),
          tabBarAccessibilityLabel: t('strategies.title'),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('common.settings'),
          tabBarAccessibilityLabel: t('common.settings'),
        }}
      />
    </Tab.Navigator>
  );
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['stratifylab://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Simulator: 'simulator',
          Strategy: 'strategy',
          Settings: 'settings',
        },
      },
    },
  },
};

export const AppNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});

export default AppNavigator;
