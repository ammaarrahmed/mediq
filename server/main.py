from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth,documents
import pytesseract, os
from routers import chat

pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcloud-key.json"
app = FastAPI(title="MedIQ Backend")
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

app.include_router(documents.router, prefix="/docs", tags=["Documents"])
# Allow frontend dev origin
origins = [
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
