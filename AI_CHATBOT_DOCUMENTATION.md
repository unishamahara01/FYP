# 🤖 AI Chatbot Documentation

## Overview

The MediBot AI Chatbot is an intelligent pharmacy assistant that helps users interact with the system using natural language. It provides instant answers to queries about stock, expiry dates, reorder suggestions, and more.

---

## ✨ Features

### 1. **Stock Management Queries**
- Check overall inventory status
- View low stock items
- Check specific medicine availability
- Get real-time stock levels

### 2. **Expiry Tracking**
- View items expiring soon (within 90 days)
- Check expiry dates for specific medicines
- Get alerts for high-risk items

### 3. **Reorder Suggestions**
- Get intelligent reorder recommendations
- View suggested order quantities
- Calculate estimated costs
- Identify items needing immediate reorder

### 4. **Medicine Search**
- Search for specific medicines
- View detailed product information
- Check batch numbers and expiry dates
- See current stock status

### 5. **Sales Analytics**
- View today's sales
- Get sales summaries
- Monitor revenue trends

### 6. **Quick Actions**
- Pre-defined quick action buttons
- One-click common queries
- Fast access to frequent tasks

---

## 🎯 How to Use

### Opening the Chatbot

1. Look for the **purple chat button** in the bottom-right corner
2. Click the button to open the chat window
3. The chatbot will greet you with available commands

### Asking Questions

Simply type your question in natural language. Examples:

**Stock Queries:**
```
"Check stock"
"Low stock items"
"Check paracetamol stock"
"Is ibuprofen available?"
"Show me inventory"
```

**Expiry Queries:**
```
"Expiring items"
"Check expiry dates"
"What's expiring soon?"
"Show medicines expiring"
```

**Reorder Queries:**
```
"Reorder suggestions"
"What should I order?"
"Show reorder list"
"What needs ordering?"
```

**Search Queries:**
```
"Search paracetamol"
"Find ibuprofen"
"Look for metformin"
```

**Sales Queries:**
```
"Today's sales"
"Sales report"
"Show revenue"
```

**Help:**
```
"Help"
"What can you do?"
"Show commands"
```

---

## 🧠 AI Intelligence

### Natural Language Processing

The chatbot uses intelligent keyword matching to understand user intent:

- **Flexible queries**: Understands variations like "check stock", "show inventory", "view products"
- **Context awareness**: Recognizes medicine names in queries
- **Smart suggestions**: Provides relevant follow-up actions

### Query Processing

1. **User Input** → Chatbot receives message
2. **Intent Detection** → Identifies what user wants
3. **Data Fetching** → Queries MongoDB through API
4. **Response Generation** → Formats data into readable response
5. **Display** → Shows formatted response with emojis and structure

---

## 📊 Supported Queries

| Category | Example Queries | What It Does |
|----------|----------------|--------------|
| **Stock Check** | "check stock", "inventory" | Shows overall inventory summary |
| **Low Stock** | "low stock items", "what's running low" | Lists items needing reorder |
| **Specific Medicine** | "check paracetamol", "ibuprofen stock" | Shows details for specific medicine |
| **Expiry** | "expiring items", "check expiry" | Lists medicines expiring within 90 days |
| **Reorder** | "reorder suggestions", "what to order" | Suggests items to reorder with quantities |
| **Search** | "search aspirin", "find vitamin" | Searches for specific medicine |
| **Sales** | "today's sales", "sales report" | Shows sales statistics |
| **Help** | "help", "what can you do" | Lists all available commands |

---

## 🎨 User Interface

### Chat Button
- **Location**: Bottom-right corner (fixed position)
- **Design**: Purple gradient circle with chat icon
- **Badge**: Green "AI" badge indicating AI-powered
- **Hover Effect**: Scales up on hover

### Chat Window
- **Size**: 380px × 600px
- **Position**: Bottom-right, above chat button
- **Design**: Modern card with rounded corners
- **Animation**: Smooth slide-up animation on open

### Components

1. **Header**
   - MediBot avatar
   - Title and subtitle
   - Close button

2. **Messages Area**
   - Scrollable message list
   - Bot messages (left-aligned, white background)
   - User messages (right-aligned, purple gradient)
   - Timestamps for each message
   - Typing indicator when bot is processing

3. **Quick Actions** (shown initially)
   - Check Stock
   - Low Stock
   - Expiring Items
   - Reorder

4. **Input Area**
   - Text input field
   - Send button (purple gradient)
   - Enter key support

---

## 💡 Smart Features

### 1. **Contextual Responses**
The chatbot provides context-aware responses based on the data:
- Shows actual numbers from database
- Formats currency properly (₨)
- Displays dates in readable format
- Limits results to top 5 items (with "...and X more" for longer lists)

### 2. **Helpful Suggestions**
After each response, the bot suggests related actions:
- After showing low stock → Suggests checking reorder suggestions
- After showing expiring items → Suggests promoting or discounting
- After inventory summary → Asks if user wants more details

