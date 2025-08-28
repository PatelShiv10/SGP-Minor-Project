# LawSimplify Model API (FastAPI)

## Setup

1. Create and activate a virtual environment (optional)
2. Install deps:

```bash
pip install -r requirements.txt
```

3. Set environment:

- Create `.env` in `Model/` with:
```
GOOGLE_API_KEY=your-google-api-key
```

4. Run the server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

- POST /simplify
```
{ "text": "<legal clause>" }
```
- POST /translate
```
{ "result": { ...json }, "target_language": "Hindi" }
```