import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(roadmap, new_trigger, trigger_type):
    updated = list(roadmap)
    if updated:
        # Appending new hot topics to their last phase to indicate adaptivity!
        target_phase = dict(updated[-1])
        topics = list(target_phase.get("topics", []))
        topics.extend([
            {"name": "Generative AI Systems, RAG & Vector DBs Integration", "difficulty": "Medium", "estimatedTime": "1 week", "description": "Learn to connect external document vectors to prompt generation contexts."},
            {"name": "Live System Performance Testing & DSA Practice", "difficulty": "Medium", "estimatedTime": "3 days", "description": "Execute load tests, check latency limits, and solve sliding-window array tasks."}
        ])
        target_phase["topics"] = topics
        updated[-1] = target_phase
    return {"updatedRoadmap": updated}

def main():
    payload = read_input()
    roadmap = payload.get("currentRoadmap", [])
    new_trigger = payload.get("newTrigger", "Generative AI demand surges with Vector Databases")
    trigger_type = payload.get("type", "market_trends")
    if not isinstance(roadmap, list):
        roadmap = []
        
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(roadmap, new_trigger, trigger_type))
        
    prompt = f"""You are a curriculum personalization planner. Adjust the current roadmap to integrate a newly requested skill/gap trigger.
CURRENT ROADMAP STRUCTURE: {json.dumps(roadmap)}
TRIGGER FACTOR: "{new_trigger}" (Type: "{trigger_type}")

Inject appropriate specific topics, courses, or capstones under the respective phases of the roadmap so that the developer is fully prepared to address the trigger factor.
Return the updated structure in EXACTLY the same array structure:
{{
  "updatedRoadmap": [
     // Same phase structure with appropriate topics/courses updated or added
  ]
}}
Return only JSON. No other text."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        parsed = json.loads(cleaned)
        write_output({"updatedRoadmap": parsed.get("updatedRoadmap", parsed.get("roadmap", roadmap))})
    except Exception as e:
        sys.stderr.write(f"Error updating adaptive roadmap: {e}\n")
        write_output(get_fallback_data(roadmap, new_trigger, trigger_type))

if __name__ == "__main__":
    main()