### 3. **Error Handling**
- Graceful error messages if API fails
- Suggests checking login status
- Provides alternative queries

### 4. **Quick Actions**
Pre-defined buttons for common tasks:
- Faster than typing
- Reduces user effort
- Guides new users

---

## 🔧 Technical Implementation

### Frontend Component
**File**: `frontend/src/components/AIChatbot.jsx`

**Key Features**:
- React functional component with hooks
- State management for messages and UI
- Real-time message updates
- Smooth animations
- Responsive design

### API Integration
The chatbot connects to existing backend APIs:
- `GET /api/products` - Fetch inventory
- `GET /api/dashboard/stats` - Get statistics
- All requests include JWT authentication

### Query Processing Logic

```javascript
processQuery(userQuery) {
  1. Convert to lowercase
  2. Check for keywords (stock, expiry, reorder, etc.)
  3. Extract medicine names if present
  4. Call appropriate API endpoint
  5. Format response with emojis and structure
  6. Return formatted message
}
```

---

## 📱 Responsive Design

- **Desktop**: Full-size chat window (380px × 600px)
- **Mobile**: Adapts to screen size (calc(100vw - 32px))
- **Tablet**: Optimized for touch interactions

---

## 🎓 For Your FYP Demo

### Demo Script

1. **Open Chatbot**
   - Click the purple chat button
   - Show the greeting message

2. **Check Stock**
   - Type: "check stock"
   - Show real-time inventory summary

3. **Low Stock Alert**
   - Type: "low stock items"
   - Demonstrate proactive alerts

4. **Expiry Tracking**
   - Type: "expiring items"
   - Show expiry risk management

5. **Reorder Suggestions**
   - Type: "reorder suggestions"
   - Show intelligent recommendations with costs

6. **Medicine Search**
   - Type: "search paracetamol"
   - Show detailed product information

7. **Sales Info**
   - Type: "today's sales"
   - Show business analytics

### Key Points to Highlight

✅ **Natural Language Understanding** - No need to learn commands  
✅ **Real-time Data** - Connects to MongoDB  
✅ **Intelligent Suggestions** - Proactive recommendations  
✅ **User-Friendly** - Simple and intuitive  
✅ **Always Available** - 24/7 assistance  
✅ **Multi-functional** - Handles various queries  

---

## 🚀 Future Enhancements

### Potential Improvements:

1. **Advanced NLP**
   - Integrate OpenAI GPT API
   - Better context understanding
   - Multi-turn conversations

2. **Voice Input**
   - Speech-to-text
   - Voice commands
   - Hands-free operation

3. **Predictive Suggestions**
   - Learn from user behavior
   - Suggest queries before asking
   - Personalized recommendations

4. **Multi-language Support**
   - Nepali language support
   - Hindi language support
   - Language detection

5. **Advanced Analytics**
   - Trend analysis
   - Demand forecasting integration
   - Predictive alerts

---

## 📊 Chatbot Analytics

### Metrics to Track:

- Total queries handled
- Most common queries
- Response accuracy
- User satisfaction
- Average response time
- Query categories distribution

---

## 🎯 Academic Value

### Demonstrates:

1. **Natural Language Processing** - Query understanding
2. **API Integration** - Backend connectivity
3. **Real-time Data** - Live database queries
4. **User Experience** - Intuitive interface
5. **AI Application** - Practical AI implementation
6. **Problem Solving** - Addresses real pharmacy needs

---

## 📝 Testing the Chatbot

### Test Cases:

1. **Stock Queries**
   - ✅ "check stock" → Shows inventory summary
   - ✅ "low stock" → Lists low stock items
   - ✅ "check paracetamol" → Shows specific medicine

2. **Expiry Queries**
   - ✅ "expiring items" → Lists items expiring soon
   - ✅ "check expiry" → Shows expiry information

3. **Reorder Queries**
   - ✅ "reorder suggestions" → Shows recommendations
   - ✅ "what to order" → Provides order list

4. **Search Queries**
   - ✅ "search aspirin" → Finds medicine
   - ✅ "find vitamin" → Shows search results

5. **Sales Queries**
   - ✅ "today's sales" → Shows sales data
   - ✅ "sales report" → Displays summary

6. **Help Queries**
   - ✅ "help" → Lists all commands
   - ✅ "what can you do" → Shows capabilities

---

## 🎉 Success!

Your AI Chatbot is now fully functional and ready for demonstration!

**Key Features Implemented:**
- ✅ Natural language query processing
- ✅ Real-time database integration
- ✅ Intelligent response generation
- ✅ User-friendly interface
- ✅ Quick action buttons
- ✅ Typing indicators
- ✅ Smooth animations
- ✅ Responsive design

**Ready for FYP Demo!** 🚀

---

**Created**: January 18, 2026  
**Feature Status**: ✅ COMPLETE  
**Integration**: All Dashboards (Admin, Pharmacist, Staff)
