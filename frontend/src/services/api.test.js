/**
 * API Service Tests
 */

import api from './api';

describe('API Service', () => {
  test('API service is defined', () => {
    expect(api).toBeDefined();
  });

  test('API service has auth methods', () => {
    expect(api.auth).toBeDefined();
    expect(api.auth.login).toBeDefined();
    expect(api.auth.register).toBeDefined();
  });

  test('API service has products methods', () => {
    expect(api.products).toBeDefined();
    expect(api.products.getAll).toBeDefined();
  });

  test('API service has AI methods', () => {
    expect(api.ai).toBeDefined();
    expect(api.ai.checkHealth).toBeDefined();
  });

  test('API service has chatbot methods', () => {
    expect(api.chatbot).toBeDefined();
    expect(api.chatbot.sendMessage).toBeDefined();
  });
});
