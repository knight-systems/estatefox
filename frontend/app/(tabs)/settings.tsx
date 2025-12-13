import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout pressed');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>{Constants.expoConfig?.version}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bundle ID:</Text>
          <Text style={styles.infoValue}>com.knightsystems.estatefox</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Button title="Logout" onPress={handleLogout} variant="secondary" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardText}>
          Built with Expo and React Native.{'\n'}
          Author: Developer
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  card: {
    margin: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
});
