import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# ✅ This ensures .env is loaded from the folder where db.py is located
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 🧪 Optional: Debug print to check
print("SUPABASE_URL:", SUPABASE_URL)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
