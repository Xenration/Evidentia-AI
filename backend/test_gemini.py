import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Using key: {api_key[:15]}..." if api_key else "❌ No key found in .env")

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Say 'Hello Evidentia' in one short sentence."
    )
    print("✅ SUCCESS!")
    print("Response:", response.text)
except Exception as e:
    print("❌ FAILED!")
    print("Error:", str(e))