import { Box, GluestackUIProvider, Heading, HStack, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

interface PayrollDetails {
  hoursWorked: number | null; // Allow null while loading
  hourlyRate: number;
  grossSalary: number;
  cpp: number;
  ei: number;
  incomeTax: number;
  netSalary: number;
  paymentDate: string;
  paymentStatus: 'Pending' | 'Paid';
}

const calculatePayroll = (hoursWorked: number, hourlyRate: number): Omit<PayrollDetails, 'paymentDate' | 'paymentStatus' | 'hourlyRate' | 'hoursWorked'> => {
  const grossSalary = hoursWorked * hourlyRate;

  // Approximate 2024 Ontario payroll deductions for low income:
  const cpp = grossSalary * 0.0595;  // CPP = 5.95%
  const ei = grossSalary * 0.0166;   // EI = 1.66%
  const incomeTax = grossSalary * 0.10; // Conservative estimate for low-bracket Fed+Prov

  const totalDeductions = cpp + ei + incomeTax;
  const netSalary = grossSalary - totalDeductions;

  return {
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    cpp: parseFloat(cpp.toFixed(2)),
    ei: parseFloat(ei.toFixed(2)),
    incomeTax: parseFloat(incomeTax.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
  };
};

export default function Payroll(): JSX.Element {
  const [hoursWorked, setHoursWorked] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const hourlyRate = 17.20; // Example hourly rate
  const currentMonthYear = '2023-10'; // Match the month/year from MySchedule

  useEffect(() => {
    const fetchScheduledHours = async () => {
      const currentUser = (auth() as any).currentUser; // Bypass TypeScript error
      if (currentUser) {
        try {
          const docRef = firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('scheduledHours')
            .doc(currentMonthYear);

          const docSnap = await docRef.get();

          if ((docSnap as any).exists) {
            const data = docSnap.data();
            setHoursWorked(data?.totalHours || 0);
          } else {
            setHoursWorked(0); // Set to 0 if no data found for the month
          }
        } catch (error) {
          console.error('Error fetching scheduled hours:', error);
          setHoursWorked(0); // Set to 0 or handle error appropriately
        }
      }
      setLoading(false);
    };

    fetchScheduledHours();
  }, [currentMonthYear]); // Refetch if month/year changes

  const payrollDetails = hoursWorked !== null
    ? {
        ...calculatePayroll(hoursWorked, hourlyRate),
        hoursWorked,
        hourlyRate,
        paymentDate: 'May 31, 2025', // This could also be dynamic
        paymentStatus: 'Paid', // This could also be dynamic
      }
    : null; // payrollDetails is null while loading

  if (loading) {
    return (
      <Box style={styles.centeredContainer}>
        <Text style={styles.messageText}>Loading payroll data...</Text>
      </Box>
    );
  }

  if (!payrollDetails) {
     return (
      <Box style={styles.centeredContainer}>
        <Text style={styles.messageText}>No payroll data available for this month.</Text>
      </Box>
    );
  }

  const totalDeductions = payrollDetails.cpp + payrollDetails.ei + payrollDetails.incomeTax;

  return (
    <GluestackUIProvider>
      <Box style={styles.mainContainer}>
        <ScrollView>
          <VStack style={{ padding: 20, gap: 16 }}>
            <Heading style={{ color: '#334155', textAlign: 'center' }}>
              Payroll Summary
            </Heading>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Pay Period Summary</Text>
              <Text style={styles.cardText}>Hours Worked: {payrollDetails.hoursWorked}</Text>
              <Text style={styles.cardText}>Hourly Rate: ${payrollDetails.hourlyRate}</Text>
              <Text style={styles.cardText}>Gross Salary: ${payrollDetails.grossSalary.toFixed(2)}</Text>
              <Text style={[styles.cardText, { color: payrollDetails.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b' }]}>
                Status: {payrollDetails.paymentStatus}
              </Text>
              <Text style={styles.cardText}>Payment Date: {payrollDetails.paymentDate}</Text>
            </Box>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Deductions</Text>
              <VStack style={{ gap: 8 }}>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>CPP (5.95%)</Text>
                  <Text style={styles.cardText}>${payrollDetails.cpp}</Text>
                </HStack>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>EI (1.66%)</Text>
                  <Text style={styles.cardText}>${payrollDetails.ei}</Text>
                </HStack>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>Income Tax (~10%)</Text>
                  <Text style={styles.cardText}>${payrollDetails.incomeTax}</Text>
                </HStack>
                <HStack style={[styles.row, { marginTop: 8 }]}>
                  <Text style={[styles.cardText, styles.boldText]}>Total Deductions</Text>
                  <Text style={[styles.cardText, styles.boldText]}>${totalDeductions.toFixed(2)}</Text>
                </HStack>
              </VStack>
            </Box>

            <Box style={[styles.card, styles.netSalaryBox]}>
              <HStack style={styles.row}>
                <Text style={[styles.cardTitle, styles.whiteText]}>Net Salary</Text>
                <Text style={[styles.netSalaryText, styles.whiteText]}>
                  ${payrollDetails.netSalary}
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messageText: {
    fontSize: 18,
    color: '#64748b',
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
});
