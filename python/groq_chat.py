import os
import sys
import json
import requests
from common import read_input, write_output, call_llm

def get_fallback_data():
    return {
        "reply": "John Doe\nSenior Systems Architect\n\nSUMMARY:\nResult-oriented Solutions Architect driving scale and cloud computing efficiency.\n\nSKILLS:\nReact, Node.js, Python, PostgreSQL, AWS Cloud Suite, Docker, Kubernetes Systems\n\nEXPERIENCE:\n- Engineered high-throughput client dashboard layouts, improving initial paint times by 42%.\n- Streamlined asynchronous data pipelines on PostgreSQL, growing query speeds by 3.5x.\n- Directed migration of centralized services onto AWS EKS cluster ecosystems, trimming cloud spend indexes by 20%.",
        "warning": "Demo Mode active. No API keys found. Enter a custom Groq API Key or set GROQ_API_KEY to activate lived edits."
    }

def main():
    payload = read_input()
    prompt = payload.get("prompt", "")
    model = payload.get("model", "llama-3.3-70b-versatile")
    api_key = payload.get("apiKey")
    system_prompt = payload.get("systemPrompt")
    
    groq_key = api_key or os.environ.get("GROQ_API_KEY")
    if groq_key:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload_data = {
            "model": model,
            "messages": messages,
            "temperature": 0.3
        }
        try:
            response = requests.post(url, json=payload_data, headers=headers, timeout=30)
            if response.status_code == 200:
                write_output({"reply": response.json()["choices"][0]["message"]["content"]})
            else:
                sys.stderr.write(f"Groq API error: {response.text}\n")
        except Exception as e:
            sys.stderr.write(f"Groq API connection error: {e}\n")
            
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        full_prompt = f"{system_prompt}\n\nUser request: {prompt}" if system_prompt else prompt
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload_data = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {"temperature": 0.3}
        }
        try:
            response = requests.post(url, json=payload_data, headers=headers, timeout=30)
            if response.status_code == 200:
                write_output({
                    "reply": response.json()["candidates"][0]["content"]["parts"][0]["text"],
                    "warning": "Using Gemini backup. Connect your Groq API Key in Settings or the Copilot tab for native Groq optimization!"
                })
        except Exception as e:
            sys.stderr.write(f"Gemini API connection error: {e}\n")
            
    write_output(get_fallback_data())

if __name__ == "__main__":
    main()
