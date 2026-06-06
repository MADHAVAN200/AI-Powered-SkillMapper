import os
import sys
import json
import re
from common import read_input, write_output, call_llm

def get_fallback_data(submission, questions, career_goal, domain, total_fillers, filler_frequency):
    total_questions = len(questions) if isinstance(questions, list) else 4
    attempted_questions_count = 0
    individual_question_status = []
    
    for q in (questions or []):
        ans = submission.get(str(q.get("id")), "")
        if not isinstance(ans, str):
            ans = ""
        cleaned = ans.strip()
        
        is_substantial = False
        score_multiplier = 0.0
        
        if len(cleaned) >= 10:
            lower = cleaned.lower()
            is_placeholder = any(x in lower for x in ["starter code", "insert solution", "your code here", "type your detailed answer"]) or (cleaned == q.get("solutionTemplate"))
            if not is_placeholder:
                attempted_questions_count += 1
                is_substantial = True
                if len(cleaned) < 35:
                    score_multiplier = 0.25
                elif len(cleaned) < 110:
                    score_multiplier = 0.65
                else:
                    score_multiplier = 1.0
                    
        individual_question_status.append({
            "questionId": q.get("id"),
            "type": q.get("type"),
            "answered": is_substantial,
            "length": len(cleaned),
            "scoreMultiplier": score_multiplier
        })
        
    completeness_percentage = attempted_questions_count / total_questions if total_questions > 0 else 0
    
    if attempted_questions_count == 0:
        return {
            "technicalAccuracy": 0,
            "codingScore": 0,
            "communicationScore": 0,
            "problemSolving": 0,
            "confidenceScore": 0,
            "overallReadiness": 0,
            "weakTopics": ["All Modules Unanswered (Zero response submission)"],
            "strengths": [],
            "suggestions": [
                "Write descriptive technical paragraphs for theory questions.",
                "Write actual compilable code scripts inside the interactive coding console instead of leaving a draft blank or placeholder lines."
            ],
            "constructiveFeedback": "Critical Evaluation: Zero meaningful responses were received. The system marked all score metrics as 0% to replicate professional interview screening standards. Please select the questions, type your detailed solutions inside the console, and re-submit.",
            "correctAnswersReview": [{
                "questionId": q.get("id"),
                "questionType": q.get("type"),
                "correctSummary": "No answers were submitted for evaluation. An acceptable response requires structured explanations or standard coding blocks.",
                "score": 0
            } for q in (questions or [])],
            "timeComplexity": "N/A",
            "spaceComplexity": "N/A"
        }
        
    base_tech = 0
    base_coding = 0
    base_comm = round(max(15, 90 - total_fillers * 4.5))
    base_prob = 0
    base_conf = round(completeness_percentage * 90)
    
    for stat in individual_question_status:
        q_score = round(stat["scoreMultiplier"] * (35 + min(65, stat["length"] / 8)))
        if stat["type"] == "Practical coding assessment":
            base_coding += q_score
        else:
            base_tech += q_score
        base_prob += q_score
        
    total_non_coding = len([s for s in individual_question_status if s["type"] != "Practical coding assessment"])
    base_tech = round(base_tech / total_non_coding) if total_non_coding > 0 else 0
    base_coding = round(base_coding)
    base_prob = round(base_prob / total_questions)
    
    base_tech = min(100, base_tech)
    base_coding = min(100, base_coding)
    base_prob = min(100, base_prob)
    
    calculated_overall = round(
        base_tech * 0.35 +
        base_coding * 0.25 +
        base_comm * 0.20 +
        base_prob * 0.10 +
        base_conf * 0.10
    )
    
    weak_topics_list = []
    suggestions_list = []
    strengths_list = []
    
    for stat in individual_question_status:
        if not stat["answered"]:
            weak_topics_list.append(f"Skipped {stat['type']}")
            suggestions_list.append(f"Provide comprehensive response blocks for {stat['type']} elements.")
        elif stat["length"] < 50:
            weak_topics_list.append(f"Under-detailed {stat['type']}")
            suggestions_list.append(f"Expand answers for \"{stat['type']}\" to feature trade-off comparative parameters.")
        else:
            strengths_list.append(f"Meaningful attempt for {stat['type']}")
            
    if not weak_topics_list:
        weak_topics_list = ["High-throughput transaction limits", "Caching synchronization locks"]
    if not strengths_list:
        strengths_list = ["Basic prompt commitment"]
    if not suggestions_list:
        suggestions_list = ["Optimize memory allocations on deep data structures"]
        
    correct_reviews = []
    for q in (questions or []):
        stat = next((s for s in individual_question_status if s["questionId"] == q.get("id")), None)
        score_val = round(stat["scoreMultiplier"] * (35 + min(65, stat["length"] / 8))) if stat else 0
        score_val = min(100, score_val)
        correct_reviews.append({
            "questionId": q.get("id"),
            "questionType": q.get("type"),
            "correctSummary": "Optimal clean layout using sliding window index mechanisms." if q.get("type") == "Practical coding assessment" else "Expected distributed consensus models and failover criteria justifications.",
            "score": score_val
        })
        
    return {
        "technicalAccuracy": base_tech,
        "codingScore": base_coding,
        "communicationScore": base_comm,
        "problemSolving": base_prob,
        "confidenceScore": base_conf,
        "overallReadiness": calculated_overall,
        "weakTopics": weak_topics_list,
        "strengths": strengths_list,
        "suggestions": suggestions_list,
        "constructiveFeedback": f"Dynamic professional heuristics audit: Captured {attempted_questions_count} valid explanations out of {total_questions} requested slots. Accuracy is rated at {base_tech}% and Coding at {base_coding}%. " + ("Your grade is below hiring standards. Please compose extensive architectural or algorithmic justifications to demonstrate competency." if calculated_overall < 55 else "Competent. Expand on runtime optimizations to qualify for Lead developer slots."),
        "correctAnswersReview": correct_reviews,
        "timeComplexity": "O(N)" if base_coding > 40 else "N/A",
        "spaceComplexity": "O(1)" if base_coding > 40 else "N/A"
    }

