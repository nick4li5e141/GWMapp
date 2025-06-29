import {
  Box,
  GluestackUIProvider,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
// Import Firebase configuration
import { collection, doc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';

interface PayrollDetails {
  hoursWorked: number;
  hourlyRate: number;
  grossSalary: number;
  cpp: number;
  ei: number;
  incomeTax: number;
  netSalary: number;
  paymentDate: string;
  paymentStatus: 'Pending' | 'Paid';
  weeklyEarnings: {
    week: string;
    amount: number;
  }[];
  jobs: Job[];
}

interface Job {
  id: string;
  shiftStart: string;
  shiftEnd: string;
  pay: number;
  location: string;
  assignedBy: string;
  date: string;
}

export default function Payroll(): JSX.Element {
  const [payrollData, setPayrollData] = useState<PayrollDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const calculateHoursFromShift = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour - startHour) + (endMin - startMin) / 60;
  };

  const getWeekNumber = (date: Date): string => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const weekNumber = Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
    return `Week ${weekNumber}`;
  };

  const fetchPayrollData = async (userId: string) => {
    try {
      setLoading(true);
      const monthYear = `2023-10`;

      // Get the 4th of the selected month for calculation
      const calculationDate = new Date(selectedYear, selectedMonth - 1, 4);
      const paymentDate = new Date(selectedYear, selectedMonth - 1, 5);

      // Reference to the month document (e.g., '2023-10')
      const monthDocRef = doc(db, 'gwm', userId, 'scheduledShiftsDetails', monthYear);

      const weeklyEarnings: { week: string; amount: number }[] = [];
      let totalHours = 0;
      let totalPay = 0;
      const allJobsForMonth: Job[] = [];

      // Iterate through all days of the month to find shifts
      const numDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let day = 1; day <= numDaysInMonth; day++) {
        const dateString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const shiftDate = new Date(selectedYear, selectedMonth - 1, day);

        // Fetch jobs from the date subcollection under the month document
        const jobsSnapshot = await getDocs(collection(db, 'gwm', userId, 'scheduledShiftsDetails', monthYear, dateString));

        jobsSnapshot.forEach((jobDoc: any) => {
          const jobData = jobDoc.data() as Job;
          if (jobData) {
            console.log('Fetched jobData:', jobData);
            allJobsForMonth.push({ ...jobData, date: dateString });
            const hours = calculateHoursFromShift(jobData.shiftStart, jobData.shiftEnd);
            totalHours += hours;
            totalPay += jobData.pay || 0;
            console.log('Total Pay after job:', totalPay);

            const week = getWeekNumber(shiftDate);
            const existingWeek = weeklyEarnings.find(w => w.week === week);
            if (existingWeek) {
              existingWeek.amount += jobData.pay || 0;
            } else {
              weeklyEarnings.push({ week, amount: jobData.pay || 0 });
            }
          }
        });
      }

      console.log('Final Total Pay for month:', totalPay);
      // Calculate deductions
      const cpp = totalPay * 0.0595; // 5.95%
      const ei = totalPay * 0.0166; // 1.66%
      const incomeTax = totalPay * 0.10; // 10%
      const netSalary = totalPay - cpp - ei - incomeTax;

      setPayrollData({
        hoursWorked: totalHours,
        hourlyRate: totalHours > 0 ? totalPay / totalHours : 0,
        grossSalary: totalPay,
        cpp,
        ei,
        incomeTax,
        netSalary,
        paymentDate: paymentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        paymentStatus: new Date() >= paymentDate ? 'Paid' : 'Pending',
        weeklyEarnings: weeklyEarnings.sort((a, b) => {
          const weekA = parseInt(a.week.split(' ')[1]);
          const weekB = parseInt(b.week.split(' ')[1]);
          return weekA - weekB;
        }),
        jobs: allJobsForMonth,
      });
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      Alert.alert('Error', 'Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.isAuthenticated && session.email) {
            const usersRef = collection(db, 'gwm');
            const userQuery = query(usersRef, where('email', '==', session.email), limit(1));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
              const userId = userSnapshot.docs[0].id;
              setCurrentUserId(userId);
              await fetchPayrollData(userId);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserAndData();
  }, [selectedMonth, selectedYear]);

  const handlePrint = () => {
    Alert.alert('Print Payroll', 'Would you like to print this payroll information?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Print',
        onPress: () => {
          Alert.alert('Success', 'Printing started...');
        },
      },
    ]);
  };

  if (loading || !payrollData) {
    return (
      <GluestackUIProvider>
        <Box style={styles.mainContainer}>
          <Text style={styles.loadingText}>Loading payroll data...</Text>
        </Box>
      </GluestackUIProvider>
    );
  }

  const totalDeductions = payrollData.cpp + payrollData.ei + payrollData.incomeTax;

  return (
    <GluestackUIProvider>
      <Box style={styles.mainContainer}>
        <ScrollView>
          <VStack style={{ padding: 20, gap: 16 }}>
            <Heading style={{ color: '#334155', textAlign: 'center' }}>Payroll Summary</Heading>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Select Pay Period</Text>
              <HStack style={styles.pickerContainer}>
                <Box style={styles.pickerBox}>
                  <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                    style={styles.picker}
                  >
                    {months.map((month, index) => (
                      <Picker.Item key={month} label={month} value={index + 1} />
                    ))}
                  </Picker>
                </Box>
                <Box style={styles.pickerBox}>
                  <Picker
                    selectedValue={selectedYear}
                    onValueChange={(value) => setSelectedYear(value)}
                    style={styles.picker}
                  >
                    {years.map((year) => (
                      <Picker.Item key={year} label={year.toString()} value={year} />
                    ))}
                  </Picker>
                </Box>
              </HStack>
            </Box>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Pay Period Summary</Text>
              <Text style={styles.cardText}>Hours Worked: {payrollData.hoursWorked.toFixed(2)}</Text>
              <Text style={styles.cardText}>Hourly Rate: ${payrollData.hourlyRate.toFixed(2)}</Text>
              <Text style={styles.cardText}>Gross Salary: ${payrollData.grossSalary.toFixed(2)}</Text>
              <Text
                style={[
                  styles.cardText,
                  {
                    color: payrollData.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b',
                  },
                ]}
              >
                Status: {payrollData.paymentStatus}
              </Text>
              <Text style={styles.cardText}>Payment Date: {payrollData.paymentDate}</Text>
            </Box>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Jobs for Selected Month</Text>
              <VStack style={{ gap: 8 }}>
                {payrollData.jobs.length > 0 ? (
                  payrollData.jobs.map((job, index) => (
                    <View key={index} style={styles.jobItemPayroll}>
                      <Text style={styles.jobTextPayroll}>Date: {new Date(job.date).toLocaleDateString()}</Text>
                      <Text style={styles.jobTextPayroll}>Shift: {job.shiftStart} - {job.shiftEnd}</Text>
                      <Text style={styles.jobTextPayroll}>Pay: ${job.pay.toFixed(2)}</Text>
                      <Text style={styles.jobTextPayroll}>Location: {job.location}</Text>
                      <Text style={styles.jobTextPayroll}>Assigned By: {job.assignedBy}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.cardText}>No jobs found for this month.</Text>
                )}
              </VStack>
            </Box>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Weekly Earnings</Text>
              <VStack style={{ gap: 8 }}>
                {payrollData.weeklyEarnings.map((week, index) => (
                  <HStack key={index} style={styles.row}>
                    <Text style={styles.cardText}>{week.week}</Text>
                    <Text style={styles.cardText}>${week.amount.toFixed(2)}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Deductions</Text>
              <VStack style={{ gap: 8 }}>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>CPP (5.95%)</Text>
                  <Text style={styles.cardText}>${payrollData.cpp.toFixed(2)}</Text>
                </HStack>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>EI (1.66%)</Text>
                  <Text style={styles.cardText}>${payrollData.ei.toFixed(2)}</Text>
                </HStack>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>Income Tax (~10%)</Text>
                  <Text style={styles.cardText}>${payrollData.incomeTax.toFixed(2)}</Text>
                </HStack>
                <HStack style={[styles.row, { marginTop: 8 }]}>
                  <Text style={[styles.cardText, styles.boldText]}>Total Deductions</Text>
                  <Text style={[styles.cardText, styles.boldText]}>{`$${totalDeductions.toFixed(2)}`}</Text>
                </HStack>
              </VStack>
            </Box>

            <Pressable
              style={({ pressed }) => [styles.payrollPrintButton, pressed && styles.payrollPrintButtonPressed]}
              onPress={handlePrint}
            >
              <Text style={styles.payrollPrintButtonText}>Print Payroll</Text>
            </Pressable>

            <Box style={[styles.card, styles.netSalaryBox]}>
              <HStack style={styles.row}>
                <Text style={[styles.cardTitle, styles.whiteText]}>Net Salary</Text>
                <Text style={[styles.netSalaryText, styles.whiteText]}>
                  ${payrollData.netSalary.toFixed(2)}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ScrollView>
      </Box>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#334155',
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
  },
  row: {
    justifyContent: 'space-between',
  },
  boldText: {
    fontWeight: 'bold',
  },
  netSalaryBox: {
    backgroundColor: '#0ea5e9',
  },
  netSalaryText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  whiteText: {
    color: 'white',
  },
  payrollPrintButton: {
    backgroundColor: '#3390ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  payrollPrintButtonPressed: {
    backgroundColor: '#2563eb',
  },
  payrollPrintButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#64748b',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pickerBox: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  jobItemPayroll: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  jobTextPayroll: {
    fontSize: 14,
    color: '#64748b',
  },
});
