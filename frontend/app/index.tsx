import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Add authentication check here
  // If not authenticated, redirect to (auth)/login
  // If authenticated, redirect to (tabs)/home

  return <Redirect href="/(tabs)/home" />;
}
