import React, { useState, useEffect, useRef } from 'react';
import './AIChatbot.css';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m MediBot, your pharmacy assistant. I can help you with:\n\n• Check medicine stock\n• Check expiry dates\n• Get reorder suggestions\n• View low stock items\n• Search medicines\n\nHow can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage('user', userMessage);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(async () => {
      const response = await processQuery(userMessage);
      addMessage('bot', response);
      setIsTyping(false);
    }, 1000);
  };

  const processQuery = async (query) => {
    const lowerQuery = query.toLowerCase();

    try {
      const token = localStorage.getItem('authToken');

      // Check stock queries
      if (lowerQuery.includes('stock') || lowerQuery.includes('available') || lowerQuery.includes('inventory')) {
        if (lowerQuery.includes('low')) {
          return await getLowStockItems(token);
        }
        
        // Extract medicine name
        const medicineNames = ['paracetamol', 'amoxicillin', 'ibuprofen', 'metformin', 'omeprazole', 'aspirin', 'cetirizine', 'vitamin', 'azithromycin', 'losartan'];
        const foundMedicine = medicineNames.find(med => lowerQuery.includes(med));
        
        if (foundMedicine) {
          return await checkMedicineStock(foundMedicine, token);
        }
        
        return await getAllStock(token);
      }

      // Check expiry queries
      if (lowerQuery.includes('expir') || lowerQuery.includes('expire')) {
        return await getExpiringItems(token);
      }

      // Reorder suggestions
      if (lowerQuery.includes('reorder') || lowerQuery.includes('order') || lowerQuery.includes('buy')) {
        return await getReorderSuggestions(token);
      }

      // Search medicine
      if (lowerQuery.includes('search') || lowerQuery.includes('find')) {
        const medicineNames = ['paracetamol', 'amoxicillin', 'ibuprofen', 'metformin', 'omeprazole', 'aspirin', 'cetirizine', 'vitamin', 'azithromycin', 'losartan'];
        const foundMedicine = medicineNames.find(med => lowerQuery.includes(med));
        
        if (foundMedicine) {
          return await searchMedicine(foundMedicine, token);
        }
        
        return "Please specify which medicine you're looking for. For example: 'search paracetamol' or 'find ibuprofen'";
      }

      // Sales info
      if (lowerQuery.includes('sales') || lowerQuery.includes('revenue')) {
        return await getSalesInfo(token);
      }

      // Help
      if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
        return `I can help you with:

**Stock Management**
• "Check stock" - View all inventory
• "Low stock items" - Items needing reorder
• "Check paracetamol stock" - Specific medicine

**Expiry Tracking**
• "Expiring items" - Items expiring soon
• "Check expiry dates" - View expiry status

**Reordering**
• "Reorder suggestions" - What to order
• "What should I order?" - Smart suggestions

**Search**
• "Search [medicine name]" - Find specific medicine
• "Find ibuprofen" - Quick search

**Analytics**
• "Sales today" - Today's revenue
• "Sales report" - Sales summary

Just ask me anything!`;
      }

      // Default response
      return `I understand you're asking about "${query}". 

I can help you with:
• Stock checking (e.g., "check stock", "low stock items")
• Expiry tracking (e.g., "expiring items")
• Reorder suggestions (e.g., "what should I order?")
• Medicine search (e.g., "search paracetamol")
• Sales info (e.g., "today's sales")

Type "help" to see all commands!`;

    } catch (error) {
      return "Sorry, I encountered an error. Please make sure you're logged in and try again.";
    }
  };

  const getAllStock = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = await res.json();

      if (products.length === 0) {
        return "No products found in inventory.";
      }

      const inStock = products.filter(p => p.quantity > 0).length;
      const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.reorderLevel || 10)).length;
      const outOfStock = products.filter(p => p.quantity === 0).length;

      return `**Inventory Summary**

Total Products: ${products.length}
In Stock: ${inStock}
Low Stock: ${lowStock}
Out of Stock: ${outOfStock}

Would you like to see low stock items or expiring items?`;
    } catch (error) {
      return "Unable to fetch inventory data. Please try again.";
    }
  };

  const getLowStockItems = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = await res.json();

      const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.reorderLevel || 10));

      if (lowStock.length === 0) {
        return "Great news! No items are currently low on stock.";
      }

      let response = `**Low Stock Alert** (${lowStock.length} items)\n\n`;
      lowStock.slice(0, 5).forEach(item => {
        response += `• ${item.name}\n  Stock: ${item.quantity} | Price: Rs${item.price}\n\n`;
      });

      if (lowStock.length > 5) {
        response += `...and ${lowStock.length - 5} more items.\n\n`;
      }

      response += "Tip: Type 'reorder suggestions' to see what to order!";
      return response;
    } catch (error) {
      return "Unable to fetch low stock items. Please try again.";
    }
  };

  const getExpiringItems = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = await res.json();

      const now = new Date();
      const ninetyDaysLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const expiring = products.filter(p => {
        const expiryDate = new Date(p.expiryDate);
        return expiryDate <= ninetyDaysLater && expiryDate > now;
      });

      if (expiring.length === 0) {
        return "No items expiring in the next 90 days!";
      }

      let response = `**Expiring Soon** (${expiring.length} items)\n\n`;
      expiring.slice(0, 5).forEach(item => {
        const expiryDate = new Date(item.expiryDate);
        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        response += `• ${item.name}\n  Expires: ${expiryDate.toLocaleDateString()} (${daysLeft} days)\n  Stock: ${item.quantity}\n\n`;
      });

      if (expiring.length > 5) {
        response += `...and ${expiring.length - 5} more items.\n\n`;
      }

      response += "Consider promoting these items or offering discounts!";
      return response;
    } catch (error) {
      return "Unable to fetch expiring items. Please try again.";
    }
  };

  const checkMedicineStock = async (medicineName, token) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = await res.json();

      const found = products.filter(p => 
        p.name.toLowerCase().includes(medicineName.toLowerCase())
      );

      if (found.length === 0) {
        return `No products found matching "${medicineName}". Try searching for another medicine.`;
      }

      let response = `**${medicineName.toUpperCase()} Stock**\n\n`;
      found.forEach(item => {
        const expiryDate = new Date(item.expiryDate);
        const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        response += `• ${item.name}\n`;
        response += `  Stock: ${item.quantity}\n`;
        response += `  Price: Rs${item.price}\n`;
        response += `  Batch: ${item.batchNumber}\n`;
        response += `  Expires: ${expiryDate.toLocaleDateString()} (${daysLeft} days)\n`;
        response += `  Status: ${item.status}\n\n`;
      });

      return response;
    } catch (error) {
      return "Unable to check medicine stock. Please try again.";
    }
  };

  const searchMedicine = async (medicineName, token) => {
    return await checkMedicineStock(medicineName, token);
  };

  const getReorderSuggestions = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = await res.json();

      const needsReorder = products.filter(p => p.quantity <= (p.reorderLevel || 10));

      if (needsReorder.length === 0) {
        return "All items are well-stocked! No reordering needed at this time.";
      }

      let response = `**Reorder Suggestions** (${needsReorder.length} items)\n\n`;
      needsReorder.slice(0, 5).forEach(item => {
        const suggestedQty = Math.max(100, item.quantity * 3);
        response += `• ${item.name}\n`;
        response += `  Current: ${item.quantity}\n`;
        response += `  Suggested Order: ${suggestedQty} units\n`;
        response += `  Estimated Cost: Rs${(suggestedQty * item.price).toLocaleString()}\n\n`;
      });

      if (needsReorder.length > 5) {
        response += `...and ${needsReorder.length - 5} more items.\n\n`;
      }

      const totalCost = needsReorder.slice(0, 5).reduce((sum, item) => {
        const suggestedQty = Math.max(100, item.quantity * 3);
        return sum + (suggestedQty * item.price);
      }, 0);

      response += `Estimated Total: Rs${totalCost.toLocaleString()}`;
      return response;
    } catch (error) {
      return "Unable to generate reorder suggestions. Please try again.";
    }
  };

  const getSalesInfo = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stats = await res.json();

      return `**Sales Summary**

Today's Sales: Rs${stats.todaysSales.toLocaleString()}
Total Products: ${stats.totalSKUs}
Low Stock Items: ${stats.predictedShortages}
Expiring Soon: ${stats.expiringItems}

Your pharmacy is performing well! Keep monitoring stock levels.`;
    } catch (error) {
      return "Unable to fetch sales information. Please try again.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: 'Check Stock', query: 'check stock' },
    { label: 'Low Stock', query: 'low stock items' },
    { label: 'Expiring Items', query: 'expiring items' },
    { label: 'Reorder', query: 'reorder suggestions' }
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button className="chatbot-button" onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="chatbot-badge">AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span className="online-dot"></span>
              </div>
              <div>
                <h3>MediTrust - Chat with us</h3>
                <p>AI Assistant • Online</p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.type === 'bot' && (
                  <div className="message-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="chatbot-quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => {
                    setInputText(action.query);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              rows="1"
            />
            <button 
              className="chatbot-send" 
              onClick={handleSend}
              disabled={!inputText.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
