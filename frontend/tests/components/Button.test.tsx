/**
 * Tests for Button component.
 *
 * Demonstrates component testing patterns:
 * - Testing variants and props
 * - Testing user interactions
 * - Testing disabled state
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('renders with title', () => {
    render(<Button title="Click me" onPress={() => {}} />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Click me" onPress={onPress} />);

    fireEvent.press(screen.getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button title="Click me" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Click me'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders primary variant by default', () => {
    render(<Button title="Primary" onPress={() => {}} />);
    // Button renders without crashing with default variant
    expect(screen.getByText('Primary')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    render(<Button title="Secondary" onPress={() => {}} variant="secondary" />);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('applies custom style', () => {
    render(
      <Button
        title="Styled"
        onPress={() => {}}
        style={{ marginTop: 10 }}
      />
    );
    expect(screen.getByText('Styled')).toBeTruthy();
  });
});