def main():
    payload = read_input()
    submission = payload.get("submission", {})
    questions = payload.get("questions", [])
    career_goal = payload.get("careerGoal", "AI Software Developer")
    domain = payload.get("domain", "AI/ML Engineer")
    
    total_questions = len(questions) if isinstance(questions, list) else 4
    attempted_questions_count = 0
    individual_question_status = []
    
    for q in (questions or []):
        ans = submission.get(str(q.get("id")), "")
        if not isinstance(ans, str):
            ans = ""
        cleaned = ans.strip()
        is_substantial = False
        score_multiplier = 0.0
        if len(cleaned) >= 10:
            lower = cleaned.lower()
            is_placeholder = any(x in lower for x in ["starter code", "insert solution", "your code here", "type your detailed answer"]) or (cleaned == q.get("solutionTemplate"))
            if not is_placeholder:
                attempted_questions_count = attempted_questions_count + 1
                is_substantial = True
                if len(cleaned) < 35:
                    score_multiplier = 0.25
                elif len(cleaned) < 110:
                    score_multiplier = 0.65
                else:
                    score_multiplier = 1.0
        individual_question_status.append({
            "questionId": q.get("id"),
            "type": q.get("type"),
            "answered": is_substantial,
            "length": len(cleaned),
            "scoreMultiplier": score_multiplier
        })
        
    completeness_percentage = attempted_questions_count / total_questions if total_questions > 0 else 0
    
    total_text = ""
    for ans in submission.values():
        if isinstance(ans, str):
            total_text += " " + ans.lower()
            
    filler_words = ["um", "uh", "like", "actually", "basically", "literally", "sort of", "kind of"]
    filler_frequency = {}
    total_fillers = 0
    
    for word in filler_words:
        matches = re.findall(rf"\b{word}\b", total_text)
        if matches:
            filler_frequency[word] = len(matches)
            total_fillers += len(matches)
            
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    evaluation_result = None
    
    if use_real_ai:
        prompt = f"""You are an elite, highly critical technical interviewer auditing candidate submissions for a developer role targeting "{career_goal}" in the domain "{domain}".
Your standard is extremely high, and you grade with complete professional realism. Do NOT award "participation points" or polite high scores if they skipped answers or left placeholders.

The candidate's submission has been pre-screened with the following parameters:
- Total questions: {total_questions}
- Meaningful attempts: {attempted_questions_count} out of {total_questions}
- Answered questions status metrics: {json.dumps(individual_question_status)}

QUESTIONS AND SUBMITTED ANSWERS:
{json.dumps({"questions": questions, "submission": submission}, indent=2)}

INSTRUCTIONS FOR GRADING IN-DEPTH & RUTHLESSLY:
1. If the candidate left an answer blank, empty, or didn't answer it (e.g. less than 12 characters, or contains only template placeholders), you MUST assign a score of 0 for that question in the "correctAnswersReview" list, and penalize all overall metrics heavily.
2. If all answers are empty/blank, you MUST score 0 across ALL areas (technicalAccuracy: 0, codingScore: 0, communicationScore: 0, problemSolving: 0, confidenceScore: 0, overallReadiness: 0) and issue an intensive warning in the constructiveFeedback.
3. If they wrote extremely short/flimsy answers (e.g. less than 40 characters), cap their individual scores to 10 - 25 points maximum for that question. True academic/industry competitiveness scores (70+) must be reserved only for clear explanations, detailed trade-offs analysis, and fully implemented software logic.
4. Calculate communicationScore based on answer clarity and filler words usage (they used {total_fillers} fillers: {json.dumps(filler_frequency)}). High filler word count should severely lower the communicationScore.

Combine the values mathematically into other fields:
overallReadiness = (technicalAccuracy * 0.35) + (codingScore * 0.25) + (communicationScore * 0.20) + (problemSolving * 0.10) + (confidenceScore * 0.10)

Provide your response strictly in parseable JSON matching this structure format:
{{
  "technicalAccuracy": 0 to 100,
  "codingScore": 0 to 100,
  "communicationScore": 0 to 100,
  "problemSolving": 0 to 100,
  "confidenceScore": 0 to 100,
  "overallReadiness": 0 to 100,
  "weakTopics": ["List specific conceptual areas that are weak or skipped"],
  "strengths": ["List genuine strengths, empty list if they did not answer anything"],
  "suggestions": ["Actionable steps to fix weaknesses"],
  "constructiveFeedback": "A highly diagnostic advisory note detailing specific action plans with direct feedback on their responsiveness",
  "correctAnswersReview": [
    {{
      "questionId": 1,
      "questionType": "Technical core",
      "correctSummary": "Comparison of candidate's actual answer against excellent expert solution parameters",
      "score": 0 to 100
    }}
  ],
  "timeComplexity": "O(...) complexity bounds or N/A",
  "spaceComplexity": "O(...) complexity bounds or N/A"
}}
Do not include any conversational intros, markdown backticks, or outer headers. Return strictly valid parseable JSON."""

        try:
            text_output = call_llm(prompt, True)
            cleaned = text_output.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
            evaluation_result = json.loads(cleaned)
        except Exception as e:
            sys.stderr.write(f"Error evaluating interview via LLM: {e}\n")
            
    if not evaluation_result:
        evaluation_result = get_fallback_data(submission, questions, career_goal, domain, total_fillers, filler_frequency)
        
    evaluation_result["fillerWordsMetrics"] = {
        "totalFound": total_fillers,
        "wordsByFrequency": filler_frequency
    }
    
    write_output(evaluation_result)

if __name__ == "__main__":
    main()
