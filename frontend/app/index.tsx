import { StyleSheet, Text, View, ScrollView, Image, Linking, Platform } from 'react-native';
import { Button } from '@/components/ui/Button';

/**
 * Shell landing page for EstateFox.com
 *
 * A modern "Coming Soon" placeholder showcasing:
 * - EstateFox branding with logo
 * - Brand colors (navy #17425a, light blue #2d99d1, orange #ea8a2e)
 * - Brief description of the South Florida real estate platform
 * - Contact information
 */
export default function Index() {
  const handleContactPress = () => {
    const email = 'info@estatefox.com';
    const subject = 'EstateFox Inquiry';
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroSection}>
        {/* Logo */}
        <Image
          source={require('../assets/logo-horizontal.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Coming Soon Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMING SOON</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          South Florida's Premier Real Estate Platform
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <Text style={styles.description}>
          EstateFox is being reimagined to bring you a modern, comprehensive real estate experience
          for property listings, search, and management across South Florida.
        </Text>

        <View style={styles.featuresList}>
          <FeatureItem text="Comprehensive property listings" />
          <FeatureItem text="Advanced search and filtering" />
          <FeatureItem text="Interactive maps and neighborhoods" />
          <FeatureItem text="Market insights and analytics" />
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Stay Connected</Text>
        <Text style={styles.ctaText}>
          Have questions or interested in learning more about EstateFox?
        </Text>
        <Button
          title="Contact Us"
          onPress={handleContactPress}
          style={styles.ctaButton}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 EstateFox. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

/**
 * Feature list item component with custom bullet point
 */
function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.bullet} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 60 : 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#17425a', // Primary navy
  },
  logo: {
    width: '100%',
    maxWidth: 400,
    height: 100,
    marginBottom: 30,
  },
  badge: {
    backgroundColor: '#ea8a2e', // Orange
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    maxWidth: 600,
  },
  descriptionSection: {
    width: '100%',
    maxWidth: 700,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: '#3C3C43',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresList: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 500,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d99d1', // Light blue
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#3C3C43',
    flex: 1,
  },
  ctaSection: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#17425a', // Primary navy
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#2d99d1', // Light blue
    minWidth: 200,
  },
  footer: {
    marginTop: 50,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
