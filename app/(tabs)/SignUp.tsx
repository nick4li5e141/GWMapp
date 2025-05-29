import { MaterialIcons } from '@expo/vector-icons';
import { Box, Button, Center, GluestackUIProvider, Heading, Input, InputField, Pressable, VStack } from '@gluestack-ui/themed';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { ReactElement, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import '../../firebase.config';

GoogleSignin.configure({
  webClientId: '741858069689-gj2e94lquffkmc5cjpt5bjiakv70vufl.apps.googleusercontent.com',
});

interface EmployeeData {
  Name: string;
  Age: string;
  Phone: string;
  email: string;
  Address: string;
}

export default function SignUp(): ReactElement {
  const [show, setShow] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passAgain, setPassAgain] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [step, setStep] = useState<number>(1);

  const handleNext = () => {
    if (!name || !email || !phone || !age || !address) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const pressed = async (): Promise<void> => {
    if (password === passAgain) {
      try {
        await auth().createUserWithEmailAndPassword(email, password);

        const employeeData: EmployeeData = {
          Name: name,
          Age: age,
          Phone: phone,
          email: email,
          Address: address
        };

        await firestore().collection('students').add(employeeData);

        Alert.alert('User Created and Data Saved!');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
          Alert.alert("That email address is already in use!");
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          Alert.alert("That email address is invalid!");
        }

        console.error(error);
      }
    } else {
      console.log("Passwords doesn't match");
      Alert.alert("Passwords doesn't match");
    }
  };

  return (
    <GluestackUIProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Box style={{ marginLeft: '10%', alignItems: 'center' }}>
          <Center>
            <Heading style={{ marginBottom: '5%', marginTop: '30%', color: '#64748b' }}>Sign Up</Heading>

            {step === 1 ? (
              <VStack style={{ gap: 20, alignItems: 'center' }}>
                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={name} 
                    onChangeText={setName} 
                    placeholder="Name" 
                  />
                </Input>
                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={email} 
                    onChangeText={setEmail} 
                    placeholder="E-mail" 
                  />
                </Input>
                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={phone} 
                    onChangeText={setPhone} 
                    placeholder="Phone" 
                  />
                </Input>
                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={age} 
                    onChangeText={setAge} 
                    placeholder="Age" 
                  />
                </Input>
                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={address} 
                    onChangeText={setAddress} 
                    placeholder="Address" 
                  />
                </Input>
                <Button 
                  style={{ 
                    width: '75%',
                    marginTop: '5%',
                    backgroundColor: '#0ea5e9'
                  }}
                  onPress={handleNext}
                >
                  Next
                </Button>
              </VStack>
            ) : (
              <VStack style={{ gap: 20, alignItems: 'center' }}>
                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    secureTextEntry={!show}
                  />
                  <Pressable onPress={() => setShow(!show)}>
                    <MaterialIcons 
                      name={show ? "visibility" : "visibility-off"} 
                      size={24} 
                      color="gray" 
                      style={{ marginRight: 8 }}
                    />
                  </Pressable>
                </Input>

                <Input style={{ width: '75%' }}>
                  <InputField 
                    value={passAgain}
                    onChangeText={setPassAgain}
                    placeholder="Re-Enter Password"
                    secureTextEntry={!show}
                  />
                  <Pressable onPress={() => setShow(!show)}>
                    <MaterialIcons 
                      name={show ? "visibility" : "visibility-off"} 
                      size={24} 
                      color="gray" 
                      style={{ marginRight: 8 }}
                    />
                  </Pressable>
                </Input>

                <Button 
                  style={{ 
                    width: '75%',
                    marginTop: '5%',
                    backgroundColor: '#0ea5e9'
                  }}
                  onPress={pressed}
                >
                  Sign Up
                </Button>
              </VStack>
            )}
          </Center>
        </Box>
      </ScrollView>
    </GluestackUIProvider>
  );
} 