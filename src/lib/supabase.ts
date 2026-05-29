/**
 * AI POWERED SKILL MAPPER - MOCK LOCAL DATABASE PROXY CLIENT
 * Replaces @supabase/supabase-js completely to direct all queries to local PostgreSQL.
 */

class SupabaseQueryBuilder {
  private table: string;
  private currentEq: { column: string; value: any } | null = null;
  private currentOrder: { column: string; ascending: boolean } | null = null;
  private currentLimit: number | null = null;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(selectStr: string = "*") {
    return this;
  }

  eq(column: string, value: any) {
    this.currentEq = { column, value };
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    this.currentOrder = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(value: number) {
    this.currentLimit = value;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // A awaitable/thenable function to execute the query
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      // Identify targeted user ID
      const userId = this.currentEq?.column === "user_id" || this.currentEq?.column === "id"
        ? this.currentEq.value
        : "guest-user";

      const url = `/api/db-proxy/select?table=${encodeURIComponent(this.table)}&userId=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Database query failed.");
      }
      let data = await res.json();

      if (this.currentOrder) {
        const col = this.currentOrder.column;
        const asc = this.currentOrder.ascending;
        data.sort((a: any, b: any) => {
          if (a[col] < b[col]) return asc ? -1 : 1;
          if (a[col] > b[col]) return asc ? 1 : -1;
          return 0;
        });
      }

      if (this.currentLimit !== null) {
        data = data.slice(0, this.currentLimit);
      }

      if (this.isSingle) {
        data = data.length > 0 ? data[0] : null;
      }

      const result = { data, error: null };
      return onfulfilled ? onfulfilled(result) : result;
    } catch (err: any) {
      console.error(`PostgreSQL select failed for public.${this.table}:`, err);
      const result = { data: null, error: err };
      return onfulfilled ? onfulfilled(result) : result;
    }
  }

  async upsert(payload: any) {
    try {
      const res = await fetch("/api/db-proxy/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: this.table, payload })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Database upsert failed.");
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      console.error(`PostgreSQL upsert failed for public.${this.table}:`, err);
      return { data: null, error: err };
    }
  }

  async insert(payload: any) {
    try {
      const res = await fetch("/api/db-proxy/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: this.table, payload })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Database insert failed.");
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      console.error(`PostgreSQL insert failed for public.${this.table}:`, err);
      return { data: null, error: err };
    }
  }

  delete() {
    return {
      eq: async (column: string, value: any) => {
        try {
          const res = await fetch("/api/db-proxy/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table: this.table, column, value })
          });
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Database delete failed.");
          }
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          console.error(`PostgreSQL delete failed for public.${this.table}:`, err);
          return { data: null, error: err };
        }
      }
    };
  }
}

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
    return new SupabaseQueryBuilder(table);
  }
}

// Export the mock client with original name to make it drop-in compatible
export const supabase = new MockSupabaseClient() as any;
