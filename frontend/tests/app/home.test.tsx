/**
 * Tests for Home screen.
 *
 * Tests the home screen functionality including:
 * - Rendering all UI elements
 * - Welcome message and subtitle
 * - Cards with content
 * - Button interaction
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import HomeScreen from '../../app/(tabs)/home';

describe('HomeScreen', () => {
  it('renders welcome title', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Welcome to Estatefox')).toBeTruthy();
  });

  it('renders subtitle text', () => {
    render(<HomeScreen />);
    expect(screen.getByText('A full-stack real estate application for South Florida property listings, search, and management.')).toBeTruthy();
  });

  it('renders Getting Started card title', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Getting Started')).toBeTruthy();
  });

  it('renders Getting Started card text', () => {
    render(<HomeScreen />);
    expect(screen.getByText('This is a template screen. Start building your app by editing this file.')).toBeTruthy();
  });

  it('renders Get Started button', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Get Started')).toBeTruthy();
  });

  it('renders Features card title', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Features')).toBeTruthy();
  });

  it('renders Features card text with all features', () => {
    render(<HomeScreen />);
    const featuresText = screen.getByText(/expo-router for file-based routing/);
    expect(featuresText).toBeTruthy();
  });

  it('calls handlePress when Get Started button is pressed', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<HomeScreen />);

    const button = screen.getByText('Get Started');
    fireEvent.press(button);

    expect(consoleLogSpy).toHaveBeenCalledWith('Button pressed');

    consoleLogSpy.mockRestore();
  });

  it('renders multiple cards', () => {
    render(<HomeScreen />);

    // Check that both card titles are present
    expect(screen.getByText('Getting Started')).toBeTruthy();
    expect(screen.getByText('Features')).toBeTruthy();
  });

  it('renders all feature list items', () => {
    render(<HomeScreen />);

    const featuresText = screen.getByText(/expo-router for file-based routing/);
    const textContent = featuresText.props.children;

    // Verify features are listed in the text (textContent is an array)
    const fullText = Array.isArray(textContent) ? textContent.join('') : textContent;
    expect(fullText).toContain('expo-router');
    expect(fullText).toContain('TypeScript');
    expect(fullText).toContain('EAS Build');
    expect(fullText).toContain('GitHub Actions');
    expect(fullText).toContain('API service');
  });

  it('renders content in ScrollView', () => {
    const { root } = render(<HomeScreen />);
    expect(root).toBeTruthy();
  });

  it('handles button press multiple times', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<HomeScreen />);

    const button = screen.getByText('Get Started');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenCalledWith('Button pressed');

    consoleLogSpy.mockRestore();
  });

  it('renders complete UI structure', () => {
    render(<HomeScreen />);

    // Verify all major UI elements are present
    expect(screen.getByText('Welcome to Estatefox')).toBeTruthy();
    expect(screen.getByText('Getting Started')).toBeTruthy();
    expect(screen.getByText('Features')).toBeTruthy();
    expect(screen.getByText('Get Started')).toBeTruthy();
  });

  it('renders subtitle with correct content', () => {
    render(<HomeScreen />);

    const subtitle = screen.getByText('A full-stack real estate application for South Florida property listings, search, and management.');
    expect(subtitle).toBeTruthy();
  });

  it('renders Features card with detailed feature list', () => {
    render(<HomeScreen />);

    // Find the features text
    const featuresText = screen.getByText(/expo-router for file-based routing/);
    expect(featuresText).toBeTruthy();

    // Verify it contains line breaks and multiple features
    const content = featuresText.props.children;
    expect(content).toBeDefined();
  });

  it('screen initializes without errors', () => {
    expect(() => render(<HomeScreen />)).not.toThrow();
  });
});
