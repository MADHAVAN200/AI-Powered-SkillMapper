import os
import sys
import json
import base64
import requests

def main():
    payload = read_input()
    file_base64 = payload.get("fileBase64")
    file_name = payload.get("fileName")
    file_type = payload.get("fileType", "")
    
    if not file_base64 or not file_name:
        write_output({"error": "Missing fileBase64 or fileName."})
        
    use_real_ai = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY"))
    
    # 1. Plain text handling
    if file_type == "text/plain" or file_name.lower().endswith(".txt"):
        try:
            decoded = base64.b64decode(file_base64).decode("utf-8")
            write_output({"extractedText": decoded.strip()})
        except Exception as e:
            sys.stderr.write(f"Txt decode failure: {e}\n")
            write_output({"extractedText": "", "error": str(e)})
            
    if not use_real_ai:
        write_output({
            "extractedText": "",
            "warning": "AI API key not configured. Please paste your resume text manually in the text area below."
        })
        
    gemini_key = os.environ.get("GEMINI_API_KEY")
    
    # 2. PDF multimodal handling
    if gemini_key and (file_type == "application/pdf" or file_name.lower().endswith(".pdf")):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        prompt_text = """Extract ALL text content from this resume PDF exactly as written. 
Include: name, contact info, education, work experience (company names, roles, dates, bullet points), skills, projects, certifications, and any other sections.
Do NOT summarize or paraphrase - extract the full verbatim text.
Return only the extracted text, no JSON wrapping, no markdown."""
        
        payload_data = {
            "contents": [{
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": "application/pdf",
                            "data": file_base64
                        }
                    },
                    {
                        "text": prompt_text
                    }
                ]
            }]
        }
        
        try:
            response = requests.post(url, json=payload_data, headers=headers, timeout=45)
            if response.status_code == 200:
                extracted_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                write_output({"extractedText": extracted_text.strip()})
            else:
                sys.stderr.write(f"Gemini PDF extraction error: {response.text}\n")
        except Exception as e:
            sys.stderr.write(f"Gemini PDF extraction request failure: {e}\n")
            
    # 3. DOCX / fallback handler (regular text decode & LLM cleaning)
    raw_content = ""
    try:
        raw_content = base64.b64decode(file_base64).decode("utf-8", errors="ignore")
    except Exception as e:
        raw_content = "[Binary file - could not decode as text]"
        
    prompt = f"""The following is raw file content extracted from a resume document ({file_name}).
Clean and extract all meaningful resume text from it. 
Include: candidate name, contact details, education, work experience, skills, projects, and certifications.
If the content appears corrupted or binary, return an empty string.
Return ONLY the clean extracted resume text with no JSON, no markdown formatting.

RAW CONTENT:
{raw_content[:8000]}"""

    # We use common call_llm wrapper
    from common import call_llm
    try:
        extracted = call_llm(prompt, False)
        write_output({"extractedText": extracted.strip()})
    except Exception as e:
        sys.stderr.write(f"LLM resume parsing failure: {e}\n")
        write_output({"extractedText": "", "error": str(e)})

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

if __name__ == "__main__":
    main()
