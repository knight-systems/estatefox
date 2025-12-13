import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const handlePress = () => {
    console.log('Button pressed');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Estatefox</Text>
        <Text style={styles.subtitle}>A full-stack real estate application for South Florida property listings, search, and management.</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Getting Started</Text>
        <Text style={styles.cardText}>
          This is a template screen. Start building your app by editing this file.
        </Text>
        <Button title="Get Started" onPress={handlePress} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Features</Text>
        <Text style={styles.cardText}>
          • expo-router for file-based routing{'\n'}
          • TypeScript for type safety{'\n'}
          • Pre-configured EAS Build{'\n'}
          • GitHub Actions CI/CD{'\n'}
          • API service layer
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  card: {
    margin: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
    marginBottom: 16,
  },
});
