import firestore from '@react-native-firebase/firestore';
import React, { ReactElement, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface User {
  key: string;
  Name: string;
  Phone: string;
  email: string;
  Address: string;
  Age: number;
}

export default function ListView(): ReactElement {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('students')
      .onSnapshot(querySnapshot => {
        const users: User[] = [];

        querySnapshot.forEach(documentSnapshot => {
          users.push({
            ...documentSnapshot.data() as Omit<User, 'key'>,
            key: documentSnapshot.id,
          });
        });

        setUsers(users);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  return (
    <View>
      <FlatList
        data={users}
        renderItem={({ item }: { item: User }) => (
          <TouchableOpacity style={{ height: 200, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: 'black' }}>
            <Text>Name: {item.Name}</Text>
            <Text>Phone: {item.Phone}</Text>
            <Text>E-mail: {item.email}</Text>
            <Text>Address: {item.Address}</Text>
            <Text>Age: {item.Age}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
} 