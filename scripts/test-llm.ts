import dotenv from "dotenv";

dotenv.config();

const groqKey = process.env.GROQ_API_KEY;

if (!groqKey) {
  console.error("❌ GROQ_API_KEY is not set in the environment!");
  process.exit(1);
}

async function testLlm() {
  console.log("🚀 Testing Groq LLM API call...");
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Who are you? Keep it to 1 sentence."
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (status ${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    console.log("✅ Groq Response Success!");
    console.log("💬 Reply:", data.choices[0].message.content);
  } catch (err: any) {
    console.error("💥 Error testing Groq:", err.message || err);
  }
}

testLlm();
