import { Button, Center, Container, Heading, Input } from '@gluestack-ui/themed';
import firestore from '@react-native-firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert } from 'react-native';

type RootStackParamList = {
  Signin: undefined;
  // Add other screens as needed
};

type AddObjScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signin'>;

interface AddObjProps {
  navigation: AddObjScreenNavigationProp;
}

interface EmployeeData {
  Name: string;
  Age: string;
  Phone: string;
  email: string;
  Address: string;
}

export default function AddObj({ navigation }: AddObjProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const addEmployee = async (): Promise<void> => {
    try {
      const employeeData: EmployeeData = {
        Name: name,
        Age: age,
        Phone: phone,
        email: email,
        Address: address
      };

      await firestore()
        .collection('students')
        .add(employeeData);

      Alert.alert("User added Successfully");
      navigation.navigate('Signin');
    } catch (error) {
      console.error('Error adding employee:', error);
      Alert.alert("Error adding user");
    }
  };

  return (
    <NativeBaseProvider backgroundColor>
      <Container ml={"10%"} alignItems={"center"}>
        <Center>
          <Heading mb={"20%"} mt={"30%"} color={"blueGray.700"} size="lg">Add Employer</Heading>

          <Input 
            mt={"0%"} 
            variant="rounded" 
            value={email} 
            onChangeText={setEmail} 
            placeholder="E-mail" 
          />
          
          <Input 
            mt={"5%"} 
            variant="rounded" 
            value={name} 
            onChangeText={setName} 
            placeholder="Name" 
          />
          
          <Input 
            mt={"5%"} 
            variant="rounded" 
            value={phone} 
            onChangeText={setPhone} 
            placeholder="Phone" 
          />
          
          <Input 
            mt={"5%"} 
            variant="rounded" 
            value={age} 
            onChangeText={setAge} 
            placeholder="Age" 
          />
          
          <Input 
            mt={"5%"} 
            variant="rounded" 
            value={address} 
            onChangeText={setAddress} 
            placeholder="Address" 
          />

          <Button 
            size="lg"
            mt={"20%"}
            fontSize={"4%"}
            colorScheme={"cyan"}
            onPress={addEmployee}
          >
            Add
          </Button>
        </Center>
      </Container>
    </NativeBaseProvider>
  );
} 