from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['meditrust']
products_collection = db['products']
orders_collection = db['orders']

# Global variables for model and scaler
model = None
scaler = None
model_trained = False

def extract_features_from_product(product):
    """Extract ML features from a product"""
    try:
        # Handle different date formats
        expiry_date_str = product.get('expiryDate')
        manufacture_date_str = product.get('manufactureDate')
        
        if isinstance(expiry_date_str, str):
            if 'T' in expiry_date_str:
                expiry_date = datetime.fromisoformat(expiry_date_str.replace('Z', '+00:00'))
            else:
                expiry_date = datetime.strptime(expiry_date_str[:10], '%Y-%m-%d')
        else:
            expiry_date = expiry_date_str
        
        if isinstance(manufacture_date_str, str):
            if 'T' in manufacture_date_str:
                manufacture_date = datetime.fromisoformat(manufacture_date_str.replace('Z', '+00:00'))
            else:
                manufacture_date = datetime.strptime(manufacture_date_str[:10], '%Y-%m-%d')
        else:
            manufacture_date = manufacture_date_str
    except Exception as e:
        print(f"Date parsing error for {product.get('name')}: {e}")
        return None
    
    now = datetime.now()
    
    # Feature 1: Days until expiry
    days_until_expiry = (expiry_date - now).days
    
    # Feature 2: Product age (days since manufacture)
    product_age = (now - manufacture_date).days
    
    # Feature 3: Shelf life (total days from manufacture to expiry)
    shelf_life = (expiry_date - manufacture_date).days
    
    # Feature 4: Percentage of shelf life remaining
    shelf_life_remaining_pct = (days_until_expiry / shelf_life * 100) if shelf_life > 0 else 0
    
    # Feature 5: Current stock quantity
    stock_quantity = product.get('quantity', 0)
    
    # Feature 6: Product value (price * quantity)
    product_value = product.get('price', 0) * stock_quantity
    
    # Feature 7: Stock velocity (estimated daily sales)
    # Get sales history for this product
    sales_velocity = calculate_sales_velocity(product.get('_id'))
    
    # Feature 8: Days to sell current stock (stock / velocity)
    days_to_sell = stock_quantity / sales_velocity if sales_velocity > 0 else 999
    
    # Feature 9: Will expire before selling? (binary)
    will_expire_before_sold = 1 if days_to_sell > days_until_expiry else 0
    
    # Feature 10: Stock level category (0=low, 1=medium, 2=high)
    if stock_quantity < 50:
        stock_level = 0
    elif stock_quantity < 200:
        stock_level = 1
    else:
        stock_level = 2
    
    return {
        'days_until_expiry': days_until_expiry,
        'product_age': product_age,
        'shelf_life': shelf_life,
        'shelf_life_remaining_pct': shelf_life_remaining_pct,
        'stock_quantity': stock_quantity,
        'product_value': product_value,
        'sales_velocity': sales_velocity,
        'days_to_sell': days_to_sell,
        'will_expire_before_sold': will_expire_before_sold,
        'stock_level': stock_level
    }

def calculate_sales_velocity(product_id):
    """Calculate average daily sales for a product"""
    try:
        # Get orders from last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        orders = list(orders_collection.find({
            'createdAt': {'$gte': thirty_days_ago},
            'items.product': str(product_id)
        }))
        
        total_sold = 0
        for order in orders:
            for item in order.get('items', []):
                if str(item.get('product')) == str(product_id):
                    total_sold += item.get('quantity', 0)
        
        # Calculate daily average
        velocity = total_sold / 30 if total_sold > 0 else 0.5  # Default 0.5 if no sales
        return velocity
    except:
        return 0.5  # Default velocity

def create_training_labels(features_df):
    """Create labels for training based on expiry risk rules"""
    labels = []
    
    for _, row in features_df.iterrows():
        # High risk (1) if:
        # - Expires in < 30 days AND high stock
        # - Will expire before being sold
        # - High value at risk
        
        risk_score = 0
        
        if row['days_until_expiry'] < 30:
            risk_score += 3
        elif row['days_until_expiry'] < 60:
            risk_score += 2
        elif row['days_until_expiry'] < 90:
            risk_score += 1
        
        if row['stock_quantity'] > 200:
            risk_score += 2
        elif row['stock_quantity'] > 100:
            risk_score += 1
        
        if row['will_expire_before_sold'] == 1:
            risk_score += 3
        
        if row['product_value'] > 20000:
            risk_score += 2
        elif row['product_value'] > 10000:
            risk_score += 1
        
        # Label: 1 = High Risk, 0 = Low Risk
        label = 1 if risk_score >= 5 else 0
        labels.append(label)
    
    return labels

