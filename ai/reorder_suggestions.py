"""
Automated Reordering Suggestions using EOQ Formula
Suggests optimal reorder quantities based on demand predictions
"""

import numpy as np
from datetime import datetime, timedelta

class ReorderSuggester:
    def __init__(self):
        self.safety_stock_multiplier = 1.5  # 50% safety stock
    
    def calculate_reorder_point(self, avg_daily_demand, lead_time_days=7):
        """
        Calculate reorder point using formula:
        Reorder Point = (Average Daily Demand × Lead Time) + Safety Stock
        """
        safety_stock = avg_daily_demand * lead_time_days * 0.5
        reorder_point = (avg_daily_demand * lead_time_days) + safety_stock
        return int(reorder_point)
    
    def calculate_economic_order_quantity(self, annual_demand, ordering_cost=100, holding_cost=10):
        """
        Calculate EOQ using formula:
        EOQ = sqrt((2 × Annual Demand × Ordering Cost) / Holding Cost)
        """
        if annual_demand <= 0:
            return 0
        
        eoq = np.sqrt((2 * annual_demand * ordering_cost) / holding_cost)
        return int(eoq)
    
    def generate_suggestions(self, products, sales_data, demand_predictions):
        """Generate reorder suggestions for products"""
        suggestions = []
        
        for product in products:
            current_stock = product['quantity']
            reorder_threshold = product.get('reorderThreshold', 50)
            
            # Get demand prediction for this product
            product_demand = next(
                (p for p in demand_predictions if p['productId'] == str(product['_id'])),
                None
            )
            
            if product_demand:
                predicted_30_day = product_demand['predicted30DayDemand']
                avg_daily_demand = predicted_30_day / 30
            else:
                # Fallback: calculate from sales data
                product_sales = [s for s in sales_data if s['productId'] == str(product['_id'])]
                if len(product_sales) > 0:
                    total_sold = sum([s['quantity'] for s in product_sales])
                    avg_daily_demand = total_sold / 30
                else:
                    avg_daily_demand = 1  # Default
            
            # Calculate reorder point
            reorder_point = self.calculate_reorder_point(avg_daily_demand)
            
            # Calculate EOQ
            annual_demand = avg_daily_demand * 365
            eoq = self.calculate_economic_order_quantity(annual_demand)
            
            # Determine if reorder is needed
            should_reorder = current_stock <= reorder_point
            
            # Calculate urgency
            if avg_daily_demand > 0:
                days_until_stockout = current_stock / avg_daily_demand
            else:
                days_until_stockout = 999
            
            if days_until_stockout < 3:
                urgency = 'Critical'
            elif days_until_stockout < 7:
                urgency = 'High'
            elif days_until_stockout < 14:
                urgency = 'Medium'
            else:
                urgency = 'Low'
            
            # Calculate suggested order quantity
            if should_reorder:
                # Order enough to reach optimal level
                suggested_quantity = max(eoq, reorder_point - current_stock)
            else:
                suggested_quantity = 0
            
            # Estimate cost
            unit_price = product.get('price', 0)
            estimated_cost = suggested_quantity * unit_price
            
            suggestion = {
                'productId': str(product['_id']),
                'productName': product['name'],
                'currentStock': current_stock,
                'reorderPoint': reorder_point,
                'shouldReorder': should_reorder,
                'suggestedQuantity': suggested_quantity,
                'economicOrderQuantity': eoq,
                'avgDailyDemand': round(avg_daily_demand, 2),
                'daysUntilStockout': round(days_until_stockout, 1),
                'urgency': urgency,
                'estimatedCost': round(estimated_cost, 2),
                'supplier': product.get('supplier', 'Not specified')
            }
            
            suggestions.append(suggestion)
        
        # Sort by urgency
        urgency_order = {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3}
        suggestions.sort(key=lambda x: (urgency_order[x['urgency']], -x['suggestedQuantity']))
        
        # Filter only products that need reordering
        reorder_needed = [s for s in suggestions if s['shouldReorder']]
        
        return {
            'totalProducts': len(suggestions),
            'needsReorder': len(reorder_needed),
            'suggestions': reorder_needed[:20]  # Top 20 urgent items
        }
