const Product = require('../models/Product');

/**
 * Computes aggregated low stock items by grouping active products by name,
 * summing their quantities, and comparing them to their reorder level.
 * Expired batches are excluded from this calculation.
 */
async function getAggregatedLowStockData() {
  // Fetch all products with supplier populated
  const products = await Product.find({}).populate('supplier').lean();
  
  // Group ALL products by exact name (including expired ones)
  const groups = {};
  products.forEach(p => {
    if (!p.name) return;

    const nameKey = p.name.trim();
    if (!groups[nameKey]) {
      groups[nameKey] = {
        name: p.name,
        genericName: p.genericName,
        category: p.category,
        manufacturer: p.manufacturer,
        supplier: p.supplier,
        price: p.price,
        reorderLevel: p.reorderLevel !== undefined ? p.reorderLevel : 50,
        allBatches: [],
        activeBatches: []
      };
    }
    
    // Add to all batches
    groups[nameKey].allBatches.push(p);
    
    // Check if this batch is active (not expired)
    const isExpired = p.status === 'Expired' || (p.expiryDate && new Date(p.expiryDate) < new Date());
    if (!isExpired) {
      groups[nameKey].activeBatches.push(p);
    }
  });
  
  const lowStock = [];
  const outOfStock = [];
  
  for (const nameKey in groups) {
    const group = groups[nameKey];
    
    // Calculate total active quantity (excluding expired batches)
    const totalUsableQuantity = group.activeBatches.reduce((sum, b) => sum + b.quantity, 0);
    
    // Choose the maximum reorderLevel defined among ALL batches
    const reorderLevels = group.allBatches.map(b => b.reorderLevel !== undefined ? b.reorderLevel : 50);
    const groupReorderLevel = reorderLevels.length > 0 ? Math.max(...reorderLevels) : 50;
    
    // ONLY count items with ACTIVE stock below reorder level
    // Exclude items with 0 active quantity (out of stock/expired)
    if (totalUsableQuantity > 0 && totalUsableQuantity <= groupReorderLevel) {
      // Pick a representative batch for details (prefer active batch)
      const representative = group.activeBatches[0];
      
      const item = {
        name: group.name,
        genericName: group.genericName,
        category: group.category,
        manufacturer: group.manufacturer,
        supplier: group.supplier,
        price: group.price,
        quantity: totalUsableQuantity,
        reorderLevel: groupReorderLevel,
        batchNumber: representative.batchNumber,
        status: 'Low Stock',
        _id: representative._id
      };
      
      lowStock.push(item);
    }
  }
  
  return {
    lowStock,
    outOfStock, // Empty array - out of stock items shown in inventory history
    totalCount: lowStock.length
  };
}

module.exports = {
  getAggregatedLowStockData
};
