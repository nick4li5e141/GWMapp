import { GluestackUIProvider } from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { config } from './gluestack-ui.config';

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          setIsAuthenticated(session.isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const checkStorage = async () => {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData);
        setIsAuthenticated(session.isAuthenticated);
      } else {
        setIsAuthenticated(false);
      }
    };

    const interval = setInterval(checkStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <GluestackUIProvider config={config}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="pages" />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
