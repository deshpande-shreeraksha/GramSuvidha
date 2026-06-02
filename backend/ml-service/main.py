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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
