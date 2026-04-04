"""
AI Chatbot using Google Gemini API
Provides medicine information and recommendations
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class MedicineChatbot:
    def __init__(self):
        # Configure Google Gemini API
        self.api_key = os.getenv('GOOGLE_API_KEY')
        
        if self.api_key and self.api_key != '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':
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                self.api_available = True
                print("Google Gemini API configured successfully")
            except Exception as e:
                print(f"Google Gemini API configuration failed: {e}")
                self.model = None
                self.api_available = False
        else:
            print("Google API key not found. Using fallback responses.")
            self.model = None
            self.api_available = False
        
        # System prompt for medicine context
        self.system_prompt = """You are a helpful pharmacy assistant AI named MediBot. 
        You provide accurate information about medicines, their uses, dosages, side effects, and interactions.
        
        Guidelines:
        - Provide clear, concise, and accurate medical information
        - Always remind users to consult a healthcare professional for medical advice
        - If you're unsure, say so and recommend consulting a pharmacist or doctor
        - Use simple language that patients can understand
        - Include dosage information when relevant
        - Mention common side effects
        - Warn about serious drug interactions
        
        Remember: You are an informational assistant, not a replacement for professional medical advice."""
    
    def get_response(self, user_message):
        """Get chatbot response using Google Gemini API"""
        
        # Try Google Gemini API first
        if self.api_available and self.model:
            try:
                # Combine system prompt with user message
                full_prompt = f"{self.system_prompt}\n\nUser Question: {user_message}\n\nProvide a helpful response:"
                
                # Generate response using Gemini
                response = self.model.generate_content(full_prompt)
                
                return {
                    'success': True,
                    'message': response.text,
                    'source': 'Google Gemini API'
                }
            
            except Exception as e:
                print(f"API Error: {e}")
                # Fall back to rule-based
                return self._fallback_response(user_message)
        
        # Use fallback if API not available
        return self._fallback_response(user_message)
    
    def _fallback_response(self, message):
        """Fallback rule-based responses when API is not available"""
        message_lower = message.lower()
        
        # Paracetamol / Acetaminophen
        if 'paracetamol' in message_lower or 'acetaminophen' in message_lower:
            return {
                'success': True,
                'message': """**Paracetamol (Acetaminophen)**

**Uses:** Pain relief and fever reduction

**Dosage:**
- Adults: 500-1000mg every 4-6 hours
- Maximum: 4000mg per day
- Children: Dose based on weight (consult doctor)

**Side Effects:**
- Generally well-tolerated
- Rare: Liver damage with overdose
- Allergic reactions (rare)

**Warnings:**
- Do not exceed recommended dose
- Avoid alcohol while taking
- Consult doctor if pregnant/breastfeeding

Always consult a healthcare professional for personalized advice.""",
                'source': 'Rule-based fallback'
            }
        
        # Amoxicillin
        elif 'amoxicillin' in message_lower:
            return {
                'success': True,
                'message': """**Amoxicillin**

**Uses:** Antibiotic for bacterial infections (respiratory, ear, urinary tract)

**Dosage:**
- Adults: 250-500mg every 8 hours
- Children: Dose based on weight
- Duration: Usually 7-10 days

**Side Effects:**
- Nausea, diarrhea
- Skin rash
- Yeast infections

**Important:**
- Complete full course even if feeling better
- Take with or without food
- Tell doctor if allergic to penicillin

Prescription required. Consult your doctor.""",
                'source': 'Rule-based fallback'
            }
        
        # Ibuprofen
        elif 'ibuprofen' in message_lower:
            return {
                'success': True,
                'message': """**Ibuprofen**

**Uses:** Pain relief, fever reduction, anti-inflammatory

**Dosage:**
- Adults: 200-400mg every 4-6 hours
- Maximum: 1200mg per day (OTC), 3200mg (prescription)
- Take with food

**Side Effects:**
- Stomach upset, heartburn
- Nausea
- Dizziness

**Warnings:**
- Avoid if you have stomach ulcers
- May increase heart attack/stroke risk
- Not for children under 6 months

Consult healthcare professional if symptoms persist.""",
                'source': 'Rule-based fallback'
            }
        
        # Aspirin
        elif 'aspirin' in message_lower:
            return {
                'success': True,
                'message': """**Aspirin**

