/**
 * AI Predictions Component Tests
 */

import { render } from '@testing-library/react';
import AIPredictions from './AIPredictions';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('AIPredictions Component', () => {
  test('renders AI predictions component without crashing', () => {
    const { container } = render(<AIPredictions />);
    expect(container).toBeInTheDocument();
  });

  test('AI predictions component is defined', () => {
    expect(AIPredictions).toBeDefined();
  });
});
