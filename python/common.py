import sys
import os
import json
import requests

def read_input():
    try:
        content = sys.stdin.read().strip()
        if not content:
            return {}
        return json.loads(content)
    except Exception as e:
        sys.stderr.write(f"Failed to read input JSON: {e}\n")
        sys.exit(1)

def write_output(data):
    print(json.dumps(data))
    sys.exit(0)

def call_llm(prompt: str, json_mode: bool = True) -> str:
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                sys.stderr.write(f"Groq API returned error status {response.status_code}: {response.text}\n")
        except Exception as e:
            sys.stderr.write(f"Groq API call failed, attempting fallback to Gemini...: {e}\n")
    
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        if json_mode:
            payload["generationConfig"] = {"responseMimeType": "application/json"}
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code == 200:
                return response.json()["candidates"][0]["content"]["parts"][0]["text"]
            else:
                sys.stderr.write(f"Gemini API returned error status {response.status_code}: {response.text}\n")
        except Exception as e:
            sys.stderr.write(f"Gemini API call failed: {e}\n")
            raise e
    
    raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY environment variables are configured.")
