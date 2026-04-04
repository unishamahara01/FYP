"""
AI Backend Server - Flask API
Provides AI-powered features for pharmacy management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Import AI modules
from expiry_prediction import ExpiryPredictor
from demand_prediction import DemandPredictor
from reorder_suggestions import ReorderSuggester
from chatbot import MedicineChatbot

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/meditrust')
client = MongoClient(MONGODB_URI)
db = client['meditrust']

# Initialize AI models
expiry_predictor = ExpiryPredictor()
demand_predictor = DemandPredictor()
reorder_suggester = ReorderSuggester()
chatbot = MedicineChatbot()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Backend',
        'models': {
            'expiry_prediction': 'Ridge Regression',
            'demand_prediction': 'Ridge Regression',
            'reorder_suggestions': 'EOQ Formula',
            'chatbot': 'Google Gemini API'
        }
    })

# Main endpoints for frontend (simplified URLs)
@app.route('/train', methods=['POST'])
def train_model():
    """Train all AI models"""
    try:
        # Fetch products and sales data
        products = list(db.products.find({'expiryDate': {'$exists': True}}))
        
        # Fetch sales data from last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        orders = list(db.orders.find({'createdAt': {'$gte': thirty_days_ago}}))
        
        # Extract sales data
        sales_data = []
        for order in orders:
            for item in order.get('items', []):
                sales_data.append({
                    'productId': str(item.get('product')),
                    'quantity': item.get('quantity', 0),
                    'date': order.get('createdAt')
                })
        
        # Train expiry model
        expiry_result = expiry_predictor.train(products, sales_data)
        
        # Train demand model
        demand_result = demand_predictor.train(sales_data)
        
        return jsonify({
            'success': True,
            'expiry_model': expiry_result,
            'demand_model': demand_result,
            'training_samples': expiry_result.get('samples_trained', 0),
            'accuracy': expiry_result.get('test_r2', 0)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict', methods=['GET'])
def predict_all():
    """Get all AI predictions (expiry, demand, reorder)"""
    try:
        # Fetch products
        products = list(db.products.find({'expiryDate': {'$exists': True}}))
        print(f"📦 Found {len(products)} products with expiry dates")
        
        # Log product details
        for product in products:
            expiry_date = datetime.fromisoformat(str(product['expiryDate']).replace('Z', '+00:00'))
            days_until_expiry = (expiry_date - datetime.now()).days
            print(f"   - {product['name']}: {days_until_expiry} days until expiry (Expiry: {product['expiryDate']})")
        
        # Fetch sales data
        thirty_days_ago = datetime.now() - timedelta(days=30)
        orders = list(db.orders.find({'createdAt': {'$gte': thirty_days_ago}}))
        
        sales_data = []
        for order in orders:
            for item in order.get('items', []):
                sales_data.append({
                    'productId': str(item.get('product')),
                    'quantity': item.get('quantity', 0),
                    'date': order.get('createdAt')
                })
        
        # Get expiry predictions
        predictions = expiry_predictor.predict(products, sales_data)
        print(f"🤖 Generated {len(predictions)} predictions")
        
        # Log expired products
        expired = [p for p in predictions if p['daysUntilExpiry'] < 0]
        print(f"⚠️ Found {len(expired)} expired products")
        for exp in expired:
            print(f"   - {exp['productName']}: {exp['daysUntilExpiry']} days (Risk: {exp['riskScore']})")
        
        # Calculate risk counts
        critical_risk = len([p for p in predictions if p['riskLevel'] == 'Critical'])
        high_risk = len([p for p in predictions if p['riskLevel'] == 'High'])
        medium_risk = len([p for p in predictions if p['riskLevel'] == 'Medium'])
        
        print(f"📊 Risk levels - Critical: {critical_risk}, High: {high_risk}, Medium: {medium_risk}")
        
        # Calculate total value at risk
        total_value_at_risk = sum([
            p.get('currentStock', 0) * products[i].get('price', 0)
            for i, p in enumerate(predictions) if p['riskScore'] >= 50
        ])
        
        print(f"💰 Total value at risk: Rs {total_value_at_risk}")
        print(f"📤 Returning top {min(20, len(predictions))} predictions")
        
        return jsonify({
            'success': True,
            'totalAnalyzed': len(predictions),
            'criticalRisk': critical_risk,
            'highRisk': high_risk,
            'mediumRisk': medium_risk,
            'totalValueAtRisk': total_value_at_risk,
            'predictions': predictions[:20],  # Top 20 items
            'modelType': 'Ridge Regression'
        })
    
    except Exception as e:
        print(f"❌ Error in /predict: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Detailed endpoints (for backend proxy)
@app.route('/train/expiry', methods=['POST'])
def train_expiry_model():
    """Train expiry prediction model"""
    try:
        # Fetch products and sales data
        products = list(db.products.find({'expiryDate': {'$exists': True}}))
        
        # Fetch sales data from last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        orders = list(db.orders.find({'createdAt': {'$gte': thirty_days_ago}}))
        
        # Extract sales data
        sales_data = []
        for order in orders:
            for item in order.get('items', []):
                sales_data.append({
                    'productId': str(item.get('product')),
                    'quantity': item.get('quantity', 0),
                    'date': order.get('createdAt')
                })
        
        # Train model
        result = expiry_predictor.train(products, sales_data)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/expiry', methods=['GET'])
@app.route('/predict-expiry', methods=['POST'])
def predict_expiry():
    """Predict expiry risk for all products"""
    try:
        # Fetch products
        products = list(db.products.find({'expiryDate': {'$exists': True}}))
        
        # Fetch sales data
        thirty_days_ago = datetime.now() - timedelta(days=30)
        orders = list(db.orders.find({'createdAt': {'$gte': thirty_days_ago}}))
        
        sales_data = []
        for order in orders:
            for item in order.get('items', []):
                sales_data.append({
                    'productId': str(item.get('product')),
                    'quantity': item.get('quantity', 0),
                    'date': order.get('createdAt')
                })
        
        # Get predictions
        predictions = expiry_predictor.predict(products, sales_data)
        
        # Filter high-risk items
        high_risk = [p for p in predictions if p['riskScore'] >= 30]
        
        return jsonify({
            'success': True,
            'totalAnalyzed': len(predictions),
            'highRiskCount': len(high_risk),
            'predictions': high_risk[:20]  # Top 20 high-risk items
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/demand', methods=['GET'])
@app.route('/predict-demand', methods=['POST'])
def predict_demand():
    """Predict demand for all products"""
    try:
        # Fetch products
        products = list(db.products.find())
        
        # Fetch sales data
        thirty_days_ago = datetime.now() - timedelta(days=30)
        orders = list(db.orders.find({'createdAt': {'$gte': thirty_days_ago}}))
        
        sales_data = []
        for order in orders:
            for item in order.get('items', []):
                sales_data.append({
                    'productId': str(item.get('product')),
                    'quantity': item.get('quantity', 0),
                    'date': order.get('createdAt')
                })
        
        # Get predictions
        predictions = demand_predictor.predict_by_product(products, sales_data)
        
        return jsonify({
            'success': True,
            'predictions': predictions[:20]  # Top 20 items
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def suggest_reorder():
    """Generate reorder suggestions"""
    try:
        # Fetch products
        products_cursor = db.products.find()
        products = []

        # Convert all ObjectIds to strings immediately
        for p in products_cursor:
            p['_id'] = str(p['_id'])
            if 'supplier' in p and hasattr(p['supplier'], '__str__'):
                p['supplier'] = str(p['supplier'])
            products.append(p)

        print(f"📦 Total products fetched: {len(products)}")

        # Fetch pending purchase orders to exclude from suggestions
        pending_pos = list(db.purchaseorders.find({'status': 'Pending'}))
        pending_product_ids = set()

        print(f"🚚 Found {len(pending_pos)} pending purchase orders")

        for po in pending_pos:
            # PurchaseOrder has a single 'product' field, not 'items' array
            product_id = po.get('product')
            if product_id:
                product_id_str = str(product_id)
                pending_product_ids.add(product_id_str)
                print(f"   Excluding product: {product_id_str} (PO: {po.get('poNumber', 'N/A')})")

        # Filter out products with pending purchase orders
        products_before = len(products)
        products = [p for p in products if p['_id'] not in pending_product_ids]
        products_after = len(products)

        print(f"🔍 Filtered: {products_before} → {products_after} products (removed {products_before - products_after})")

        # Fetch ALL completed orders
        orders = list(db.orders.find({'status': 'Completed'}))

        sales_data = []
        for order in orders:
            order_date = order.get('createdAt')
            if not order_date:
                continue

            for item in order.get('items', []):
                product_id = item.get('product')
                quantity = item.get('quantity', 0)

                if product_id and quantity > 0:
                    sales_data.append({
                        'productId': str(product_id),
                        'quantity': int(quantity),
                        'date': order_date
                    })

        # Get demand predictions first
        demand_predictions = demand_predictor.predict_by_product(products, sales_data)

        # Generate reorder suggestions
        suggestions = reorder_suggester.generate_suggestions(products, sales_data, demand_predictions)

        print(f"✅ Generated {suggestions.get('needsReorder', 0)} reorder suggestions")

        return jsonify({
            'success': True,
            **suggestions
        })

    except Exception as e:
        print(f"❌ ERROR in suggest_reorder: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    """Get chatbot response"""
    try:
        data = request.json
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        # Get response from chatbot
        response = chatbot.get_response(message)
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🤖 AI Backend Server Starting...")
    print("=" * 50)
    print("📊 Models:")
    print("   - Expiry Prediction: Ridge Regression")
    print("   - Demand Prediction: Ridge Regression")
    print("   - Reorder Suggestions: EOQ Formula")
    print("   - Chatbot: Google Gemini API")
    print("=" * 50)
    print("🔗 MongoDB:", MONGODB_URI)
    print("🚀 Server: http://localhost:5001")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True)
