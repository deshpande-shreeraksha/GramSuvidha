from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Gram Suvidha ML Service is running..."}

class ComplaintAnalysisRequest(BaseModel):
    category: str
    description: str

class KPIRequest(BaseModel):
    data: List[Dict[str, Any]]

# Simple keyword-based category matching
CATEGORY_KEYWORDS = {
    "water": ["water", "pipe", "leak", "tank", "sanitation", "drainage", "sewage", "tap", "borewell"],
    "electricity": ["light", "power", "electricity", "voltage", "meter", "transformer", "pole", "wire"],
    "roads": ["road", "pothole", "street", "pavement", "bridge", "construction", "highway"],
    "welfare": ["benefit", "pension", "ration", "scheme", "welfare", "card", "subsidy"],
}

@app.post("/analyze-complaint")
async def analyze_complaint(request: ComplaintAnalysisRequest):
    desc = request.description.lower()
    cat = request.category.lower()
    
    # If it's 'other', we don't strictly validate
    if cat == "other":
        return {"is_valid": True, "warning": ""}
    
    keywords = CATEGORY_KEYWORDS.get(cat, [])
    
    # Check if any keyword matches the description
    found = any(keyword in desc for keyword in keywords)
    
    if not found:
        return {
            "is_valid": False, 
            "warning": f"The description doesn't seem to match the '{cat}' category. Please ensure you've selected the right category or provide more detail."
        }
    
    return {"is_valid": True, "warning": ""}

@app.post("/generate-kpis")
async def generate_kpis(request: KPIRequest):
    data = request.data
    total = len(data)
    
    if total == 0:
        return {
            "total_complaints": 0,
            "resolved_rate": "0%",
            "raw_counts": {}
        }
    
    resolved = sum(1 for item in data if item.get("status") == "Resolved")
    resolved_rate = f"{(resolved / total) * 100:.1f}%"
    
    # Category and Status breakdown
    raw_counts = {}
    raw_categories = {}
    for item in data:
        status = item.get("status", "Pending")
        raw_counts[status] = raw_counts.get(status, 0) + 1
        
        category = item.get("category", "other")
        raw_categories[category] = raw_categories.get(category, 0) + 1
        
    return {
        "total_complaints": total,
        "resolved_rate": resolved_rate,
        "raw_counts": raw_counts,
        "raw_categories": raw_categories
    }

class ChatbotRequest(BaseModel):
    query: str
    context: Dict[str, Any]

