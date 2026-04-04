"""
AI Demand Prediction using Ridge Regression
Forecasts demand using historical and seasonal trends

Ridge Regression Formula:
β = (X^T X + λI)^(-1) X^T y
Prediction: ŷ = Xβ
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from datetime import datetime, timedelta
import joblib
import os

class DemandPredictor:
    def __init__(self, alpha=1.0):
        """
        Initialize Ridge Regression model
        alpha: Regularization strength
        """
        self.model = Ridge(alpha=alpha, solver='cholesky')
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'day_of_week',
            'week_of_month',
            'month',
            'is_weekend',
            'prev_week_sales',
            'prev_2week_sales',
            'sales_trend',
            'moving_avg_7day'
        ]
    
    def prepare_time_series_features(self, sales_data):
        """
        Prepare time series features for demand prediction
        """
        # Convert to DataFrame
        if isinstance(sales_data, pd.DataFrame):
            df = sales_data.copy()
        else:
            df = pd.DataFrame(sales_data)
        
        # Check if we have data
        if len(df) == 0:
            print("⚠️  No sales data provided")
            return np.array([]), np.array([])
        
        # Debug: Print DataFrame info
        print(f"📊 Sales data shape: {df.shape}")
        print(f"📊 Columns: {df.columns.tolist()}")
        print(f"📊 First row: {df.iloc[0].to_dict() if len(df) > 0 else 'Empty'}")
        
        # Check if quantity column exists
        if 'quantity' not in df.columns:
            print(f"❌ No 'quantity' column found. Available columns: {df.columns.tolist()}")
            return np.array([]), np.array([])
        
        # Handle date field - it might be 'date' or 'createdAt'
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
        elif 'createdAt' in df.columns:
            df['date'] = pd.to_datetime(df['createdAt'])
        else:
            print("⚠️  No date field found, using current date")
            df['date'] = pd.to_datetime(datetime.now())
        
        df = df.sort_values('date')
        
        # Group by date
        daily_sales = df.groupby('date')['quantity'].sum().reset_index()
        daily_sales = daily_sales.sort_values('date')
        
        features = []
        labels = []
        
        # Need at least 7 days of history (reduced from 14)
        if len(daily_sales) < 7:
            print(f"⚠️  Not enough daily sales data. Got {len(daily_sales)} days, need at least 7.")
            return np.array([]), np.array([])
        
        # Start from day 7 instead of day 14
        for i in range(7, len(daily_sales)):
            date = daily_sales.iloc[i]['date']
            
            # Feature 1: Day of week (0=Monday, 6=Sunday)
            day_of_week = date.dayofweek
            
            # Feature 2: Week of month
            week_of_month = (date.day - 1) // 7 + 1
            
            # Feature 3: Month (1-12)
            month = date.month
            
            # Feature 4: Is weekend (0 or 1)
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # Feature 5: Previous week total sales
            prev_week_sales = daily_sales.iloc[max(0, i-7):i]['quantity'].sum()
            
            # Feature 6: Previous 2 weeks total sales (or as much as available)
            lookback = min(i, 14)
            prev_2week_sales = daily_sales.iloc[i-lookback:i]['quantity'].sum()
            
            # Feature 7: Sales trend (slope of last 7 days or available)
            lookback_trend = min(i, 7)
            last_days = daily_sales.iloc[i-lookback_trend:i]['quantity'].values
            if len(last_days) >= 2:
                trend = np.polyfit(range(len(last_days)), last_days, 1)[0]
            else:
                trend = 0
            
            # Feature 8: Moving average (7-day or available)
            moving_avg = daily_sales.iloc[max(0, i-7):i]['quantity'].mean()
            
            feature_vector = [
                day_of_week,
                week_of_month,
                month,
                is_weekend,
                prev_week_sales,
                prev_2week_sales,
                trend,
                moving_avg
            ]
            
            # Label: actual sales on this day
            label = daily_sales.iloc[i]['quantity']
            
            features.append(feature_vector)
            labels.append(label)
        
        print(f"✅ Created {len(features)} training samples from {len(daily_sales)} days of data")
        return np.array(features), np.array(labels)
    
    def train(self, sales_data):
        """
        Train Ridge Regression model on sales data
        """
        print("🔄 Training Ridge Regression model for demand prediction...")
        
        # Prepare features
        X, y = self.prepare_time_series_features(sales_data)
        
        # More flexible threshold - need at least 7 samples (1 week of features)
        if len(X) < 7:
            print(f"⚠️  Not enough training samples. Got {len(X)}, need at least 7.")
            return {
                'success': False,
                'message': f'Not enough data. Need at least 21 days of sales history. Got {len(X)} samples.'
            }
        
        # Split data (80-20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, shuffle=False  # Don't shuffle time series
        )
        
        # Standardize features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Ridge Regression
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_pred = self.model.predict(X_train_scaled)
        test_pred = self.model.predict(X_test_scaled)
        
        train_mse = mean_squared_error(y_train, train_pred)
        test_mse = mean_squared_error(y_test, test_pred)
        train_mae = mean_absolute_error(y_train, train_pred)
        test_mae = mean_absolute_error(y_test, test_pred)
        train_r2 = r2_score(y_train, train_pred)
        test_r2 = r2_score(y_test, test_pred)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(self.model, 'models/demand_ridge_model.pkl')
        joblib.dump(self.scaler, 'models/demand_scaler.pkl')
        
        self.is_trained = True
        
        print(f"✅ Demand model trained successfully!")
        print(f"   Train MSE: {train_mse:.2f}, MAE: {train_mae:.2f}, R²: {train_r2:.4f}")
        print(f"   Test MSE: {test_mse:.2f}, MAE: {test_mae:.2f}, R²: {test_r2:.4f}")
        print(f"   Coefficients: {self.model.coef_}")
        
        return {
            'success': True,
            'samples_trained': len(X),
            'train_mse': float(train_mse),
            'test_mse': float(test_mse),
            'train_mae': float(train_mae),
            'test_mae': float(test_mae),
            'train_r2': float(train_r2),
            'test_r2': float(test_r2),
            'model_type': 'Ridge Regression',
            'alpha': self.model.alpha,
            'coefficients': self.model.coef_.tolist()
        }
    
    def predict_next_30_days(self, sales_data):
        """Predict demand for next 30 days"""
        # Load model if not trained
        if not self.is_trained:
            if os.path.exists('models/demand_ridge_model.pkl'):
                self.model = joblib.load('models/demand_ridge_model.pkl')
                self.scaler = joblib.load('models/demand_scaler.pkl')
                self.is_trained = True
            else:
                raise Exception("Model not trained. Please train first.")
        
        # Get recent sales data
        df = pd.DataFrame(sales_data)
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
        elif 'createdAt' in df.columns:
            df['date'] = pd.to_datetime(df['createdAt'])
        
        daily_sales = df.groupby('date')['quantity'].sum().reset_index()
        daily_sales = daily_sales.sort_values('date').tail(7)  # Last 7 days (reduced from 14)
        
        predictions = []
        today = datetime.now()
        
        for day in range(30):
            future_date = today + timedelta(days=day)
            
            # Extract features for future date
            day_of_week = future_date.weekday()
            week_of_month = (future_date.day - 1) // 7 + 1
            month = future_date.month
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # Use recent sales for features
            prev_week_sales = daily_sales.tail(7)['quantity'].sum()
            prev_2week_sales = daily_sales['quantity'].sum()  # Use all available
            
            # Calculate trend
            recent_values = daily_sales.tail(7)['quantity'].values
            if len(recent_values) >= 2:
                trend = np.polyfit(range(len(recent_values)), recent_values, 1)[0]
            else:
                trend = 0
            
            moving_avg = daily_sales.tail(7)['quantity'].mean()
            
            feature_vector = np.array([[
                day_of_week,
                week_of_month,
                month,
                is_weekend,
                prev_week_sales,
                prev_2week_sales,
                trend,
                moving_avg
            ]])
            
            # Scale and predict
            feature_scaled = self.scaler.transform(feature_vector)
            predicted_demand = self.model.predict(feature_scaled)[0]
            predicted_demand = max(0, int(predicted_demand))
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'predicted_demand': predicted_demand,
                'day_of_week': future_date.strftime('%A')
            })
            
            # Update daily_sales with prediction for next iteration
            new_row = pd.DataFrame({
                'date': [future_date],
                'quantity': [predicted_demand]
            })
            daily_sales = pd.concat([daily_sales, new_row], ignore_index=True)
        
        return predictions
    
    def predict_by_product(self, products, sales_data):
        """Predict demand for each product"""
        predictions = []
        
        for product in products:
            # Filter sales for this product
            product_sales = [s for s in sales_data if str(s.get('productId')) == str(product['_id'])]
            
            if len(product_sales) < 7:  # Reduced from 14
                # Not enough data, use simple average
                if len(product_sales) > 0:
                    avg_demand = sum([s['quantity'] for s in product_sales]) / len(product_sales)
                    predicted_30_day = int(avg_demand * 30)
                else:
                    predicted_30_day = 0
            else:
                # Use Ridge Regression model
                try:
                    daily_predictions = self.predict_next_30_days(product_sales)
                    predicted_30_day = sum([p['predicted_demand'] for p in daily_predictions])
                except:
                    # Fallback
                    avg_demand = sum([s['quantity'] for s in product_sales]) / len(product_sales)
                    predicted_30_day = int(avg_demand * 30)
            
            # Calculate stockout risk
            current_stock = product['quantity']
            if predicted_30_day > 0:
                days_until_stockout = (current_stock / predicted_30_day) * 30
            else:
                days_until_stockout = 999
            
            # Determine risk level
            if days_until_stockout < 7:
                stockout_risk = 'High'
            elif days_until_stockout < 14:
                stockout_risk = 'Medium'
            else:
                stockout_risk = 'Low'
            
            predictions.append({
                'productId': str(product['_id']),
                'productName': product['name'],
                'currentStock': current_stock,
                'predicted30DayDemand': predicted_30_day,
                'daysUntilStockout': round(days_until_stockout, 1),
                'stockoutRisk': stockout_risk
            })
        
        # Sort by stockout risk
        risk_order = {'High': 0, 'Medium': 1, 'Low': 2}
        predictions.sort(key=lambda x: risk_order[x['stockoutRisk']])
        
        return predictions
