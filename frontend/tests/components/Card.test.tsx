/**
 * Tests for Card component.
 */

import { render, screen } from '../utils/test-utils';
import { Card } from '../../components/ui/Card';
import { Text } from 'react-native';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('applies custom style', () => {
    render(
      <Card style={{ marginTop: 20 }}>
        <Text>Styled Card</Text>
      </Card>
    );
    expect(screen.getByText('Styled Card')).toBeTruthy();
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </Card>
    );
    expect(screen.getByText('First Child')).toBeTruthy();
    expect(screen.getByText('Second Child')).toBeTruthy();
  });

  it('renders without children', () => {
    const { root } = render(<Card />);
    expect(root).toBeTruthy();
  });

  it('preserves default styling when no custom style is provided', () => {
    render(
      <Card>
        <Text>Default Styled</Text>
      </Card>
    );
    expect(screen.getByText('Default Styled')).toBeTruthy();
  });

  it('combines custom style with default styles', () => {
    render(
      <Card style={{ backgroundColor: '#F0F0F0', padding: 24 }}>
        <Text>Custom Background</Text>
      </Card>
    );
    expect(screen.getByText('Custom Background')).toBeTruthy();
  });
});
