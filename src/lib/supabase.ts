/**
 * AI POWERED SKILL MAPPER - MOCK LOCAL DATABASE PROXY CLIENT
 * Replaces @supabase/supabase-js completely to direct all queries to local PostgreSQL.
 */

class MockSupabaseClient {
  auth = {
    /**
     * Retrieve active user session locally
     */
    async getSession() {
      const guestJson = localStorage.getItem("skill_mapper_guest_user");
      if (guestJson) {
        try {
          const userObj = JSON.parse(guestJson);
          return { data: { session: { user: userObj } }, error: null };
        } catch {
          return { data: { session: null }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    },
    
    /**
     * Register authentication state listeners
     */
    onAuthStateChange(callback: (event: string, session: any) => void) {
      const handler = () => {
        const guestJson = localStorage.getItem("skill_mapper_guest_user");
        let session = null;
        if (guestJson) {
          try {
            session = { user: JSON.parse(guestJson) };
          } catch {
            session = null;
          }
        }
        callback("SIGNED_IN", session);
      };

      // Hook local event listeners
      window.addEventListener("skill_mapper_auth_change", handler);
      window.addEventListener("storage", handler);
      
      // Trigger initial evaluation
      setTimeout(handler, 0);
      
      return {
        data: {
          subscription: {
            unsubscribe() {
              window.removeEventListener("skill_mapper_auth_change", handler);
              window.removeEventListener("storage", handler);
            }
          }
        }
      };
    },
    
    /**
     * Terminate user session
     */
    async signOut() {
      localStorage.removeItem("skill_mapper_guest_user");
      localStorage.removeItem("skill_mapper_guest_user_profile");
      localStorage.removeItem("skill_mapper_guest_analysis_results");
      
      // Notify active listeners
      window.dispatchEvent(new Event("skill_mapper_auth_change"));
      return { error: null };
    }
  };

  /**
   * Fluent PostgreSQL DB Query Builder Proxy
   */
  from(table: string) {
    let currentEq: { column: string; value: any } | null = null;
    
    const queryBuilder = {
      eq: (column: string, value: any) => {
        currentEq = { column, value };
        return queryBuilder;
      },
      
      select: async (selectStr: string = "*") => {
        try {
          // Identify targeted user ID
          const userId = currentEq?.column === "user_id" || currentEq?.column === "id" 
            ? currentEq.value 
            : "guest-user";
            
          const url = `/api/db-proxy/select?table=${encodeURIComponent(table)}&userId=${encodeURIComponent(userId)}`;
          const res = await fetch(url);
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Database query failed.");
          }
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          console.error(`PostgreSQL select failed for public.${table}:`, err);
          return { data: null, error: err };
        }
      },
      
      upsert: async (payload: any) => {
        try {
          const res = await fetch("/api/db-proxy/upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table, payload })
          });
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Database upsert failed.");
          }
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          console.error(`PostgreSQL upsert failed for public.${table}:`, err);
          return { data: null, error: err };
        }
      },
      
      insert: async (payload: any) => {
        try {
          const res = await fetch("/api/db-proxy/insert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table, payload })
          });
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Database insert failed.");
          }
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          console.error(`PostgreSQL insert failed for public.${table}:`, err);
          return { data: null, error: err };
        }
      },
      
      delete: () => {
        return {
          eq: async (column: string, value: any) => {
            try {
              const res = await fetch("/api/db-proxy/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table, column, value })
              });
              if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Database delete failed.");
              }
              const data = await res.json();
              return { data, error: null };
            } catch (err: any) {
              console.error(`PostgreSQL delete failed for public.${table}:`, err);
              return { data: null, error: err };
            }
          }
        };
      }
    };
    
    return queryBuilder;
  }
}

// Export the mock client with original name to make it drop-in compatible
export const supabase = new MockSupabaseClient() as any;