@app.post("/chatbot/query")
async def chatbot_query(request: ChatbotRequest):
    query = request.query.lower()
    ctx = request.context
    
    # NLP intent keywords
    intents = {
        "greetings": ["hello", "hi", "namaste", "hey", "greet"],
        "schemes": ["scheme", "yojana", "benefit", "eligibility", "project", "apply", "program"],
        "budget": ["budget", "allocation", "money", "fund", "financial", "expenditure", "cost"],
        "complaints": ["complaint", "report", "issue", "status", "track", "pothole", "leak", "trash", "garbage"],
        "meetings": ["meeting", "sabha", "minutes", "gather", "agenda", "council"],
        "taxes": ["tax", "due", "property", "bill"],
        "alerts": ["election", "vote", "poll", "cutoff", "blockage", "construction", "water supply", "power cut", "alert"]
    }
    
    # Calculate intent matching scores using keyword overlap
    scores = {}
    for intent, keywords in intents.items():
        score = 0
        for keyword in keywords:
            if keyword in query:
                score += 3
        # Splitting query to match word overlaps
        query_words = set(query.split())
        overlap = query_words.intersection(set(keywords))
        score += len(overlap) * 2
        scores[intent] = score
        
    best_intent = max(scores, key=scores.get)
    if scores[best_intent] == 0:
        best_intent = "unknown"
        
    response = ""
    
    if best_intent == "greetings":
        response = "Namaste! I am Suvidha AI, your smart Gram Panchayat assistant. I use NLP classification models from the Panchayat ML service to answer your questions. You can ask me about:\n\n1. 🌾 **Panchayat Schemes & Projects**\n2. 💰 **Annual Budget Details**\n3. 📝 **Filing or Tracking Complaints**\n4. 📅 **Gram Sabha Meetings**\n5. 💳 **Property Taxes & Payments**\n6. 📢 **Election & Cutoff Alerts**\n\nHow can I help you today?"
        
    elif best_intent == "schemes":
        schemes = ctx.get("schemes", [])
        if schemes:
            response = "Here are the active government schemes and development projects in our Panchayat:\n"
            for i, s in enumerate(schemes):
                response += f"\n{i+1}. **{s['title']}**\n   - *Description*: {s['description']}\n   - *Eligibility*: {s['eligibility']}\n   - *Benefits*: {s['benefits']}\n   - *How to Apply*: {s['applicationProcess']}\n"
            response += "\nYou can apply for these online in the \"Scheme's\" sidebar tab."
        else:
            response = "There are no active schemes listed at this moment. Please check back later."
            
    elif best_intent == "budget":
        budget = ctx.get("budget")
        if budget:
            allocated = budget.get("allocatedAmount", 0)
            items = budget.get("items", [])
            response = f"The annual development budget for our Panchayat (FY {budget.get('year')}) is **₹{allocated:,}**.\n\nSector-wise Allocations:\n"
            for i, item in enumerate(items):
                response += f"\n{i+1}. **{item['category']}**: ₹{item['allocatedAmount']:,}\n   - *Description*: {item['description']}\n"
            response += "\nYou can view interactive charts of this budget in the \"Panchayat Budget\" page."
        else:
            response = "No budget allocation has been uploaded by the Panchayat Board yet."
            
    elif best_intent == "complaints":
        user_complaints = ctx.get("userComplaints", [])
        user = ctx.get("user")
        if user:
            if user_complaints:
                response = "Here are your recent registered complaints and their status:\n"
                for i, c in enumerate(user_complaints):
                    response += f"\n{i+1}. **{c['title']}** ({c['category']})\n   - Status: *{c['status']}*\n   - Location: {c['address'] or 'GPS Coordinates'}\n"
                response += "\nYou can file a new complaint by clicking \"Register Complaint\" in the sidebar."
            else:
                response = "You haven't registered any complaints yet. To report an issue (like broken streetlights or water pipeline leaks), click \"Register Complaint\" in the sidebar."
        else:
            response = "Please log in to your account to track your filed complaints. Generally, you can file complaints under categories like Water, Electricity, and Roads in the \"Register Complaint\" section."
            
    elif best_intent == "meetings":
        meetings = ctx.get("meetings", [])
        if meetings:
            response = "Here are the scheduled Gram Sabha / Panchayat meetings:\n"
            for i, m in enumerate(meetings):
                response += f"\n{i+1}. **{m['title']}**\n   - Date: {m['date']}\n   - Venue: {m['venue']}\n   - Agenda: {m['agenda']}\n"
            response += "\nYou can read previous meeting minutes in the \"Meetings & Minutes\" page."
        else:
            response = "No Panchayat meetings are currently scheduled."
            
    elif best_intent == "taxes":
        user_taxes = ctx.get("userTaxes", [])
        user = ctx.get("user")
        if user:
            if user_taxes:
                response = "Your property tax records are as follows:\n"
                for t in user_taxes:
                    response += f"\n- Assessment No: **{t['assessmentNumber']}**\n  - Total Tax Amount: ₹{t['taxAmount']}\n  - Status: *{t['status']}*\n  - Billing Period: {t['billingPeriod']}\n"
                response += "\nYou can pay your property taxes online using the \"Property Taxes\" page."
            else:
                response = "No property tax records found for your account. Please check the \"Property Taxes\" section to add one."
        else:
            response = "Please log in to check your property tax dues. You can pay your village property tax online through the \"Property Taxes\" page."
            
    elif best_intent == "alerts":
        broadcasts = ctx.get("broadcasts", [])
        if broadcasts:
            response = "Here are the latest alerts and announcements published by the Panchayat:\n"
            for b in broadcasts:
                response += f"\n📢 **[{b['category']}] {b['title']}**\n   - Scheduled Date: {b['date']}\n   - Timings: {b['timings'] or 'N/A'}\n   - Details: {b['description']}\n"
        else:
            response = "There are no active alerts regarding elections, cutoffs, or road blockages at the moment."
            
    else:
        response = "I apologize, I couldn't find specific details for your query. Try asking about active government schemes, annual budget allocations, meeting details, property tax records, or check the status of your complaints."
        
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
