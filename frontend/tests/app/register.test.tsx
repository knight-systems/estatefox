/**
 * Tests for Register screen.
 *
 * Tests the register screen functionality including:
 * - Rendering all UI elements
 * - User input handling
 * - Form submission
 * - Navigation to login screen
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import RegisterScreen from '../../app/(auth)/register';

describe('RegisterScreen', () => {
  it('renders create account text', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Create Account')).toBeTruthy();
    expect(screen.getByText('Sign up to get started')).toBeTruthy();
  });

  it('renders name input field', () => {
    render(<RegisterScreen />);
    const nameInput = screen.getByPlaceholderText('Full Name');
    expect(nameInput).toBeTruthy();
  });

  it('renders email input field', () => {
    render(<RegisterScreen />);
    const emailInput = screen.getByPlaceholderText('Email');
    expect(emailInput).toBeTruthy();
  });

  it('renders password input field', () => {
    render(<RegisterScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');
    expect(passwordInput).toBeTruthy();
  });

  it('renders sign up button', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('renders sign in link', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Already have an account? ')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('updates name input when typing', () => {
    render(<RegisterScreen />);
    const nameInput = screen.getByPlaceholderText('Full Name');

    fireEvent.changeText(nameInput, 'John Doe');

    expect(nameInput.props.value).toBe('John Doe');
  });

  it('updates email input when typing', () => {
    render(<RegisterScreen />);
    const emailInput = screen.getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('updates password input when typing', () => {
    render(<RegisterScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls handleRegister when sign up button is pressed', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<RegisterScreen />);

    const emailInput = screen.getByPlaceholderText('Email');
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(signUpButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Register:', 'test@example.com');

    consoleLogSpy.mockRestore();
  });

  it('has name input with autoCapitalize words', () => {
    render(<RegisterScreen />);
    const nameInput = screen.getByPlaceholderText('Full Name');

    expect(nameInput.props.autoCapitalize).toBe('words');
  });

  it('has email input with correct keyboard type', () => {
    render(<RegisterScreen />);
    const emailInput = screen.getByPlaceholderText('Email');

    expect(emailInput.props.keyboardType).toBe('email-address');
  });

  it('has email input with autoCapitalize none', () => {
    render(<RegisterScreen />);
    const emailInput = screen.getByPlaceholderText('Email');

    expect(emailInput.props.autoCapitalize).toBe('none');
  });

  it('has password input with secure text entry', () => {
    render(<RegisterScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('handles empty form submission', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<RegisterScreen />);

    const signUpButton = screen.getByText('Sign Up');
    fireEvent.press(signUpButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Register:', '');

    consoleLogSpy.mockRestore();
  });

  it('handles form submission with only email', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<RegisterScreen />);

    const emailInput = screen.getByPlaceholderText('Email');
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(signUpButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Register:', 'test@example.com');

    consoleLogSpy.mockRestore();
  });

  it('handles form submission with all fields', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<RegisterScreen />);

    const nameInput = screen.getByPlaceholderText('Full Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signUpButton = screen.getByText('Sign Up');

    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(passwordInput, 'securepass123');
    fireEvent.press(signUpButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Register:', 'john@example.com');

    consoleLogSpy.mockRestore();
  });

  it('clears inputs when email is changed after initial value', () => {
    render(<RegisterScreen />);

    const emailInput = screen.getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'first@example.com');
    expect(emailInput.props.value).toBe('first@example.com');

    fireEvent.changeText(emailInput, 'second@example.com');
    expect(emailInput.props.value).toBe('second@example.com');
  });

  it('maintains separate state for name, email and password', () => {
    render(<RegisterScreen />);

    const nameInput = screen.getByPlaceholderText('Full Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.changeText(nameInput, 'Jane Smith');
    fireEvent.changeText(emailInput, 'jane@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(nameInput.props.value).toBe('Jane Smith');
    expect(emailInput.props.value).toBe('jane@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('handles partial form data entry', () => {
    render(<RegisterScreen />);

    const nameInput = screen.getByPlaceholderText('Full Name');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(passwordInput, 'testpass');

    expect(nameInput.props.value).toBe('Test User');
    expect(passwordInput.props.value).toBe('testpass');
  });

  it('allows name changes after initial entry', () => {
    render(<RegisterScreen />);

    const nameInput = screen.getByPlaceholderText('Full Name');

    fireEvent.changeText(nameInput, 'First Name');
    expect(nameInput.props.value).toBe('First Name');

    fireEvent.changeText(nameInput, 'Updated Name');
    expect(nameInput.props.value).toBe('Updated Name');
  });

  it('allows password changes after initial entry', () => {
    render(<RegisterScreen />);

    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.changeText(passwordInput, 'pass1');
    expect(passwordInput.props.value).toBe('pass1');

    fireEvent.changeText(passwordInput, 'pass2');
    expect(passwordInput.props.value).toBe('pass2');
  });
});