**Uses:** Pain relief, fever reduction, blood thinner (heart protection)

**Dosage:**
- Pain relief: 300-900mg every 4-6 hours
- Heart protection: 75-325mg daily
- Maximum: 4000mg per day

**Side Effects:**
- Stomach irritation
- Increased bleeding risk
- Allergic reactions

**Warnings:**
- Not for children under 16 (Reye's syndrome risk)
- Avoid before surgery
- Tell doctor if taking blood thinners

Consult doctor before starting daily aspirin.""",
                'source': 'Rule-based fallback'
            }
        
        # Antibiotics general
        elif 'antibiotic' in message_lower:
            return {
                'success': True,
                'message': """**Antibiotics**

**What they do:** Kill or stop growth of bacteria

**Common types:**
- Penicillins (Amoxicillin)
- Cephalosporins (Cephalexin)
- Macrolides (Azithromycin)
- Fluoroquinolones (Ciprofloxacin)

**Important rules:**
✓ Take exactly as prescribed
✓ Complete full course
✓ Don't share with others
✓ Don't save for later
✗ Don't work for viral infections (cold, flu)

**Side effects:** Diarrhea, nausea, allergic reactions

Prescription required. Consult your doctor.""",
                'source': 'Rule-based fallback'
            }
        
        # Side effects
        elif 'side effect' in message_lower:
            return {
                'success': True,
                'message': """**About Side Effects**

**Common side effects:**
- Nausea, vomiting
- Dizziness, drowsiness
- Headache
- Stomach upset
- Dry mouth

**When to seek immediate help:**
- Difficulty breathing
- Severe allergic reaction (rash, swelling)
- Chest pain
- Severe dizziness
- Unusual bleeding

**Tips:**
- Read medication leaflet
- Report side effects to doctor
- Don't stop medication without consulting doctor
- Keep list of all medications

Always consult your pharmacist or doctor about side effects.""",
                'source': 'Rule-based fallback'
            }
        
        # Dosage
        elif 'dosage' in message_lower or 'dose' in message_lower or 'how much' in message_lower:
            return {
                'success': True,
                'message': """**About Medication Dosage**

**Dosage depends on:**
- Age and weight
- Medical condition severity
- Other medications you take
- Kidney/liver function
- Pregnancy/breastfeeding status

**Important rules:**
✓ Follow doctor's prescription exactly
✓ Use measuring device (not spoon)
✓ Take at same time each day
✓ Don't double dose if you miss one
✗ Never exceed recommended dose

**For specific dosage information, please:**
- Specify the medicine name
- Consult your doctor or pharmacist
- Read the medication leaflet

Incorrect dosing can be dangerous.""",
                'source': 'Rule-based fallback'
            }
        
        # Drug interactions
        elif 'interaction' in message_lower:
            return {
                'success': True,
                'message': """**Drug Interactions**

**What are they?**
When one drug affects how another drug works

**Common interactions:**
- Antibiotics + Birth control pills
- Blood thinners + NSAIDs (Aspirin, Ibuprofen)
- Antidepressants + Pain medications
- Diabetes medications + Alcohol

**Always tell your doctor about:**
- All prescription medications
- Over-the-counter drugs
- Vitamins and supplements
- Herbal products
- Alcohol consumption

**Tips:**
- Keep medication list updated
- Use same pharmacy for all prescriptions
- Ask pharmacist to check interactions

Some interactions can be life-threatening. Always consult healthcare professionals.""",
                'source': 'Rule-based fallback'
            }
        
        # Default response
        else:
            return {
                'success': True,
                'message': """**MediBot - Pharmacy Assistant**

I can help you with information about:
- Medicine uses and benefits
- Dosage guidelines
- Side effects
- Drug interactions
- General health advice

**Popular queries:**
- "What is Paracetamol used for?"
- "Side effects of Amoxicillin"
- "Dosage for Ibuprofen"
- "Drug interactions with Aspirin"

Please ask about a specific medicine or topic!

**Important:** I provide general information only. Always consult a healthcare professional for medical advice, diagnosis, or treatment.

**Tip:** For better responses, enable Google Gemini API in your .env file.""",
                'source': 'Rule-based fallback'
            }
