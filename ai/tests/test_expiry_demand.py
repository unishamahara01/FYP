"""
MediTrust AI Testing - Expiry & Demand Prediction
Tests for expiry prediction and demand forecasting models
"""

import pytest
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from expiry_prediction import ExpiryPredictor
from demand_prediction import DemandPredictor


class TestExpiryPrediction:
    """Test MediTrust expiry prediction functionality"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.predictor = ExpiryPredictor()
        
        # Sample product data matching MediTrust schema
        self.sample_products = [
            {
                '_id': '507f1f77bcf86cd799439011',
                'name': 'Paracetamol 500mg',
                'quantity': 100,
                'expiryDate': (datetime.now() + timedelta(days=30)).isoformat(),
                'manufactureDate': (datetime.now() - timedelta(days=335)).isoformat(),
                'reorderLevel': 50,
                'price': 5.0,
                'batchNumber': 'BATCH001'
            },
            {
                '_id': '507f1f77bcf86cd799439012',
                'name': 'Ibuprofen 400mg',
                'quantity': 50,
                'expiryDate': (datetime.now() + timedelta(days=60)).isoformat(),
                'manufactureDate': (datetime.now() - timedelta(days=305)).isoformat(),
                'reorderLevel': 30,
                'price': 8.0,
                'batchNumber': 'BATCH002'
            },
            {
                '_id': '507f1f77bcf86cd799439013',
                'name': 'Amoxicillin 250mg',
                'quantity': 20,
                'expiryDate': (datetime.now() + timedelta(days=15)).isoformat(),
                'manufactureDate': (datetime.now() - timedelta(days=350)).isoformat(),
                'reorderLevel': 40,
                'price': 12.0,
                'batchNumber': 'BATCH003'
            }
        ]
        
        # Sample sales data
        self.sample_sales = [
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 10, 'date': datetime.now()},
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 15, 'date': datetime.now() - timedelta(days=1)},
            {'productId': '507f1f77bcf86cd799439012', 'quantity': 5, 'date': datetime.now()},
            {'productId': '507f1f77bcf86cd799439013', 'quantity': 2, 'date': datetime.now()},
        ]
    
    def test_predictor_initialization(self):
        """Test that expiry predictor initializes correctly"""
        assert self.predictor is not None
        print("✅ Expiry predictor initialized successfully")
    
    def test_predict_returns_list(self):
        """Test that predict returns a list"""
        predictions = self.predictor.predict(self.sample_products, self.sample_sales)
        assert isinstance(predictions, list)
        print(f"✅ Predict returned list with {len(predictions)} predictions")
    
    def test_prediction_structure(self):
        """Test that predictions have correct MediTrust structure"""
        predictions = self.predictor.predict(self.sample_products, self.sample_sales)
        
        if len(predictions) > 0:
            prediction = predictions[0]
            required_fields = ['productId', 'productName', 'daysUntilExpiry', 'riskScore', 'riskLevel']
            
            for field in required_fields:
                assert field in prediction, f"Missing required field: {field}"
            
            print("✅ Prediction structure matches MediTrust schema")
    
    def test_risk_score_range(self):
        """Test that risk scores are in valid range (0-100)"""
        predictions = self.predictor.predict(self.sample_products, self.sample_sales)
        
        for pred in predictions:
            assert 0 <= pred['riskScore'] <= 100, f"Risk score out of range: {pred['riskScore']}"
        
        print("✅ All risk scores are in valid range (0-100)")
    
    def test_risk_levels(self):
        """Test that risk levels are valid MediTrust categories"""
        predictions = self.predictor.predict(self.sample_products, self.sample_sales)
        valid_levels = ['Low', 'Medium', 'High', 'Critical']
        
        for pred in predictions:
            assert pred['riskLevel'] in valid_levels, f"Invalid risk level: {pred['riskLevel']}"
        
        print("✅ All risk levels are valid MediTrust categories")
    
    def test_expiring_soon_detection(self):
        """Test that products expiring soon are flagged as high risk"""
        predictions = self.predictor.predict(self.sample_products, self.sample_sales)
        
        # Find Amoxicillin (expires in 15 days)
        amoxicillin_pred = next((p for p in predictions if 'Amoxicillin' in p['productName']), None)
        
        if amoxicillin_pred:
            assert amoxicillin_pred['daysUntilExpiry'] <= 30, "Should detect expiring soon"
            assert amoxicillin_pred['riskScore'] >= 50, "Should have high risk score"
            print("✅ Expiring soon products correctly flagged as high risk")
    
    def test_empty_products_list(self):
        """Test handling of empty products list"""
        predictions = self.predictor.predict([], self.sample_sales)
        assert isinstance(predictions, list)
        assert len(predictions) == 0
        print("✅ Empty products list handled gracefully")


class TestDemandPrediction:
    """Test MediTrust demand prediction functionality"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.predictor = DemandPredictor()
        
        # Sample sales data for MediTrust
        self.sample_sales = [
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 10, 'date': datetime.now()},
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 15, 'date': datetime.now() - timedelta(days=1)},
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 12, 'date': datetime.now() - timedelta(days=2)},
            {'productId': '507f1f77bcf86cd799439012', 'quantity': 5, 'date': datetime.now()},
            {'productId': '507f1f77bcf86cd799439012', 'quantity': 8, 'date': datetime.now() - timedelta(days=1)},
        ]
        
        self.sample_products = [
            {
                '_id': '507f1f77bcf86cd799439011',
                'name': 'Paracetamol 500mg',
                'quantity': 100
            },
            {
                '_id': '507f1f77bcf86cd799439012',
                'name': 'Ibuprofen 400mg',
                'quantity': 50
            }
        ]
    
    def test_predictor_initialization(self):
        """Test that demand predictor initializes correctly"""
        assert self.predictor is not None
        print("✅ Demand predictor initialized successfully")
    
    def test_predict_by_product_returns_list(self):
        """Test that predict_by_product returns a list"""
        predictions = self.predictor.predict_by_product(self.sample_products, self.sample_sales)
        assert isinstance(predictions, list)
        print(f"✅ Predict returned list with {len(predictions)} product predictions")
    
    def test_prediction_has_required_fields(self):
        """Test that predictions have required MediTrust fields"""
        predictions = self.predictor.predict_by_product(self.sample_products, self.sample_sales)
        
        if len(predictions) > 0:
            prediction = predictions[0]
            required_fields = ['productId', 'productName', 'predicted30DayDemand']
            
            for field in required_fields:
                assert field in prediction, f"Missing required field: {field}"
            
            print("✅ Predictions have all required MediTrust fields")
    
    def test_predicted_demand_positive(self):
        """Test that predicted demand is non-negative"""
        predictions = self.predictor.predict_by_product(self.sample_products, self.sample_sales)
        
        for pred in predictions:
            assert pred['predicted30DayDemand'] >= 0, f"Predicted demand should be non-negative: {pred['predicted30DayDemand']}"
        
        print("✅ All predicted demands are non-negative")
    
    def test_high_sales_velocity(self):
        """Test that high sales velocity results in higher demand prediction"""
        predictions = self.predictor.predict_by_product(self.sample_products, self.sample_sales)
        
        # Paracetamol has higher sales (10+15+12=37) vs Ibuprofen (5+8=13)
        paracetamol_pred = next((p for p in predictions if 'Paracetamol' in p['productName']), None)
        ibuprofen_pred = next((p for p in predictions if 'Ibuprofen' in p['productName']), None)
        
        if paracetamol_pred and ibuprofen_pred:
            assert paracetamol_pred['predicted30DayDemand'] > ibuprofen_pred['predicted30DayDemand'], \
                "Higher sales should result in higher predicted demand"
            print("✅ High sales velocity correctly predicts higher demand")
    
    def test_empty_sales_data(self):
        """Test handling of empty sales data"""
        predictions = self.predictor.predict_by_product(self.sample_products, [])
        assert isinstance(predictions, list)
        print("✅ Empty sales data handled gracefully")


