import { Box, Button, Center, GluestackUIProvider, Heading, Input, InputField, Text } from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';

interface UserData {
  address: string;
  email: string;
  name: string;
  password: string;
  phoneNumber: string;
  role: string;
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

      // Query for user by email
      const usersRef = firestore().collection('gwm');
      const userQuery = await usersRef.where('email', '==', email).get();

      if (userQuery.empty) {
        setErrors({ general: 'No account found with this email' });
        return;
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data() as UserData;

      if (userData.password !== password) {
        setErrors({ password: 'Incorrect password' });
        return;
      }

      // Create session after successful authentication
      await createSession(userData);

      // Check for admin role and redirect accordingly
      if (userData.role === 'admin') {
        console.log('Admin user signed in, redirecting to admin dashboard.');
        router.replace('/admin'); // Redirect to the admin dashboard path
      } else {
        console.log('Regular user signed in, redirecting to tabs.');
        router.replace('/(tabs)'); // Redirect to the regular user tabs
      }

    } catch (error) {
      console.error('Error signing in:', error);
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
            elevation: 2,
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
            elevation: 2,
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