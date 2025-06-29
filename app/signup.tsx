import { Box, Button, Center, GluestackUIProvider, Heading, Input, InputField, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
// Import Firebase configuration
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

export default function Signup(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleNext = (): void => {
    if (!name || !phoneNumber || !email || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const handleSignUp = async (): Promise<void> => {
    try {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      // Save additional info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        phoneNumber,
        email,
        address,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Account created successfully');
      router.push('/signin');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'Failed to create account');
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
            {step === 1 ? 'Create Account' : 'Create Password'}
          </Heading>

          {step === 1 ? (
            <>
              <Input style={styles.input}>
                <InputField 
                  value={name} 
                  onChangeText={setName} 
                  placeholder="Full Name" 
                  autoCapitalize="words"
                />
              </Input>

              <Input style={styles.input}>
                <InputField 
                  value={phoneNumber} 
                  onChangeText={setPhoneNumber} 
                  placeholder="Phone Number" 
                  keyboardType="phone-pad"
                />
              </Input>

              <Input style={styles.input}>
                <InputField 
                  value={email} 
                  onChangeText={setEmail} 
                  placeholder="Email Address" 
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>

              <Input style={[styles.input, { marginBottom: 24 }]}>
                <InputField 
                  value={address} 
                  onChangeText={setAddress} 
                  placeholder="Home Address" 
                  autoCapitalize="words"
                />
              </Input>

              <Button 
                style={styles.button}
                onPress={handleNext}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Input style={styles.input}>
                <InputField 
                  value={password} 
                  onChangeText={setPassword} 
                  placeholder="Create Password" 
                  secureTextEntry
                />
              </Input>

              <Input style={[styles.input, { marginBottom: 24 }]}>
                <InputField 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  placeholder="Confirm Password" 
                  secureTextEntry
                />
              </Input>

              <Button 
                style={styles.button}
                onPress={handleSignUp}
              >
                Create Account
              </Button>
            </>
          )}

          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text 
              style={styles.link}
              onPress={() => router.push('/signin')}
            >
              Sign In
            </Text>
          </Text>
        </Center>
      </Box>
    </GluestackUIProvider>
  );
}

const styles = {
  input: {
    marginBottom: 16,
    width: '100%' as const,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  button: {
    width: '100%' as const,
    marginBottom: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 8
  },
  footerText: {
    color: '#64748b',
    textAlign: 'center' as const
  },
  link: {
    color: '#0ea5e9',
    textDecorationLine: 'underline' as const
  }
}; 