@app.route('/train', methods=['POST'])
def train_model():
    """Train the ML model on current product data"""
    global model, scaler, model_trained
    
    try:
        # Fetch all products with expiry dates
        products = list(products_collection.find({'expiryDate': {'$exists': True}}))
        
        if len(products) < 5:
            return jsonify({
                'success': False,
                'message': 'Not enough data to train model. Need at least 5 products.'
            }), 400
        
        # Extract features
        features_list = []
        product_ids = []
        
        for product in products:
            features = extract_features_from_product(product)
            features_list.append(features)
            product_ids.append(str(product['_id']))
        
        # Create DataFrame
        features_df = pd.DataFrame(features_list)
        
        # Create labels
        labels = create_training_labels(features_df)
        
        # Prepare features for training
        X = features_df.values
        y = np.array(labels)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train Random Forest model
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        model.fit(X_scaled, y)
        
        # Save model and scaler
        os.makedirs('models', exist_ok=True)
        joblib.dump(model, 'models/expiry_model.pkl')
        joblib.dump(scaler, 'models/scaler.pkl')
        
        model_trained = True
        
        # Calculate accuracy
        train_accuracy = model.score(X_scaled, y)
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'training_samples': len(products),
            'accuracy': float(train_accuracy),
            'high_risk_count': int(sum(labels)),
            'low_risk_count': int(len(labels) - sum(labels))
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Training failed: {str(e)}'
        }), 500

@app.route('/predict', methods=['GET'])
def predict_expiry_risk():
    """Predict expiry risk for all products using ML model"""
    global model, scaler, model_trained
    
    try:
        # Load model if not in memory
        if not model_trained:
            if os.path.exists('models/expiry_model.pkl'):
                model = joblib.load('models/expiry_model.pkl')
                scaler = joblib.load('models/scaler.pkl')
                model_trained = True
            else:
                return jsonify({
                    'success': False,
                    'message': 'Model not trained. Please train the model first.'
                }), 400
        
        # Fetch all products
        products = list(products_collection.find({'expiryDate': {'$exists': True}}))
        
        predictions = []
        
        for product in products:
            # Extract features
            features = extract_features_from_product(product)
            
            # Prepare for prediction
            X = np.array(list(features.values())).reshape(1, -1)
            X_scaled = scaler.transform(X)
            
            # Predict
            risk_prediction = model.predict(X_scaled)[0]
            risk_probability = model.predict_proba(X_scaled)[0]
            
            # Get risk score (0-100)
            risk_score = int(risk_probability[1] * 100)
            
            # Determine risk level
            if risk_score >= 70:
                risk_level = 'Critical'
                urgency = 'critical'
            elif risk_score >= 50:
                risk_level = 'High'
                urgency = 'high'
            elif risk_score >= 30:
                risk_level = 'Medium'
                urgency = 'medium'
            else:
                risk_level = 'Low'
                urgency = 'low'
            
            # Generate recommendation
            days_until_expiry = features['days_until_expiry']
            stock_quantity = features['stock_quantity']
            
            if days_until_expiry < 0:
                recommendation = 'EXPIRED - Remove from inventory immediately'
            elif risk_score >= 70 and stock_quantity > 10:
                recommendation = 'Urgent: Offer 30-50% discount to clear stock'
            elif risk_score >= 50:
                recommendation = 'Promote with 20% discount or bundle offers'
            elif risk_score >= 30:
                recommendation = 'Monitor closely, consider promotional pricing'
            else:
                recommendation = 'Stock level optimal, continue monitoring'
            
            predictions.append({
                'productId': str(product['_id']),
                'productName': product.get('name', 'Unknown'),
                'batchNumber': product.get('batchNumber', 'N/A'),
                'expiryDate': product.get('expiryDate'),
                'daysUntilExpiry': days_until_expiry,
                'currentStock': stock_quantity,
                'stockValue': features['product_value'],
                'salesVelocity': round(features['sales_velocity'], 2),
                'daysToSell': round(features['days_to_sell'], 1),
                'riskScore': risk_score,
                'riskLevel': risk_level,
                'urgency': urgency,
                'recommendation': recommendation,
                'mlConfidence': float(max(risk_probability)),
                'features': features
            })
        
        # Sort by risk score
        predictions.sort(key=lambda x: x['riskScore'], reverse=True)
        
        # Filter products expiring within 90 days
        critical_predictions = [p for p in predictions if p['daysUntilExpiry'] <= 90]
        
        # Summary statistics
        summary = {
            'totalAnalyzed': len(products),
            'criticalRisk': len([p for p in critical_predictions if p['riskLevel'] == 'Critical']),
            'highRisk': len([p for p in critical_predictions if p['riskLevel'] == 'High']),
            'mediumRisk': len([p for p in critical_predictions if p['riskLevel'] == 'Medium']),
            'totalValueAtRisk': sum([p['stockValue'] for p in critical_predictions if p['riskLevel'] in ['Critical', 'High']]),
            'predictions': critical_predictions[:20],  # Top 20
            'modelType': 'Random Forest Classifier',
            'mlEnabled': True
        }
        
        return jsonify(summary)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_trained': model_trained,
        'ml_backend': 'Python Flask',
        'ml_library': 'scikit-learn'
    })

if __name__ == '__main__':
    print("🤖 ML Backend Server Starting...")
    print("📊 Machine Learning: Random Forest Classifier")
    print("🔗 MongoDB: mongodb://localhost:27017/meditrust")
    print("🚀 Server running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
