import { Box, Button, Center, GluestackUIProvider, Heading, Input, InputField, Text } from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRouter, useSegments } from 'expo-router';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { app } from '../firebase.config';

interface UserData {
  address: string;
  email: string;
  name: string;
  password: string;
  phoneNumber: string;
}

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export default function Signin(): JSX.Element {
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        console.log('Checking session:', sessionData);
        
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          if (session.isAuthenticated) {
            console.log('Found authenticated session, redirecting to tabs');
            setIsAuthenticated(true);
            router.replace('/(tabs)');
            return;
          } else {
            console.log('Found invalid session, clearing storage');
            await AsyncStorage.clear();
            setIsAuthenticated(false);
          }
        } else {
          console.log('No session found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        await AsyncStorage.clear();
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Check if user is authenticated
      const checkAuth = async () => {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          if (session.isAuthenticated) {
            router.replace('/(tabs)');
            return true;
          }
        }
        return false;
      };
      
      checkAuth();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const createSession = async (userData: UserData) => {
    try {
      const sessionData: SessionData = {
        email: userData.email,
        name: userData.name,
        isAuthenticated: true
      };
      await AsyncStorage.setItem('userSession', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleSignIn = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear any previous errors
      let userData: UserData | null = null;

      if (Platform.OS === 'web') {
        const db = getFirestore(app);
        
        try {
          const userDoc = await getDoc(doc(db, 'gwm', 'user_001'));
          
          if (!userDoc.exists()) {
            setErrors({ general: 'No account found with this email' });
            return;
          }

          userData = userDoc.data() as UserData;
          
          if (userData.email !== email) {
            setErrors({ general: 'No account found with this email' });
            return;
          }
          
          if (userData.password !== password) {
            setErrors({ password: 'Incorrect password' });
            return;
          }

          // Create session after successful authentication
          await createSession(userData);
          setIsAuthenticated(true);
          router.replace('/(tabs)');
        } catch (error) {
          setErrors({ general: 'Failed to sign in. Please try again.' });
          return;
        }
      } else {
        try {
          const userDoc = await firestore()
            .collection('gwm')
            .doc('user_001')
            .get();

          if (!userDoc.exists) {
            setErrors({ general: 'No account found with this email' });
            return;
          }

          userData = userDoc.data() as UserData;
          
          if (userData.email !== email) {
            setErrors({ general: 'No account found with this email' });
            return;
          }
          
          if (userData.password !== password) {
            setErrors({ password: 'Incorrect password' });
            return;
          }

          // Create session after successful authentication
          await createSession(userData);
          setIsAuthenticated(true);
          router.replace('/(tabs)');
        } catch (error) {
          setErrors({ general: 'Failed to sign in. Please try again.' });
          return;
        }
      }
    } catch (error: any) {
      setErrors({ general: 'Failed to sign in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // If authenticated, return an empty view
  if (isAuthenticated) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <GluestackUIProvider>
      <Box style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8fafc'
      }}>
        <Center style={{ width: '100%', maxWidth: 400 }}>
          <Heading style={{ 
            marginBottom: 40, 
            color: '#334155',
            textAlign: 'center'
          }}>
            <Text>Sign In</Text>
          </Heading>

          {errors.general && (
            <Text style={{ 
              color: '#ef4444', 
              fontSize: 14, 
              marginBottom: 16, 
              textAlign: 'center',
              backgroundColor: '#fee2e2',
              padding: 12,
              borderRadius: 8,
              width: '100%'
            }}>
              {errors.general}
            </Text>
          )}

          <Input style={{ 
            marginBottom: 8, 
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            borderColor: errors.email ? '#ef4444' : 'transparent'
          }}>
            <InputField 
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
              }}
              placeholder="Email" 
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
          {errors.email && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 16, alignSelf: 'flex-start' }}>
              {errors.email}
            </Text>
          )}

          <Input style={{ 
            marginBottom: 8, 
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            borderColor: errors.password ? '#ef4444' : 'transparent'
          }}>
            <InputField 
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
              }}
              placeholder="Password" 
              secureTextEntry
            />
          </Input>
          {errors.password && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 16, alignSelf: 'flex-start' }}>
              {errors.password}
            </Text>
          )}

          <Button 
            style={{ 
              width: '100%', 
              marginBottom: 16,
              backgroundColor: '#0ea5e9',
              borderRadius: 8,
              opacity: loading ? 0.7 : 1
            }}
            onPress={handleSignIn}
            isDisabled={loading}
          >
            <Text style={{ color: 'white' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </Button>
        </Center>
      </Box>
    </GluestackUIProvider>
  );
} 