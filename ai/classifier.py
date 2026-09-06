import os
import json
from dotenv import load_dotenv
from google import genai

# Load the API key from .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: Gemini API key not found.")
    exit()

client = genai.Client(api_key=api_key)


def classify_emergency(message):

    prompt = f"""
You are the emergency classification system for an application called Sahaaya.

Classify the user's emergency description.

Choose exactly ONE category:
medical, fire, accident, security, electrical, other

Choose exactly ONE severity:
low, medium, high, critical

Choose exactly ONE required_skill:
first_aid, medical, fire_response, security, electrician, general_help

Emergency description:
{message}

Return ONLY valid JSON.

Use exactly this format:

{{
    "category": "...",
    "severity": "...",
    "required_skill": "..."
}}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    text = response.text.strip()

    # Remove ```json if Gemini adds it
    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    try:
        return json.loads(text)

    except json.JSONDecodeError:
        print("AI returned invalid JSON:")
        print(text)
        return None


if __name__ == "__main__":

    message = input("Describe the emergency: ")

    result = classify_emergency(message)

    print("\nSahaaya AI Result:")

    if result:
        print(json.dumps(result, indent=4))