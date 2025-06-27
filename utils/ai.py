from langchain_community.llms import Ollama
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import re

llm = Ollama(model="mistral")  # or mistral etc.

# Template for summarization
summarize_prompt = PromptTemplate(
    input_variables=["text"],
    template="""
You are a medical assistant. Summarize the following document into 2-3 sentences:
{text}
"""
)

summary_chain = LLMChain(prompt=summarize_prompt, llm=llm)

def summarize_text(text):
    return summary_chain.run({"text": text})

# Symptom extraction
SYMPTOM_KEYWORDS = [
    "fever", "cough", "fatigue", "pain", "headache", "nausea",
    "dizziness", "rash", "infection", "vomiting", "diarrhea"
]

def extract_symptoms(text):
    found = set()
    text_lower = text.lower()
    for word in SYMPTOM_KEYWORDS:
        if word in text_lower:
            found.add(word)
    return list(found)
