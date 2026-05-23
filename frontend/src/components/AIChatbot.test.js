/**
 * AI Chatbot Component Tests
 */

import { render } from '@testing-library/react';
import AIChatbot from './AIChatbot';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'fake-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('AIChatbot Component', () => {
  test('renders chatbot component without crashing', () => {
    const { container } = render(<AIChatbot />);
    expect(container).toBeInTheDocument();
  });

  test('chatbot component is defined', () => {
    expect(AIChatbot).toBeDefined();
  });
});
