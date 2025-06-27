from db import supabase
import os,sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.ai import summarize_text, extract_symptoms

def process_documents():
    docs = supabase.table("documents").select("*").execute().data
    for doc in docs:
        if doc.get("summary"):
            continue  # already processed

        text = doc["text"]
        summary = summarize_text(text)
        symptoms = extract_symptoms(text)

        print(f"Summary: {summary}")
        print(f"Symptoms: {symptoms}")

        supabase.table("documents").update({
            "summary": summary,
            "symptoms_detected": symptoms
        }).eq("id", doc["id"]).execute()

if __name__ == "__main__":
    process_documents()
