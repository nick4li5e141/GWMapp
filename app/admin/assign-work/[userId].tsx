import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  activeOpacity?: number;
  disabled?: boolean;
  textColor?: string;
  disableTouchEvent?: boolean;
  status?: 'unavailable' | 'pending' | 'available' | 'request_pending' | 'request_approved' | 'request_rejected' | 'scheduled';
  pay?: number;
  shiftStart?: string;
  shiftEnd?: string;
  location?: string;
  assignedBy?: string;
  jobs?: Job[];
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

interface DayOffRequest {
  id: string; // Document ID (date string)
  userId: string; // UID of the user who requested it
  userEmail: string; // User's email for display
  date: Timestamp; // The date of the request
  status: 'pending' | 'approved' | 'rejected'; // Status of the request from Firestore
  requestedAt: Timestamp; // Timestamp of when the request was made
}

interface Job {
  id: string;
  shiftStart: string;
  shiftEnd: string;
  pay: number;
  location: string;
  assignedBy: string;
}

const AssignWork = () => {
  const { userId } = useLocalSearchParams(); // Get userId from route parameters
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scheduledShifts, setScheduledShifts] = useState<MarkedDates | null>(null);
  const [dayOffRequests, setDayOffRequests] = useState<DayOffRequest[]>([]);
  const [markedDatesForCalendar, setMarkedDatesForCalendar] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState<Job>({
    id: Date.now().toString(),
    shiftStart: '09:00',
    shiftEnd: '17:00',
    pay: 0,
    location: '',
    assignedBy: 'admin',
  });

  // Generate time options for dropdowns
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const combineMarkedDates = (shifts: MarkedDates | null, requests: DayOffRequest[]): MarkedDates => {
    const combined: MarkedDates = {};

    if (shifts) {
      Object.keys(shifts).forEach(date => {
        combined[date] = { ...shifts[date], status: 'scheduled', marked: true, selectedColor: '#00adf5' };
      });
    }

    requests.forEach(request => {
      let status: MarkedDate['status'];
      let color: string;

      if (request.status === 'pending') {
        status = 'request_pending';
        color = '#FFC107';
      } else if (request.status === 'approved') {
        status = 'request_approved';
        color = '#4CAF50';
      } else if (request.status === 'rejected') {
        status = 'request_rejected';
        color = '#F44336';
      } else {
        return;
      }

      combined[request.id] = {
        ...combined[request.id],
        selected: true,
        selectedColor: color,
        dotColor: color,
        textColor: color,
        status: status,
        marked: true,
      };
    });

    return combined;
  };

  useEffect(() => {
    if (!userId || typeof userId !== 'string') {
      console.error('User ID not provided in route parameters.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        const fetchedShifts: MarkedDates = {};
        
        // Get all dates that have jobs
        const dates = ['2025-06-02', '2025-06-12']; // Add more dates as needed
        
        for (const date of dates) {
          const datesSnapshot = await firestore()
            .collection('gwm')
            .doc(userId)
            .collection('scheduledShiftsDetails')
            .doc('2023-10')
            .collection(date)
            .get();
          
          // Get all jobs for this date
          const jobs: Job[] = [];
          datesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data) {
              jobs.push({
                id: doc.id,
                shiftStart: data.shiftStart,
                shiftEnd: data.shiftEnd,
                pay: data.pay,
                location: data.location,
                assignedBy: data.assignedBy,
              });
            }
          });

          if (jobs.length > 0) {
            fetchedShifts[date] = {
              status: 'scheduled',
              marked: true,
              selectedColor: '#00adf5',
              jobs: jobs
            };
          }
        }

        setScheduledShifts(fetchedShifts);
        console.log('Fetched scheduled shifts for', userId, ':', fetchedShifts);

        const requestsSnapshot = await firestore()
          .collection('gwm')
          .doc(userId)
          .collection('dayOffRequests')
          .get();

        const requestsList: DayOffRequest[] = [];
        requestsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.date && data.status && data.requestedAt) {
             requestsList.push({
               id: doc.id,
               userId: userId,
               userEmail: 'N/A',
               date: data.date as Timestamp,
               status: data.status as 'pending' | 'approved' | 'rejected',
               requestedAt: data.requestedAt as Timestamp,
             });
          }
        });
        setDayOffRequests(requestsList);
        console.log('Fetched day off requests for', userId, ':', requestsList);

        setMarkedDatesForCalendar(combineMarkedDates(fetchedShifts, requestsList));

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

  }, [userId]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    console.log('Day pressed:', day.dateString);
  };

  const selectedDayScheduledShift = selectedDate && scheduledShifts ? scheduledShifts[selectedDate] : null;
  const selectedDayRequest = selectedDate ? dayOffRequests.find(req => req.id === selectedDate) : null;

  const addJob = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date first.');
      return;
    }
    setJobs([...jobs, { ...newJob, id: Date.now().toString() }]);
    setNewJob({
      id: Date.now().toString(),
      shiftStart: '09:00',
      shiftEnd: '17:00',
      pay: 0,
      location: '',
      assignedBy: 'admin',
    });
  };

  const removeJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const saveJobs = async () => {
    if (!selectedDate || jobs.length === 0) {
      Alert.alert('Error', 'Please select a date and add at least one job.');
      return;
    }

    try {
      const jobsData = jobs.map(job => ({
        shiftStart: job.shiftStart,
        shiftEnd: job.shiftEnd,
        pay: job.pay,
        location: job.location,
        assignedBy: job.assignedBy,
      }));

      // Update the path to match the correct structure
      const dateDocRef = firestore()
        .collection('gwm')
        .doc(userId as string)
        .collection('scheduledShiftsDetails')
        .doc('2023-10')
        .collection(selectedDate);

      // Save each job as a separate document
      for (const job of jobsData) {
        await dateDocRef.add(job);
      }

      Alert.alert('Success', 'Jobs saved successfully.');
      router.back();
    } catch (error) {
      console.error('Error saving jobs:', error);
      Alert.alert('Error', 'Failed to save jobs. Please try again.');
    }
  };

  // Update how we get jobs for the selected date
  const jobsForSelectedDate: Job[] = selectedDate && scheduledShifts && scheduledShifts[selectedDate]?.jobs
    ? scheduledShifts[selectedDate].jobs as Job[]
    : [];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Assign Work</Text>
      <Text style={{ marginBottom: 20 }}>Assign work for user ID: {userId}</Text>

      <Calendar
        style={styles.calendar}
        initialDate={new Date().toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        monthFormat={'yyyy MM'}
        firstDay={1}
        enableSwipeMonths={true}
        markedDates={{
          ...markedDatesForCalendar,
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#00adf5' } } : {}),
        }}
        theme={{
          todayTextColor: '#00adf5',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#00adf5',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16
        }}
      />

      {selectedDate && (
         <View style={styles.selectedDayDetails}>
           <Text style={styles.selectedDayHeaderText}>Assign Jobs for {selectedDate}:</Text>

           {/* List all existing jobs for the selected date */}
           {jobsForSelectedDate.length > 0 && (
             <View style={styles.jobsList}>
               <Text style={styles.jobsListTitle}>Existing Jobs for {selectedDate}:</Text>
               {jobsForSelectedDate.map((job, idx) => (
                 <View key={job.id || idx} style={styles.jobItem}>
                   <Text style={styles.jobText}>Shift: {job.shiftStart} - {job.shiftEnd}</Text>
                   <Text style={styles.jobText}>Pay: ${job.pay}</Text>
                   <Text style={styles.jobText}>Location: {job.location}</Text>
                   <Text style={styles.jobText}>Assigned By: {job.assignedBy}</Text>
                 </View>
               ))}
             </View>
           )}

           {selectedDayRequest ? (
             <View style={styles.detailItem}>
               <Text style={styles.detailText}>Day Off Request Status: {selectedDayRequest.status}</Text>
               <Text style={styles.detailText}>Requested At: {selectedDayRequest.requestedAt.toDate().toLocaleString()}</Text>
             </View>
           ) : ( jobsForSelectedDate.length === 0 && <Text style={styles.detailText}>No scheduled jobs for this date.</Text> )}

           {!selectedDayScheduledShift && !selectedDayRequest && (
               <Text style={styles.detailText}>No schedule information or day off request for this date.</Text>
           )}

           <View style={styles.jobForm}>
             <View style={styles.timePickerContainer}>
               <Text style={styles.label}>Shift Start:</Text>
               <Picker
                 selectedValue={newJob.shiftStart}
                 onValueChange={(value: string) => setNewJob({ ...newJob, shiftStart: value })}
                 style={styles.picker}
               >
                 {timeOptions.map((time) => (
                   <Picker.Item key={time} label={time} value={time} />
                 ))}
               </Picker>
             </View>

             <View style={styles.timePickerContainer}>
               <Text style={styles.label}>Shift End:</Text>
               <Picker
                 selectedValue={newJob.shiftEnd}
                 onValueChange={(value: string) => setNewJob({ ...newJob, shiftEnd: value })}
                 style={styles.picker}
               >
                 {timeOptions.map((time) => (
                   <Picker.Item key={time} label={time} value={time} />
                 ))}
               </Picker>
             </View>

             <TextInput
               style={styles.input}
               placeholder="Pay Amount ($)"
               value={newJob.pay.toString()}
               onChangeText={(text) => setNewJob({ ...newJob, pay: parseFloat(text) || 0 })}
               keyboardType="numeric"
             />
             <TextInput
               style={styles.input}
               placeholder="Location"
               value={newJob.location}
               onChangeText={(text) => setNewJob({ ...newJob, location: text })}
             />
             <Pressable style={styles.addButton} onPress={addJob}>
               <Text style={styles.buttonText}>Add Job</Text>
             </Pressable>
           </View>

           {jobs.length > 0 && (
             <View style={styles.jobsList}>
               <Text style={styles.jobsListTitle}>Added Jobs:</Text>
               {jobs.map(job => (
                 <View key={job.id} style={styles.jobItem}>
                   <Text style={styles.jobText}>Shift: {job.shiftStart} - {job.shiftEnd}</Text>
                   <Text style={styles.jobText}>Pay: ${job.pay}</Text>
                   <Text style={styles.jobText}>Location: {job.location}</Text>
                   <Pressable style={styles.removeButton} onPress={() => removeJob(job.id)}>
                     <Text style={styles.buttonText}>Remove</Text>
                   </Pressable>
                 </View>
               ))}
               <Pressable style={styles.saveButton} onPress={saveJobs}>
                 <Text style={styles.buttonText}>Save Jobs</Text>
               </Pressable>
             </View>
           )}
         </View>
      )}

    </ScrollView>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 5,
    marginBottom: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayDetails: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eaf6ff',
    borderRadius: 8,
  },
  selectedDayHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailItem: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  jobForm: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  jobsList: {
    marginTop: 20,
  },
  jobsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jobItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  jobText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  timePickerContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default AssignWork; 