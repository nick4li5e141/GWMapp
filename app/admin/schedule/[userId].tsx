import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  jobs?: Job[];
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

interface DayOffRequest {
  id: string;
  userId: string;
  userEmail: string;
  date: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
}

interface Job {
  id: string;
  shiftStart: string;
  shiftEnd: string;
  pay: number;
  location: string;
  assignedBy: string;
}

const UserSchedule = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scheduledShifts, setScheduledShifts] = useState<MarkedDates | null>(null);
  const [dayOffRequests, setDayOffRequests] = useState<DayOffRequest[]>([]);
  const [markedDatesForCalendar, setMarkedDatesForCalendar] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState('');

  const combineMarkedDates = (shifts: MarkedDates | null, requests: DayOffRequest[]): MarkedDates => {
    const combined: MarkedDates = {};

    if (shifts) {
      Object.keys(shifts).forEach(date => {
        const shiftData = shifts[date];
        if (Array.isArray(shiftData)) {
          // If it's an array of jobs, mark the date as scheduled
          combined[date] = {
            status: 'scheduled',
            marked: true,
            selectedColor: '#00adf5',
            // Store the array of jobs in the marked date
            jobs: shiftData
          };
        } else {
          // If it's a single job, mark it as scheduled
          combined[date] = {
            ...shiftData,
            status: 'scheduled',
            marked: true,
            selectedColor: '#00adf5'
          };
        }
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

  // Update how we get jobs for the selected date
  const jobsForSelectedDate: Job[] = selectedDate && scheduledShifts && scheduledShifts[selectedDate]?.jobs
    ? scheduledShifts[selectedDate].jobs as Job[]
    : [];

  const selectedDayRequest = selectedDate ? dayOffRequests.find(req => req.id === selectedDate) : null;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>User Schedule</Text>
      <Text style={{ marginBottom: 20 }}>Schedule for user ID: {userId}</Text>

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
          <Text style={styles.selectedDayHeaderText}>Schedule for {selectedDate}:</Text>

          {/* List all jobs for the selected date */}
          {jobsForSelectedDate.length > 0 && (
            <View style={styles.jobsList}>
              <Text style={styles.jobsListTitle}>Scheduled Jobs:</Text>
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

          {selectedDayRequest && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>Day Off Request Status: {selectedDayRequest.status}</Text>
              <Text style={styles.detailText}>Requested At: {selectedDayRequest.requestedAt.toDate().toLocaleString()}</Text>
            </View>
          )}

          {!jobsForSelectedDate.length && !selectedDayRequest && (
            <Text style={styles.detailText}>No schedule information or day off request for this date.</Text>
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
  jobsList: {
    marginTop: 10,
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
});

export default UserSchedule; 