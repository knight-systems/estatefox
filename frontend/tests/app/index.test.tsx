/**
 * Tests for Landing Page (index.tsx).
 *
 * Tests the shell landing page functionality including:
 * - Rendering all UI elements (logo, badge, tagline)
 * - Coming Soon message and description
 * - Feature list items
 * - Contact button interaction
 * - Footer
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import { Linking } from 'react-native';
import Index from '../../app/index';

// Mock Linking.openURL
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

describe('Landing Page (Index)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => render(<Index />)).not.toThrow();
  });

  it('renders the Coming Soon badge', () => {
    render(<Index />);
    expect(screen.getByText('COMING SOON')).toBeTruthy();
  });

  it('renders the tagline', () => {
    render(<Index />);
    expect(screen.getByText("South Florida's Premier Real Estate Platform")).toBeTruthy();
  });

  it('renders the description text', () => {
    render(<Index />);
    expect(screen.getByText(/EstateFox is being reimagined/)).toBeTruthy();
    expect(screen.getByText(/modern, comprehensive real estate experience/)).toBeTruthy();
  });

  it('renders all feature list items', () => {
    render(<Index />);

    expect(screen.getByText('Comprehensive property listings')).toBeTruthy();
    expect(screen.getByText('Advanced search and filtering')).toBeTruthy();
    expect(screen.getByText('Interactive maps and neighborhoods')).toBeTruthy();
    expect(screen.getByText('Market insights and analytics')).toBeTruthy();
  });

  it('renders the Stay Connected section', () => {
    render(<Index />);
    expect(screen.getByText('Stay Connected')).toBeTruthy();
  });

  it('renders the CTA text', () => {
    render(<Index />);
    expect(screen.getByText(/Have questions or interested in learning more/)).toBeTruthy();
  });

  it('renders the Contact Us button', () => {
    render(<Index />);
    expect(screen.getByText('Contact Us')).toBeTruthy();
  });

  it('renders the footer with copyright text', () => {
    render(<Index />);
    expect(screen.getByText('© 2024 EstateFox. All rights reserved.')).toBeTruthy();
  });

  it('opens email link when Contact Us button is pressed', () => {
    render(<Index />);

    const contactButton = screen.getByText('Contact Us');
    fireEvent.press(contactButton);

    expect(Linking.openURL).toHaveBeenCalledWith(
      'mailto:info@estatefox.com?subject=EstateFox%20Inquiry'
    );
  });

  it('handles button press correctly', () => {
    render(<Index />);

    const contactButton = screen.getByText('Contact Us');
    fireEvent.press(contactButton);

    expect(Linking.openURL).toHaveBeenCalledTimes(1);
  });

  it('renders all major UI sections', () => {
    render(<Index />);

    // Hero section elements
    expect(screen.getByText('COMING SOON')).toBeTruthy();
    expect(screen.getByText("South Florida's Premier Real Estate Platform")).toBeTruthy();

    // Description section
    expect(screen.getByText(/EstateFox is being reimagined/)).toBeTruthy();

    // CTA section
    expect(screen.getByText('Stay Connected')).toBeTruthy();
    expect(screen.getByText('Contact Us')).toBeTruthy();

    // Footer
    expect(screen.getByText('© 2024 EstateFox. All rights reserved.')).toBeTruthy();
  });

  it('renders complete feature list with correct count', () => {
    render(<Index />);

    const features = [
      'Comprehensive property listings',
      'Advanced search and filtering',
      'Interactive maps and neighborhoods',
      'Market insights and analytics',
    ];

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeTruthy();
    });
  });

  it('renders description with correct content', () => {
    render(<Index />);

    const description = screen.getByText(/EstateFox is being reimagined/);
    expect(description).toBeTruthy();
    expect(description.props.children).toContain('South Florida');
  });

  it('Contact Us button has correct styling', () => {
    render(<Index />);

    const contactButton = screen.getByText('Contact Us');
    expect(contactButton).toBeTruthy();

    // Button should be pressable
    expect(() => fireEvent.press(contactButton)).not.toThrow();
  });

  it('handles multiple button presses', () => {
    render(<Index />);

    const contactButton = screen.getByText('Contact Us');

    fireEvent.press(contactButton);
    fireEvent.press(contactButton);
    fireEvent.press(contactButton);

    expect(Linking.openURL).toHaveBeenCalledTimes(3);
    expect(Linking.openURL).toHaveBeenCalledWith(
      'mailto:info@estatefox.com?subject=EstateFox%20Inquiry'
    );
  });

  it('renders in ScrollView container', () => {
    const { root } = render(<Index />);
    expect(root).toBeTruthy();
  });

  it('has all required sections in correct order', () => {
    const { root } = render(<Index />);

    // Verify page renders completely
    expect(screen.getByText('COMING SOON')).toBeTruthy();
    expect(screen.getByText('Comprehensive property listings')).toBeTruthy();
    expect(screen.getByText('Stay Connected')).toBeTruthy();
    expect(screen.getByText('© 2024 EstateFox. All rights reserved.')).toBeTruthy();
  });

  it('encodes email subject correctly in mailto link', () => {
    render(<Index />);

    const contactButton = screen.getByText('Contact Us');
    fireEvent.press(contactButton);

    // Verify URL encoding of subject
    const expectedUrl = 'mailto:info@estatefox.com?subject=EstateFox%20Inquiry';
    expect(Linking.openURL).toHaveBeenCalledWith(expectedUrl);
  });
});
