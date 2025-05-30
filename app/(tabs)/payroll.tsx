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
import React from 'react';
import { Alert, StyleSheet } from 'react-native';

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
}

// Example data
const examplePayroll: PayrollDetails = {
  hoursWorked: 160,
  hourlyRate: 17.20,
  grossSalary: 2752.0,
  cpp: 163.74,
  ei: 45.68,
  incomeTax: 275.2,
  netSalary: 2267.38,
  paymentDate: 'May 31, 2024',
  paymentStatus: 'Paid',
};

export default function Payroll(): JSX.Element {
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

  const totalDeductions = examplePayroll.cpp + examplePayroll.ei + examplePayroll.incomeTax;

  return (
    <GluestackUIProvider>
      <Box style={styles.mainContainer}>
        <ScrollView>
          <VStack style={{ padding: 20, gap: 16 }}>
            <Heading style={{ color: '#334155', textAlign: 'center' }}>Payroll Summary</Heading>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Pay Period Summary</Text>
              <Text style={styles.cardText}>Hours Worked: {examplePayroll.hoursWorked}</Text>
              <Text style={styles.cardText}>Hourly Rate: ${examplePayroll.hourlyRate}</Text>
              <Text style={styles.cardText}>Gross Salary: ${examplePayroll.grossSalary.toFixed(2)}</Text>
              <Text
                style={[
                  styles.cardText,
                  {
                    color: examplePayroll.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b',
                  },
                ]}
              >
                Status: {examplePayroll.paymentStatus}
              </Text>
              <Text style={styles.cardText}>Payment Date: {examplePayroll.paymentDate}</Text>
            </Box>

            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Deductions</Text>
              <VStack style={{ gap: 8 }}>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>CPP (5.95%)</Text>
                  <Text style={styles.cardText}>${examplePayroll.cpp.toFixed(2)}</Text>
                </HStack>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>EI (1.66%)</Text>
                  <Text style={styles.cardText}>${examplePayroll.ei.toFixed(2)}</Text>
                </HStack>
                <HStack style={styles.row}>
                  <Text style={styles.cardText}>Income Tax (~10%)</Text>
                  <Text style={styles.cardText}>${examplePayroll.incomeTax.toFixed(2)}</Text>
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
                  ${examplePayroll.netSalary.toFixed(2)}
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
    backgroundColor: ' #3390ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  payrollPrintButtonPressed: {
    backgroundColor: ' #3390ff ',
  },
  payrollPrintButtonText: {
    color: '#ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
