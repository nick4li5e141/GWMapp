import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Benefit {
  id: string;
  name: string;
  summary: string;
  details: string;
}

const mockBenefits: Benefit[] = [
  {
    id: '1',
    name: 'Health Insurance',
    summary: 'Comprehensive health coverage for you and your family.',
    details: 'Covers doctor visits, hospital stays, prescriptions, and more. Provider: HealthCo. Group #: 12345. For claims, call 1-800-555-HEALTH.',
  },
  {
    id: '2',
    name: 'Dental Insurance',
    summary: 'Dental care including cleanings, fillings, and more.',
    details: 'Provider: SmileCare. Group #: 67890. Covers preventive and basic dental services. For claims, call 1-800-555-TEETH.',
  },
  {
    id: '3',
    name: 'Paid Time Off (PTO)',
    summary: 'Accrue paid days off for vacation, illness, or personal time.',
    details: 'You accrue 1.5 days per month. Request PTO through the claim form below or contact HR.',
  },
];

const mockFAQ = [
  { q: 'How do I submit a claim?', a: 'Use the form below or contact HR for assistance.' },
  { q: 'Who is the health insurance provider?', a: 'HealthCo. See details above.' },
  { q: 'How many PTO days do I have?', a: 'Check the PTO section above or contact HR.' },
];

export default function Benefit() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimType, setClaimType] = useState('');
  const [claimDesc, setClaimDesc] = useState('');

  const handleSubmitClaim = () => {
    if (!claimType.trim() || !claimDesc.trim()) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    setClaimType('');
    setClaimDesc('');
    setShowClaimForm(false);
    Alert.alert('Claim submitted!', 'Your claim/request has been sent to HR.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Benefits</Text>

      <Text style={styles.sectionTitle}>Benefit Summary</Text>
      {mockBenefits.map(benefit => (
        <View key={benefit.id} style={styles.benefitCard}>
          <Pressable onPress={() => setExpanded(expanded === benefit.id ? null : benefit.id)}>
            <Text style={styles.benefitName}>{benefit.name}</Text>
            <Text style={styles.benefitSummary}>{benefit.summary}</Text>
            <Text style={styles.expandText}>{expanded === benefit.id ? 'Hide Details ▲' : 'Show Details ▼'}</Text>
          </Pressable>
          {expanded === benefit.id && (
            <Text style={styles.benefitDetails}>{benefit.details}</Text>
          )}
        </View>
      ))}

      <Pressable style={styles.claimButton} onPress={() => setShowClaimForm(!showClaimForm)}>
        <Text style={styles.claimButtonText}>{showClaimForm ? 'Cancel' : 'Submit a Claim/Request'}</Text>
      </Pressable>

      {showClaimForm && (
        <View style={styles.claimFormBox}>
          <Text style={styles.formLabel}>Benefit Type</Text>
          <TextInput
            style={styles.input}
            value={claimType}
            onChangeText={setClaimType}
            placeholder="e.g. Health Insurance, PTO, etc."
          />
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.input}
            value={claimDesc}
            onChangeText={setClaimDesc}
            placeholder="Describe your claim or request..."
            multiline
          />
          <Pressable style={styles.submitButton} onPress={handleSubmitClaim}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Contact HR / Provider</Text>
      <View style={styles.contactBox}>
        <Text style={styles.contactText}>HR Email: hr@company.com</Text>
        <Text style={styles.contactText}>HR Phone: (555) 987-6543</Text>
      </View>

      <Text style={styles.sectionTitle}>FAQ</Text>
      {mockFAQ.map((item, idx) => (
        <View key={idx} style={styles.faqBox}>
          <Text style={styles.faqQ}>{item.q}</Text>
          <Text style={styles.faqA}>{item.a}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#334155',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#334155',
  },
  benefitCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  benefitName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 2,
  },
  benefitSummary: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 4,
  },
  expandText: {
    color: '#3b82f6',
    fontSize: 13,
    marginBottom: 4,
  },
  benefitDetails: {
    color: '#334155',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 2,
  },
  claimButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  claimButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  claimFormBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  formLabel: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#334155',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactBox: {
    backgroundColor: '#e0e7ef',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    marginBottom: 30,
  },
  contactText: {
    color: '#334155',
    fontSize: 15,
    marginBottom: 4,
  },
  faqBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  faqQ: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  faqA: {
    color: '#475569',
    fontSize: 14,
  },
});
