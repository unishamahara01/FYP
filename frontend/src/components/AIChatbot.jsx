import React, { useState, useEffect, useRef } from 'react';
import './AIChatbot.css';
import { aiAPI } from '../services/api';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m MediBot, your AI pharmacy assistant powered by Google Gemini. I can help you with:\n\n• Medicine information & dosages\n• Side effects & interactions\n• Check inventory stock\n• Expiry dates & alerts\n• Reorder suggestions\n\nHow can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkAIAvailability();
  }, []);

  const checkAIAvailability = async () => {
    const available = await aiAPI.checkHealth();
    setAiAvailable(available);
  };

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

    try {
      const response = await processQuery(userMessage);
      addMessage('bot', response);
    } catch (error) {
      addMessage('bot', "Sorry, I encountered an error processing your request.");
    } finally {
      setIsTyping(false);
    }
  };

  const processQuery = async (query) => {
    const lowerQuery = query.toLowerCase();
    const token = localStorage.getItem('authToken');

    // Check if it's a medicine information query (use AI)
    const medicineKeywords = ['what is', 'tell me about', 'side effect', 'dosage', 'dose', 'interaction', 'paracetamol', 'amoxicillin', 'ibuprofen', 'aspirin', 'antibiotic', 'medicine', 'drug', 'tablet', 'capsule'];
    const isMedicineQuery = medicineKeywords.some(keyword => lowerQuery.includes(keyword));

    if (isMedicineQuery && aiAvailable) {
      try {
        const aiResponse = await aiAPI.sendChatMessage(query);
        if (aiResponse.success) {
          return `🤖 **AI Response (Google Gemini)**\n\n${aiResponse.message}\n\n---\n💡 *Powered by Google Gemini AI*`;
        }
      } catch (error) {
        console.error('AI API error:', error);
        // Fall through to local responses
      }
    }

    // Local inventory queries
    if (lowerQuery.includes('stock') && !lowerQuery.includes('low')) {
      return await getAllStock(token);
    }
    
    if (lowerQuery.includes('low stock') || lowerQuery.includes('low on stock')) {
      return await getLowStockItems(token);
    }
    
    if (lowerQuery.includes('expir')) {
      return await getExpiringItems(token);
    }
    
    if (lowerQuery.includes('reorder') || lowerQuery.includes('order')) {
      return await getReorderSuggestions(token);
    }
    
    if (lowerQuery.includes('sales') || lowerQuery.includes('revenue')) {
      return await getSalesInfo(token);
    }
    
    if (lowerQuery.includes('search') || lowerQuery.includes('find') || lowerQuery.includes('check')) {
      const words = query.split(' ');
      const medicineName = words[words.length - 1];
      return await searchMedicine(medicineName, token);
    }

    // Default help response
    return `I can help you with:

**Medicine Information** (AI-powered)
• "What is Paracetamol used for?"
• "Side effects of Amoxicillin"
• "Dosage for Ibuprofen"

**Inventory Management**
• "Check stock" - View inventory summary
• "Low stock" - See items running low
• "Expiring items" - Check medicines expiring soon
• "Reorder suggestions" - Get AI recommendations
• "Search [medicine]" - Find specific medicine

${aiAvailable ? '✅ AI Assistant is online' : '⚠️ AI Assistant is offline (using local responses)'}`;
  };

  const getAllStock = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      let products = await res.json();
      if (!Array.isArray(products)) products = [];

      if (products.length === 0) {
        return "No products found in inventory.";
      }

      const inStock = products.filter(p => p.quantity > 0).length;
      const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.reorderLevel || 50)).length;
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
      let products = await res.json();
      if (!Array.isArray(products)) products = [];

      // Get all items that need attention (quantity <= reorderLevel)
      const needsAttention = products.filter(p => p.quantity <= (p.reorderLevel || 50));
      const outOfStock = needsAttention.filter(p => p.quantity === 0);
      const lowStock = needsAttention.filter(p => p.quantity > 0);

      if (needsAttention.length === 0) {
        return "Great news! No items are currently low on stock.";
      }

      let response = `**Stock Alert** (${needsAttention.length} items need attention)\n\n`;
      
      if (outOfStock.length > 0) {
        response += `🔴 **Out of Stock** (${outOfStock.length} items)\n`;
        outOfStock.slice(0, 3).forEach(item => {
          response += `• ${item.name} - URGENT REORDER\n`;
        });
        response += '\n';
      }
      
      if (lowStock.length > 0) {
        response += `🟡 **Low Stock** (${lowStock.length} items)\n`;
        lowStock.slice(0, 3).forEach(item => {
          response += `• ${item.name} - Stock: ${item.quantity}\n`;
        });
      }

      if (needsAttention.length > 6) {
        response += `\n...and ${needsAttention.length - 6} more items.\n`;
      }

      response += "\nTip: Type 'reorder suggestions' to see what to order!";
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
      let products = await res.json();
      if (!Array.isArray(products)) products = [];

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
      let products = await res.json();
      if (!Array.isArray(products)) products = [];

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
        response += `  Price: Rs${parseFloat(item.price).toFixed(2)}\n`;
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
      let products = await res.json();
      if (!Array.isArray(products)) products = [];

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
        return sum + (suggestedQty * parseFloat(item.price));
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

Today's Sales: Rs${(stats.todaysSales || 0).toLocaleString()}
Total Products: ${stats.totalSKUs || 0}
Low Stock Items: ${stats.predictedShortages || 0}
Expiring Soon: ${stats.expiringItems || 0}

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
            {Array.isArray(messages) && messages.map((msg, index) => (
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
              {Array.isArray(quickActions) && quickActions.map((action, index) => (
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
