import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'expo-router/head';

/**
 * Create a QueryClient with sensible defaults for mobile.
 *
 * - retry: 2 - Retry failed requests twice
 * - staleTime: 30s - Data is fresh for 30 seconds
 * - gcTime: 5m - Cache is garbage collected after 5 minutes
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>EstateFox - South Florida Real Estate</title>
        <meta name="description" content="South Florida's premier real estate platform for property listings, search, and management." />
        <meta name="keywords" content="real estate, South Florida, Miami, property listings, homes for sale" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#17425a" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EstateFox - South Florida Real Estate" />
        <meta property="og:description" content="South Florida's premier real estate platform for property listings, search, and management." />
        <meta property="og:site_name" content="EstateFox" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EstateFox - South Florida Real Estate" />
        <meta name="twitter:description" content="South Florida's premier real estate platform for property listings, search, and management." />

        {/* PWA */}
        <meta name="application-name" content="EstateFox" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EstateFox" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Performance & SEO */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://estatefox.com" />
      </Head>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}

