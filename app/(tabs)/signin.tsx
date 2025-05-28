import { Box, Button, Center, GluestackUIProvider, Heading, Input, InputField, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';

export default function Signin(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignIn = async (): Promise<void> => {
    try {
      // TODO: Implement actual sign in logic
      console.log('Sign in:', { email, password });
      Alert.alert('Success', 'Signed in successfully');
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Failed to sign in');
    }
  };

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
            Sign In
          </Heading>

          <Input style={{ 
            marginBottom: 16, 
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}>
            <InputField 
              defaultValue={email} 
              onChangeText={setEmail} 
              placeholder="Email" 
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
          
          <Input style={{ 
            marginBottom: 24, 
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}>
            <InputField 
              defaultValue={password} 
              onChangeText={setPassword} 
              placeholder="Password" 
              secureTextEntry
            />
          </Input>

          <Button 
            style={{ 
              width: '100%', 
              marginBottom: 16,
              backgroundColor: '#0ea5e9',
              borderRadius: 8
            }}
            onPress={handleSignIn}
          >
            Sign In
          </Button>

          <Text style={{ 
            color: '#64748b',
            textAlign: 'center'
          }}>
            Don't have an account?{' '}
            <Text 
              style={{ color: '#0ea5e9', textDecorationLine: 'underline' }}
              onPress={() => router.push('/signup')}
            >
              Sign Up
            </Text>
          </Text>
        </Center>
      </Box>
    </GluestackUIProvider>
  );
} 