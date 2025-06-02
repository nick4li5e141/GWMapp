import { Button, Text } from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('userSession');
      router.replace('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onPress={handleSignOut}
      isDisabled={loading}
      style={{
        backgroundColor: '#ef4444',
        opacity: loading ? 0.7 : 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </Text>
    </Button>
  );
} 