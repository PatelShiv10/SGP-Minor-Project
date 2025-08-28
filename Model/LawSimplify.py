import os
import json
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# External libs
import requests
from bs4 import BeautifulSoup

try:
    import google.generativeai as genai
except Exception:
    genai = None

try:
    # googlesearch-python
    from googlesearch import search as google_search
except Exception:
    google_search = None

# Load environment
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title="LawSimplify Model API", version="1.0.0")

# Allow local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GENERATION_CONFIG = {"response_mime_type": "application/json"}
MODEL_NAME = "gemini-2.5-pro"

if GOOGLE_API_KEY and genai:
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_model = genai.GenerativeModel(model_name=MODEL_NAME, generation_config=GENERATION_CONFIG)
else:
    gemini_model = None


class SimplifyRequest(BaseModel):
    text: str = Field(..., description="Legal clause to simplify")


class TranslateRequest(BaseModel):
    result: Dict[str, Any] = Field(..., description="JSON result object to translate")
    target_language: str = Field(..., description="Target language name (e.g., Hindi)")


LEGAL_KEYWORDS = {
    "agreement", "party", "parties", "clause", "section", "article", "court",
    "shall", "hereto", "indemnify", "liability", "contract", "witness", "behalf",
    "provision", "judgement", "decree", "plaintiff", "defendant", "covenant", "warrant",
    "hereby"
}


def find_relevant_url(query: str) -> Optional[str]:
    if not google_search:
        return None
    try:
        search_query = f"{query} India"
        results = list(google_search(search_query, num_results=1, lang="en"))
        if results:
            return results[0]
    except Exception:
        return None
    return None


def scrape_text_from_url(url: str) -> str:
    if not url:
        return ""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = soup.get_text(separator="\n")
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        return cleaned_text[:3500]
    except Exception:
        return ""


@app.get("/health")
async def health():
    return {"status": "ok", "gemini": bool(gemini_model)}


@app.post("/simplify")
async def simplify(req: SimplifyRequest):
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini model not configured. Set GOOGLE_API_KEY.")

    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    tokens = text.split()
    lower = text.lower()
    if len(tokens) < 8 or not any(k in lower for k in LEGAL_KEYWORDS):
        raise HTTPException(status_code=400, detail="This does not appear to be a valid legal statement.")

    context = ""
    url = find_relevant_url(text)
    if url:
        context = scrape_text_from_url(url)

    prompt = f"""
    You are an expert at simplifying complex Indian legal clauses for a general audience.
    Your task is to take the following legal clause from India and return a JSON object with two keys: "simplified_explanation" and "real_life_example".

    To help you, here is some context I found on the web which might be related:
    --- WEB CONTEXT ---
    {context if context else "No context found."}
    --- END OF CONTEXT ---

    Now, based on the original text (and the context if it was helpful), provide your analysis.
    1.  For "simplified_explanation": The statement should be simplified.
    2.  For "real_life_example": A simple and easy to understand example should be given.

    Original Indian Legal Clause to simplify:
    ---
    {text}
    ---
    """

    try:
        resp = gemini_model.generate_content(prompt)
        data = json.loads(resp.text)
        if not isinstance(data, dict):
            raise ValueError("Invalid model JSON response")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model error: {e}")


@app.post("/translate")
async def translate(req: TranslateRequest):
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini model not configured. Set GOOGLE_API_KEY.")

    target = (req.target_language or '').strip()
    if not target or target.lower() == 'english':
        return req.result

    json_str = json.dumps(req.result)
    prompt = f"""
    You are an expert translator. Your task is to translate all the string values in the following JSON object into {target}.
    - Do NOT translate the JSON keys.
    - Keep the exact same JSON structure.

    JSON to translate:
    {json_str}
    """
    try:
        resp = gemini_model.generate_content(prompt)
        data = json.loads(resp.text)
        return data
    except Exception as e:
        # Return original on failure
        return req.result