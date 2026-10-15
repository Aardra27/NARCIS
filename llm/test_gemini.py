from google import genai
import os

print("=" * 60)
print("NARCIS GEMINI CONNECTION TEST")
print("=" * 60)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set.")

print("API key detected.")

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents="Reply with exactly: NARCIS LLM CONNECTION OK"
)

print()
print("Gemini response:")
print(response.text)

print()
print("=" * 60)
print("TEST COMPLETED")
print("=" * 60)
