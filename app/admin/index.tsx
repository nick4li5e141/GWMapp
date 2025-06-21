import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Button as RNButton, StyleSheet, Text, View } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
}

interface DayOffRequest {
  id: string;
  userId: string;
  userEmail: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allDayOffRequests, setAllDayOffRequests] = useState<DayOffRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const router = useRouter();

  const viewUserSchedule = (userId: string) => {
    console.log('View schedule for user:', userId);
    router.push(`/admin/schedule/${userId}`);
  };

  const assignWorkToUser = (userId: string) => {
    console.log('Assign work to user:', userId);
    router.push(`/admin/assign-work/${userId}`);
  };

  const fetchAllDayOffRequests = async (usersList: User[]) => {
     try {
       setLoadingRequests(true);
       const allRequests: DayOffRequest[] = [];

       const today = new Date();
       const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
       const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

       const firstDay = firstDayOfWeek.toISOString().split('T')[0];
       const lastDay = lastDayOfWeek.toISOString().split('T')[0];

       console.log('Filtering requests for the week:', firstDay, 'to', lastDay);

       for (const user of usersList) {
         const requestsSnapshot = await firestore()
           .collection('gwm')
           .doc(user.id)
           .collection('dayOffRequests')
           .where('date', '>=', firstDay)
           .where('date', '<=', lastDay)
           .get();

         requestsSnapshot.forEach(doc => {
           const data = doc.data();
           allRequests.push({
             id: doc.id,
             userId: user.id,
             userEmail: user.email,
             date: data.date,
             status: data.status,
             requestedAt: data.requestedAt,
           } as DayOffRequest);
         });
       }

       setAllDayOffRequests(allRequests);
       console.log('Fetched and filtered day off requests:', allRequests);
     } catch (error) {
       console.error('Error fetching all day off requests:', error);
     } finally {
       setLoadingRequests(false);
     }
  };

  const updateRequestStatus = async (userId: string, requestId: string, status: 'approved' | 'rejected') => {
    try {
      await firestore()
        .collection('gwm')
        .doc(userId)
        .collection('dayOffRequests')
        .doc(requestId)
        .update({ status: status });

      Alert.alert('Success', `Request ${status} successfully.`);

      const usersList = users;
      if (usersList.length > 0) {
         fetchAllDayOffRequests(usersList);
      }

    } catch (error) {
      console.error(`Error updating request status to ${status}:`, error);
      Alert.alert('Error', `Failed to ${status} request.`);
    }
  };

  const approveDayOffRequest = (userId: string, requestId: string) => {
    updateRequestStatus(userId, requestId, 'approved');
  };

  const rejectDayOffRequest = (userId: string, requestId: string) => {
    updateRequestStatus(userId, requestId, 'rejected');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersCollection = await firestore().collection('gwm').get();
        const usersList = usersCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<User, 'id'>
        }));
        setUsers(usersList);
        console.log('Fetched users:', usersList);
        return usersList;
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers().then(usersList => {
       if (usersList.length > 0) {
         fetchAllDayOffRequests(usersList);
       }
    });

  }, []);

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      {item.role && <Text style={styles.userRole}>Role: {item.role}</Text>}
      <View style={styles.userActions}>
        <RNButton title="View" onPress={() => viewUserSchedule(item.id)} />
        <RNButton title="Assign Work" onPress={() => assignWorkToUser(item.id)} color="#007BFF" />
      </View>
    </View>
  );

  const renderRequestItem = ({ item }: { item: DayOffRequest }) => (
    <View style={styles.requestItem}>
      <Text style={styles.requestUser}>User: {item.userEmail}</Text>
      <Text style={styles.requestDate}>Date: {item.date}</Text>
      <Text style={styles.requestStatus}>Status: {item.status}</Text>
      <View style={styles.requestActions}>
        <RNButton title="Approve" onPress={() => approveDayOffRequest(item.userId, item.id)} />
        <RNButton title="Reject" onPress={() => rejectDayOffRequest(item.userId, item.id)} color="#f44336" />
      </View>
    </View>
  );

  if (loadingUsers || loadingRequests) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      <Text style={styles.subHeader}>User List</Text>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No users found.</Text>}
      />

      <Text style={styles.subHeader}>Day Off Requests</Text>
      <FlatList
        data={allDayOffRequests}
        renderItem={renderRequestItem}
        keyExtractor={item => item.id + item.userId}
        ListEmptyComponent={<Text>No day off requests found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userRole: {
    fontSize: 14,
    color: '#007BFF',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  }
});

export default AdminDashboard; 