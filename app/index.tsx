import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        console.log('Index: Checking session:', sessionData);
        
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          console.log('Index: Session found, isAuthenticated:', session.isAuthenticated);
          setIsAuthenticated(session.isAuthenticated);
        } else {
          console.log('Index: No session found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Index: Error checking session:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication
  if (isAuthenticated) {
    console.log('Index: Redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  } else {
    console.log('Index: Redirecting to signin');
    return <Redirect href="/signin" />;
  }
} 