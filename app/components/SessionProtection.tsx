import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export default function SessionProtection({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

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
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(tabs)';
      const inSignInPage = segments[segments.length - 1] === 'signin';
      
      if (!isAuthenticated && inAuthGroup) {
        // Only redirect to sign in if we're in a protected route and not already on sign in
        if (!inSignInPage) {
          router.replace('/signin');
        }
      } else if (isAuthenticated && inSignInPage) {
        // Only redirect to tabs if we're authenticated and on the sign in page
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return <>{children}</>;
} 