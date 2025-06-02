import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import SignOutButton from '../components/SignOutButton';

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          setIsAuthenticated(session.isAuthenticated);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.up.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payroll"
        options={{
          title: 'Payroll',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
        }}
      />
      {isAuthenticated ? (
        <Tabs.Screen
          name="signout"
          options={{
            title: 'Sign Out',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="rectangle.portrait.and.arrow.right" color={color} />,
            tabBarButton: (props) => (
              <HapticTab {...props}>
                <SignOutButton />
              </HapticTab>
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="signin"
          options={{
            title: 'Sign In',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