class TestModelIntegration:
    """Test integration between expiry and demand models"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.expiry_predictor = ExpiryPredictor()
        self.demand_predictor = DemandPredictor()
        
        self.products = [
            {
                '_id': '507f1f77bcf86cd799439011',
                'name': 'Vitamin C 1000mg',
                'quantity': 200,
                'expiryDate': (datetime.now() + timedelta(days=45)).isoformat(),
                'manufactureDate': (datetime.now() - timedelta(days=320)).isoformat(),
                'reorderLevel': 100,
                'price': 10.0,
                'batchNumber': 'VIT001'
            }
        ]
        
        self.sales = [
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 20, 'date': datetime.now()},
            {'productId': '507f1f77bcf86cd799439011', 'quantity': 25, 'date': datetime.now() - timedelta(days=1)},
        ]
    
    def test_both_models_work_together(self):
        """Test that both models can process same data"""
        expiry_predictions = self.expiry_predictor.predict(self.products, self.sales)
        demand_predictions = self.demand_predictor.predict_by_product(self.products, self.sales)
        
        assert len(expiry_predictions) > 0, "Expiry predictions should not be empty"
        assert len(demand_predictions) > 0, "Demand predictions should not be empty"
        
        print("✅ Both models work together successfully")
    
    def test_product_ids_match(self):
        """Test that product IDs match across predictions"""
        expiry_predictions = self.expiry_predictor.predict(self.products, self.sales)
        demand_predictions = self.demand_predictor.predict_by_product(self.products, self.sales)
        
        expiry_ids = {p['productId'] for p in expiry_predictions}
        demand_ids = {p['productId'] for p in demand_predictions}
        
        assert expiry_ids == demand_ids, "Product IDs should match across predictions"
        print("✅ Product IDs match across both models")


if __name__ == '__main__':
    print("\n" + "="*70)
    print("🧪 MEDITRUST AI TESTING - EXPIRY & DEMAND PREDICTION")
    print("="*70 + "\n")
    
    # Run tests with pytest
    pytest.main([__file__, '-v', '--tb=short'])
