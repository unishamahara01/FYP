const request = require('supertest');
const mongoose = require('mongoose');

const baseURL = 'http://localhost:3001';

describe('Authentication Tests', () => {
  let authToken;

  afterAll(async () => {
    // Close any open connections
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('POST /api/auth/login', () => {
    test('Should login with valid admin credentials', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'admin@meditrust.com',
          password: 'admin123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('Admin');
      
      authToken = response.body.token;
    });

    test('Should login with valid pharmacist credentials', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'pharmacist@meditrust.com',
          password: 'pharma123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('Pharmacist');
    });

    test('Should fail with invalid credentials', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'admin@meditrust.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
    });

    test('Should fail with missing email', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send({
          password: 'admin123'
        });

      expect(response.statusCode).toBe(400);
    });

    test('Should fail with missing password', async () => {
      const response = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'admin@meditrust.com'
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Protected Routes', () => {
    test('Should deny access without token', async () => {
      const response = await request(baseURL)
        .get('/api/products');

      expect(response.statusCode).toBe(401);
    });

    test('Should allow access with valid token', async () => {
      // First login to get token
      const loginResponse = await request(baseURL)
        .post('/api/auth/login')
        .send({
          email: 'admin@meditrust.com',
          password: 'admin123'
        });

      const token = loginResponse.body.token;

      const response = await request(baseURL)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
    });
  });
});
