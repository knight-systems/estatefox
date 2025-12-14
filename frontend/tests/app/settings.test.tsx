/**
 * Tests for Settings screen.
 *
 * Tests the settings screen functionality including:
 * - Rendering all UI elements
 * - App information display
 * - Account section with logout button
 * - About section
 * - Logout button interaction
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import SettingsScreen from '../../app/(tabs)/settings';
import Constants from 'expo-constants';

// Mock Constants module
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      version: '1.0.0',
    },
  },
}));

describe('SettingsScreen', () => {
  it('renders settings title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders App Information card title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('App Information')).toBeTruthy();
  });

  it('renders version label', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Version:')).toBeTruthy();
  });

  it('renders Bundle ID label and value', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Bundle ID:')).toBeTruthy();
    expect(screen.getByText('com.knightsystems.estatefox')).toBeTruthy();
  });

  it('renders Account card title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Account')).toBeTruthy();
  });

  it('renders Logout button', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Logout')).toBeTruthy();
  });

  it('renders About card title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('renders About card text', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(/Built with Expo and React Native/)).toBeTruthy();
  });

  it('renders Author information in About text', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(/Author: Developer/)).toBeTruthy();
  });

  it('calls handleLogout when logout button is pressed', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<SettingsScreen />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.press(logoutButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Logout pressed');

    consoleLogSpy.mockRestore();
  });

  it('handles logout button press multiple times', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<SettingsScreen />);

    const logoutButton = screen.getByText('Logout');

    fireEvent.press(logoutButton);
    fireEvent.press(logoutButton);
    fireEvent.press(logoutButton);

    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenCalledWith('Logout pressed');

    consoleLogSpy.mockRestore();
  });

  it('renders all three cards', () => {
    render(<SettingsScreen />);

    // Check that all three card titles are present
    expect(screen.getByText('App Information')).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('renders content in ScrollView', () => {
    const { root } = render(<SettingsScreen />);
    expect(root).toBeTruthy();
  });

  it('displays version information section', () => {
    render(<SettingsScreen />);

    // Verify that the version label is displayed
    expect(screen.getByText('Version:')).toBeTruthy();
    // Version value comes from Constants.expoConfig.version
  });

  it('displays static bundle ID', () => {
    render(<SettingsScreen />);

    // Verify that the bundle ID is displayed correctly
    const bundleId = screen.getByText('com.knightsystems.estatefox');
    expect(bundleId).toBeTruthy();
  });

  it('renders complete UI structure', () => {
    render(<SettingsScreen />);

    // Verify all major UI elements are present
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('App Information')).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
    expect(screen.getByText('Logout')).toBeTruthy();
  });

  it('renders app information with correct labels', () => {
    render(<SettingsScreen />);

    // Check both labels in App Information section
    expect(screen.getByText('Version:')).toBeTruthy();
    expect(screen.getByText('Bundle ID:')).toBeTruthy();
  });

  it('renders full About text content', () => {
    render(<SettingsScreen />);

    const aboutText = screen.getByText(/Built with Expo and React Native/);
    expect(aboutText).toBeTruthy();

    // Check that both parts of the About text are present
    const textContent = aboutText.props.children;
    const fullText = Array.isArray(textContent) ? textContent.join('') : textContent;
    expect(fullText).toContain('Built with Expo and React Native');
    expect(fullText).toContain('Author: Developer');
  });

  it('screen initializes without errors', () => {
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('renders app information section with version and bundle ID rows', () => {
    render(<SettingsScreen />);

    // Should render both info rows
    expect(screen.getByText('Version:')).toBeTruthy();
    expect(screen.getByText('Bundle ID:')).toBeTruthy();
    expect(screen.getByText('com.knightsystems.estatefox')).toBeTruthy();
  });
});
