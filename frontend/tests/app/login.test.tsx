/**
 * Tests for Login screen.
 *
 * Tests the login screen functionality including:
 * - Rendering all UI elements
 * - User input handling
 * - Form submission
 * - Navigation to register screen
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import LoginScreen from '../../app/(auth)/login';

describe('LoginScreen', () => {
  it('renders welcome text', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
  });

  it('renders email input field', () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('Email');
    expect(emailInput).toBeTruthy();
  });

  it('renders password input field', () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');
    expect(passwordInput).toBeTruthy();
  });

  it('renders sign in button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('renders sign up link', () => {
    render(<LoginScreen />);
    expect(screen.getByText("Don't have an account? ")).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('updates email input when typing', () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('updates password input when typing', () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls handleLogin when sign in button is pressed', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Email');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(signInButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Login:', 'test@example.com');

    consoleLogSpy.mockRestore();
  });

  it('has email input with correct keyboard type', () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('Email');

    expect(emailInput.props.keyboardType).toBe('email-address');
  });

  it('has email input with autoCapitalize none', () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('Email');

    expect(emailInput.props.autoCapitalize).toBe('none');
  });

  it('has password input with secure text entry', () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('handles empty form submission', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<LoginScreen />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.press(signInButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Login:', '');

    consoleLogSpy.mockRestore();
  });

  it('handles form submission with only email', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Email');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(signInButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Login:', 'test@example.com');

    consoleLogSpy.mockRestore();
  });

  it('handles form submission with both email and password', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'user@test.com');
    fireEvent.changeText(passwordInput, 'securepass123');
    fireEvent.press(signInButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Login:', 'user@test.com');

    consoleLogSpy.mockRestore();
  });

  it('clears inputs when email is changed after initial value', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'first@example.com');
    expect(emailInput.props.value).toBe('first@example.com');

    fireEvent.changeText(emailInput, 'second@example.com');
    expect(emailInput.props.value).toBe('second@example.com');
  });

  it('maintains separate state for email and password', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });
});
