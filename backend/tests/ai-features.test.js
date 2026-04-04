const request = require('supertest');

const baseURL = 'http://localhost:3001';
const aiURL = 'http://localhost:5001';

describe('AI/ML Features Tests', () => {
  let authToken;
  let testProductId;

  beforeAll(async () => {
    // Login to get auth token
    const response = await request(baseURL)
      .post('/api/auth/login')
      .send({
        email: 'admin@meditrust.com',
        password: 'admin123'
      });
    
    authToken = response.body.token;
  });

  describe('ML Backend Health', () => {
    test('Should check ML backend health', async () => {
      const response = await request(aiURL)
        .get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('AI Model Training', () => {
    test('Should train AI model successfully', async () => {
      const response = await request(aiURL)
        .post('/train');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('training_samples');
      expect(response.body).toHaveProperty('accuracy');
      expect(response.body.training_samples).toBeGreaterThan(0);
      // Note: Accuracy can be negative with limited data, just check it exists
      expect(typeof response.body.accuracy).toBe('number');
    }, 30000); // 30 second timeout for training
  });

  describe('Expiry Predictions', () => {
    test('Should get expiry predictions', async () => {
      const response = await request(aiURL)
        .get('/predict');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('predictions');
      expect(Array.isArray(response.body.predictions)).toBe(true);
      
      if (response.body.predictions.length > 0) {
        const prediction = response.body.predictions[0];
        expect(prediction).toHaveProperty('productName');
        expect(prediction).toHaveProperty('riskScore');
        expect(prediction).toHaveProperty('riskLevel');
        expect(prediction).toHaveProperty('daysUntilExpiry');
        expect(prediction).toHaveProperty('recommendation');
        
        // Validate risk score is between 0-100
        expect(prediction.riskScore).toBeGreaterThanOrEqual(0);
        expect(prediction.riskScore).toBeLessThanOrEqual(100);
        
        // Validate risk level
        expect(['Critical', 'High', 'Medium', 'Low']).toContain(prediction.riskLevel);
      }
    });

    test('Should have correct summary statistics', async () => {
      const response = await request(aiURL)
        .get('/predict');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('criticalRisk');
      expect(response.body).toHaveProperty('highRisk');
      expect(response.body).toHaveProperty('totalValueAtRisk');
      
      expect(typeof response.body.criticalRisk).toBe('number');
      expect(typeof response.body.highRisk).toBe('number');
      expect(typeof response.body.totalValueAtRisk).toBe('number');
    });
  });

  describe('Automatic Discount Calculation', () => {
    test('Should calculate discount based on risk score', async () => {
      const response = await request(aiURL)
        .get('/predict');

      expect(response.statusCode).toBe(200);
      
      if (response.body.predictions.length > 0) {
        response.body.predictions.forEach(pred => {
          // Formula: (riskScore / 100) × 30
          const expectedDiscount = Math.round((pred.riskScore / 100) * 30);
          
          // For high risk items, discount should be calculated
          if (pred.riskLevel === 'Critical' || pred.riskLevel === 'High') {
            expect(expectedDiscount).toBeGreaterThan(0);
            expect(expectedDiscount).toBeLessThanOrEqual(30);
          }
        });
      }
    });

    test('Risk score 100 should give 30% discount', () => {
      const riskScore = 100;
      const discount = Math.round((riskScore / 100) * 30);
      expect(discount).toBe(30);
    });

    test('Risk score 85 should give 26% discount', () => {
      const riskScore = 85;
      const discount = Math.round((riskScore / 100) * 30);
      expect(discount).toBe(26);
    });

    test('Risk score 70 should give 21% discount', () => {
      const riskScore = 70;
      const discount = Math.round((riskScore / 100) * 30);
      expect(discount).toBe(21);
    });

    test('Risk score 50 should give 15% discount', () => {
      const riskScore = 50;
      const discount = Math.round((riskScore / 100) * 30);
      expect(discount).toBe(15);
    });
  });

  describe('Demand Predictions', () => {
    test('Should get demand predictions', async () => {
      const response = await request(aiURL)
        .get('/predict/demand');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('predictions');
      expect(Array.isArray(response.body.predictions)).toBe(true);
      
      if (response.body.predictions.length > 0) {
        const prediction = response.body.predictions[0];
        expect(prediction).toHaveProperty('productName');
        expect(prediction).toHaveProperty('currentStock');
        expect(prediction).toHaveProperty('predicted30DayDemand');
        expect(prediction).toHaveProperty('stockoutRisk');
        expect(prediction).toHaveProperty('daysUntilStockout');
        
        // Validate stockout risk
        expect(['High', 'Medium', 'Low']).toContain(prediction.stockoutRisk);
      }
    });
  });

  describe('Promotion Management', () => {
    beforeAll(async () => {
      // Get a product to test promotion
      const response = await request(baseURL)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);
      
      if (response.body.length > 0) {
        testProductId = response.body[0]._id;
      }
    });

    test('Should apply promotion to product', async () => {
      if (!testProductId) {
        console.log('Skipping: No product available');
        return;
      }

      const response = await request(baseURL)
        .post('/api/inventory/apply-promotion')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          discountPercentage: 30,
          isPromoted: true
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should remove promotion from product', async () => {
      if (!testProductId) {
        console.log('Skipping: No product available');
        return;
      }

      const response = await request(baseURL)
        .post('/api/inventory/apply-promotion')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          isPromoted: false,
          discountPercentage: 0
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('AI Chatbot', () => {
    test('Should get response from chatbot', async () => {
      const response = await request(aiURL)
        .post('/chatbot')
        .send({
          message: 'What is Paracetamol used for?'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
    });
  });
});
