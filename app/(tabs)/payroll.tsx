import { Box, GluestackUIProvider, Heading, HStack, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import React from 'react';

interface PayrollDetails {
  currentMonth: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: {
    tax: number;
    insurance: number;
    other: number;
  };
  netSalary: number;
  paymentDate: string;
  paymentStatus: 'Pending' | 'Paid';
}

export default function Payroll(): JSX.Element {
  // TODO: Implement actual payroll calculations
  // Example calculation structure:
  // 1. Calculate gross salary
  //    grossSalary = baseSalary + overtime + bonuses
  //
  // 2. Calculate deductions
  //    - Tax calculation (e.g., progressive tax brackets)
  //    - Insurance (e.g., health insurance, retirement)
  //    - Other deductions (e.g., union fees, benefits)
  //
  // 3. Calculate net salary
  //    netSalary = grossSalary - totalDeductions
  //
  // 4. Additional considerations:
  //    - Overtime rate multipliers
  //    - Holiday pay
  //    - Performance bonuses
  //    - Tax credits
  //    - Social security contributions
  //    - Pension contributions

  // Mock data - in real app, this would come from your backend
  const payrollDetails: PayrollDetails = {
    currentMonth: 'March 2024',
    baseSalary: 5000,
    overtime: 200,
    bonuses: 300,
    deductions: {
      tax: 800,
      insurance: 200,
      other: 100
    },
    netSalary: 4400,
    paymentDate: 'March 31, 2024',
    paymentStatus: 'Pending'
  };

  const totalDeductions = 
    payrollDetails.deductions.tax + 
    payrollDetails.deductions.insurance + 
    payrollDetails.deductions.other;

  return (
    <GluestackUIProvider>
      <Box style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <ScrollView>
          <VStack style={{ padding: 20, gap: 16 }}>
            <Heading style={{ color: '#334155', textAlign: 'center' }}>
              My Payroll
            </Heading>

            {/* Current Month Summary */}
            <Box style={{ 
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                {payrollDetails.currentMonth}
              </Text>
              <HStack style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#64748b' }}>Status:</Text>
                <Text style={{ 
                  color: payrollDetails.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b',
                  fontWeight: 'bold'
                }}>
                  {payrollDetails.paymentStatus}
                </Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#64748b' }}>Payment Date:</Text>
                <Text>{payrollDetails.paymentDate}</Text>
              </HStack>
            </Box>

            {/* Salary Breakdown */}
            <Box style={{ 
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                Salary Breakdown
              </Text>

              <VStack style={{ gap: 8 }}>
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: '#64748b' }}>Base Salary</Text>
                  <Text>${payrollDetails.baseSalary}</Text>
                </HStack>
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: '#64748b' }}>Overtime</Text>
                  <Text>${payrollDetails.overtime}</Text>
                </HStack>
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: '#64748b' }}>Bonuses</Text>
                  <Text>${payrollDetails.bonuses}</Text>
                </HStack>
                <HStack style={{ justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Gross Salary</Text>
                  <Text style={{ fontWeight: 'bold' }}>
                    ${payrollDetails.baseSalary + payrollDetails.overtime + payrollDetails.bonuses}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Deductions */}
            <Box style={{ 
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                Deductions
              </Text>

              <VStack style={{ gap: 8 }}>
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: '#64748b' }}>Tax</Text>
                  <Text>${payrollDetails.deductions.tax}</Text>
                </HStack>
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: '#64748b' }}>Insurance</Text>
                  <Text>${payrollDetails.deductions.insurance}</Text>
                </HStack>
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: '#64748b' }}>Other</Text>
                  <Text>${payrollDetails.deductions.other}</Text>
                </HStack>
                <HStack style={{ justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Total Deductions</Text>
                  <Text style={{ fontWeight: 'bold' }}>${totalDeductions}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Net Salary */}
            <Box style={{ 
              backgroundColor: '#0ea5e9',
              borderRadius: 8,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Net Salary
                </Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
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
