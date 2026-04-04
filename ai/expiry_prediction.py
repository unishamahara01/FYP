"""
AI Expiry Prediction using Ridge Regression
Predicts risk of medicine expiry based on stock and sales data

Ridge Regression Formula:
β = (X^T X + λI)^(-1) X^T y
where λ is the regularization parameter
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from datetime import datetime, timedelta
import joblib
import os

class ExpiryPredictor:
    def __init__(self, alpha=1.0):
        """
        Initialize Ridge Regression model
        alpha: Regularization strength (λ in formula)
        """
        self.model = Ridge(alpha=alpha, solver='cholesky')  # Using Cholesky decomposition
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'days_until_expiry',
            'stock_quantity',
            'avg_daily_sales',
            'stock_to_sales_ratio',
            'days_since_manufacture',
            'product_value',
            'sales_trend',
            'shelf_life_remaining_pct'
        ]
        
    def extract_features(self, products, sales_data):
        """
        Extract features for Ridge Regression
        Returns: X (features), y (labels), product_ids
        """
        features = []
        labels = []
        product_ids = []
        
        for product in products:
            try:
                # Parse dates
                expiry_date = datetime.fromisoformat(str(product['expiryDate']).replace('Z', '+00:00'))
                manufacture_date = datetime.fromisoformat(str(product['manufactureDate']).replace('Z', '+00:00'))
                now = datetime.now()
                
                # Feature 1: Days until expiry
                days_until_expiry = (expiry_date - now).days
                
                # Feature 2: Current stock quantity
                stock_quantity = float(product['quantity'])
                
                # Get sales data for this product
                product_sales = [s for s in sales_data if str(s.get('productId')) == str(product['_id'])]
                
                # Feature 3: Average daily sales
                if len(product_sales) > 0:
                    total_sold = sum([float(s['quantity']) for s in product_sales])
                    days_tracked = 30
                    avg_daily_sales = total_sold / days_tracked
                else:
                    avg_daily_sales = 0.1
                
                # Feature 4: Stock-to-sales ratio
                if avg_daily_sales > 0:
                    stock_to_sales_ratio = stock_quantity / avg_daily_sales
                else:
                    stock_to_sales_ratio = 999.0
                
                # Feature 5: Days since manufacture
                days_since_manufacture = (now - manufacture_date).days
                
                # Feature 6: Product value (price × quantity)
                product_value = float(product.get('price', 0)) * stock_quantity
                
                # Feature 7: Sales trend (last 7 days vs previous 7 days)
                if len(product_sales) >= 14:
                    recent_sales = sum([float(s['quantity']) for s in product_sales[:7]])
                    previous_sales = sum([float(s['quantity']) for s in product_sales[7:14]])
                    sales_trend = (recent_sales - previous_sales) / max(previous_sales, 1)
                else:
                    sales_trend = 0.0
                
                # Feature 8: Shelf life remaining percentage
                shelf_life = (expiry_date - manufacture_date).days
                shelf_life_remaining_pct = (days_until_expiry / shelf_life * 100) if shelf_life > 0 else 0
                
                # Feature vector
                feature_vector = [
                    days_until_expiry,
                    stock_quantity,
                    avg_daily_sales,
                    stock_to_sales_ratio,
                    days_since_manufacture,
                    product_value,
                    sales_trend,
                    shelf_life_remaining_pct
                ]
                
                # Label: Risk score (0-100)
                # High risk if product will expire before being sold
                if avg_daily_sales > 0:
                    days_to_sell = stock_quantity / avg_daily_sales
                else:
                    days_to_sell = 999
                
                # Calculate risk score
                if days_until_expiry < 0:
                    risk_score = 100  # Expired
                elif days_to_sell > days_until_expiry:
                    risk_score = min(100, 70 + (days_to_sell - days_until_expiry) / days_until_expiry * 30)
                else:
                    risk_score = max(0, 70 - (days_until_expiry - days_to_sell) / days_until_expiry * 70)
                
                features.append(feature_vector)
                labels.append(risk_score)
                product_ids.append(str(product['_id']))
                
            except Exception as e:
                print(f"Error processing product {product.get('name')}: {e}")
                continue
        
        return np.array(features), np.array(labels), product_ids
    
    def train(self, products, sales_data):
        """
        Train Ridge Regression model
        Uses formula: β = (X^T X + λI)^(-1) X^T y
        """
        print("🔄 Training Ridge Regression model...")
        
        # Extract features
        X, y, _ = self.extract_features(products, sales_data)
        
        if len(X) < 5:
            return {
                'success': False,
                'message': 'Not enough data. Need at least 5 products.'
            }
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Standardize features (important for Ridge Regression)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Ridge Regression model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_pred = self.model.predict(X_train_scaled)
        test_pred = self.model.predict(X_test_scaled)
        
        train_mse = mean_squared_error(y_train, train_pred)
        test_mse = mean_squared_error(y_test, test_pred)
        train_r2 = r2_score(y_train, train_pred)
        test_r2 = r2_score(y_test, test_pred)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(self.model, 'models/expiry_ridge_model.pkl')
        joblib.dump(self.scaler, 'models/expiry_scaler.pkl')
        
        self.is_trained = True
        
        print(f" Model trained successfully!")
        print(f"   Train MSE: {train_mse:.2f}, R²: {train_r2:.4f}")
        print(f"   Test MSE: {test_mse:.2f}, R²: {test_r2:.4f}")
        print(f"   Coefficients: {self.model.coef_}")
        print(f"   Intercept: {self.model.intercept_:.2f}")
        
        return {
            'success': True,
            'samples_trained': len(X),
            'train_mse': float(train_mse),
            'test_mse': float(test_mse),
            'train_r2': float(train_r2),
            'test_r2': float(test_r2),
            'model_type': 'Ridge Regression',
            'alpha': self.model.alpha,
            'coefficients': self.model.coef_.tolist(),
            'intercept': float(self.model.intercept_)
        }
    
    def predict(self, products, sales_data):
        """Predict expiry risk for products"""
        # Load model if not trained
        if not self.is_trained:
            if os.path.exists('models/expiry_ridge_model.pkl'):
                self.model = joblib.load('models/expiry_ridge_model.pkl')
                self.scaler = joblib.load('models/expiry_scaler.pkl')
                self.is_trained = True
            else:
                raise Exception("Model not trained. Please train first.")
        
        # Extract features
        X, _, product_ids = self.extract_features(products, sales_data)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict using Ridge Regression
        risk_scores = self.model.predict(X_scaled)
        
        # Clip scores to 0-100 range
        risk_scores = np.clip(risk_scores, 0, 100)
        
        predictions = []
        for i, product in enumerate(products):
            if i >= len(risk_scores):
                break
                
            risk_score = int(risk_scores[i])
            
            # Determine risk level
            if risk_score >= 70:
                risk_level = 'Critical'
            elif risk_score >= 50:
                risk_level = 'High'
            elif risk_score >= 30:
                risk_level = 'Medium'
            else:
                risk_level = 'Low'
            
            # Generate recommendation
            expiry_date = datetime.fromisoformat(str(product['expiryDate']).replace('Z', '+00:00'))
            days_until_expiry = (expiry_date - datetime.now()).days
            
            if days_until_expiry < 0:
                recommendation = 'EXPIRED - Remove immediately'
            elif risk_score >= 70:
                recommendation = 'Apply 20% discount urgently'
            elif risk_score >= 50:
                recommendation = 'Promote with 20% discount'
            elif risk_score >= 30:
                recommendation = 'Monitor closely'
            else:
                recommendation = 'Stock level optimal'
            
            predictions.append({
                'productId': str(product['_id']),
                'productName': product['name'],
                'batchNumber': product.get('batchNumber', 'N/A'),
                'daysUntilExpiry': days_until_expiry,
                'currentStock': product['quantity'],
                'riskScore': risk_score,
                'riskLevel': risk_level,
                'recommendation': recommendation,
                'isPromoted': product.get('isPromoted', False),
                'discountPercentage': product.get('discountPercentage', 0)
            })
        
        # Sort by risk score
        predictions.sort(key=lambda x: x['riskScore'], reverse=True)
        
        return predictions
