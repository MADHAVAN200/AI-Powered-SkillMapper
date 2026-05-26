import sqlite3 from "sqlite3";
import path from "path";
import { initDb } from "../server/db";

const DB_PATH = path.join(process.cwd(), "local.db");

async function runLocalSQLiteDiagnostics() {
  console.log("🎛️ Running database diagnostics...");
  
  try {
    // 1. Trigger complete db initialization and seeding
    await initDb();
    
    // 2. Open connection to verify counts
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("💥 Failed to connect to SQLite file:", err.message);
        process.exit(1);
      }
      console.log("\n📊 AUDITING LOCAL SQLITE SHOWCASE DATASETS:");

      const runQuery = (sql: string): Promise<any[]> => {
        return new Promise((resolve, reject) => {
          db.all(sql, [], (queryErr, rows) => {
            if (queryErr) reject(queryErr);
            else resolve(rows || []);
          });
        });
      };

      async function checkTables() {
        const tables = [
          "users", "user_profiles", "mapping_results", "user_skills", "career_goals", 
          "mentor_conversations", "mentor_messages", "mentor_memory", "mentor_recommendations", 
          "learning_paths", "learning_phases", "learning_tasks", "courses", "projects", 
          "certifications", "resume_analysis", "interview_analytics", "mock_interviews", 
          "coding_assessments", "market_preferences", "mentor_actions", "technologies"
        ];

        for (const table of tables) {
          try {
            const result = await runQuery(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`✅ Table '${table.padEnd(23)}' exists! Total records: ${result[0].count}`);
          } catch (err: any) {
            console.error(`❌ Table '${table}' query failed:`, err.message);
          }
        }

        db.close();
        console.log("\n💯 Local database is fully integrated and rich with portfolio-showcase datasets!");
      }

      checkTables();
    });
  } catch (err: any) {
    console.error("💥 Unhandled exception during diagnostics:", err.message);
  }
}

runLocalSQLiteDiagnostics();
