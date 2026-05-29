import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ProfileMappingResults } from "../types";
import { 
  Lock, Mail, User, ArrowRight, AlertCircle, RefreshCw, CheckCircle, Cpu, UserPlus, LogIn, Sparkles, Cloud, LogOut, ShieldCheck, Database
} from "lucide-react";

interface OnboardingProfile {
  name: string;
  degree: string;
  experienceLevel: string;
  careerGoal: string;
  knownSkills: string[];
  resumeText: string;
}

interface SupabaseAuthViewProps {
  isDarkMode: boolean;
  userProfile: OnboardingProfile | null;
  results: ProfileMappingResults | null;
  onUpdateSession: (profile: OnboardingProfile, results: ProfileMappingResults) => void;
  onLoginAsGuest?: (username: string) => void;
  onLogoutGuest?: () => void;
  onNewUser?: () => void;
  noWrapper?: boolean;
  onLoginSuccess?: (user: any) => void;
}

export default function SupabaseAuthView({ 
  isDarkMode, 
  userProfile, 
  results, 
  onUpdateSession, 
  onLoginAsGuest, 
  onLogoutGuest, 
  onNewUser, 
  noWrapper = false,
  onLoginSuccess
}: SupabaseAuthViewProps) {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    // Seed local database users
    let localUsers: any[] = [];
    const saved = localStorage.getItem("skill_mapper_local_users");
    if (saved) {
      try { localUsers = JSON.parse(saved); } catch { localUsers = []; }
    }
    
    const demoUsers = [
      { id: "local-admin", username: "admin", email: "admin@skillmapper.local", password: "password123", name: "Portfolio Admin" },
      { id: "user-ai-001", username: "arjun", email: "arjun@skillmapper.local", password: "AIEngineer@123", name: "Arjun Sharma" },
      { id: "user-backend-002", username: "priya", email: "priya@skillmapper.local", password: "BackendDev@123", name: "Priya Menon" },
      { id: "user-cloud-003", username: "rohan", email: "rohan@skillmapper.local", password: "CloudEngineer@123", name: "Rohan Verma" }
    ];

    let updated = false;
    demoUsers.forEach(demo => {
      const exists = localUsers.some(u => u.username.toLowerCase() === demo.username.toLowerCase());
      if (!exists) {
        localUsers.push(demo);
        updated = true;
      }
    });

    if (updated || !saved) {
      localStorage.setItem("skill_mapper_local_users", JSON.stringify(localUsers));
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const guestJson = localStorage.getItem("skill_mapper_guest_user");
        if (guestJson) {
          setUser(JSON.parse(guestJson));
        } else {
          setUser(null);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const guestJson = localStorage.getItem("skill_mapper_guest_user");
        if (guestJson) {
          setUser(JSON.parse(guestJson));
        } else {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLocalGuestSignIn = () => {
    clearMessages();
    const guestUser = {
      id: "guest-user",
      email: "guest@skillmapper.local",
      guest: true,
      raw_user_meta_data: { name: username.trim() || "Guest Candidate" }
    };
    localStorage.setItem("skill_mapper_guest_user", JSON.stringify(guestUser));
    setUser(guestUser);
    window.dispatchEvent(new Event("skill_mapper_auth_change"));
    if (onLoginSuccess) {
      onLoginSuccess(guestUser);
    }
    if (onLoginAsGuest) {
      onLoginAsGuest(username.trim() || "Guest Candidate");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setAuthLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanUsernameLower = cleanUsername.toLowerCase();
      if (!cleanUsername || !password) {
        throw new Error("Please fill in both username and password.");
      }

      if (cleanUsername.length < 3) {
        throw new Error("Username must be at least 3 characters long.");
      }

      // Initialize local users from localStorage or default
      let localUsers: any[] = [];
      const savedUsersJson = localStorage.getItem("skill_mapper_local_users");
      if (savedUsersJson) {
        try {
          localUsers = JSON.parse(savedUsersJson);
        } catch (e) {
          localUsers = [];
        }
      }

      // Add default admin user if not present
      const adminExists = localUsers.some((u: any) => u.username.toLowerCase() === "admin");
      if (!adminExists) {
        localUsers.push({
          username: "admin",
          password: "password123",
          name: "Portfolio Admin"
        });
        localStorage.setItem("skill_mapper_local_users", JSON.stringify(localUsers));
      }

      if (authMode === "register") {
        const userExists = localUsers.some((u: any) => u.username.toLowerCase() === cleanUsernameLower || u.email?.toLowerCase() === cleanUsernameLower);
        if (userExists) {
          throw new Error("Username or email already registered locally. Please sign in instead!");
        }

        const newLocalUser = {
          username: cleanUsernameLower,
          password: password,
          name: cleanUsername
        };
        localUsers.push(newLocalUser);
        localStorage.setItem("skill_mapper_local_users", JSON.stringify(localUsers));

        // Sign user in automatically
        const guestUser = {
          id: `local-${cleanUsernameLower}`,
          email: `${cleanUsernameLower}@skillmapper.local`,
          is_local: true,
          guest: false,
          raw_user_meta_data: { name: cleanUsername }
        };
        localStorage.setItem("skill_mapper_guest_user", JSON.stringify(guestUser));
        setUser(guestUser);
        window.dispatchEvent(new Event("skill_mapper_auth_change"));
        if (onLoginSuccess) {
          onLoginSuccess(guestUser);
        }
        if (onLoginAsGuest) {
          onLoginAsGuest(cleanUsername);
        }
        setSuccessMsg(`Local sandbox profile "${cleanUsername}" successfully created!`);
      } else {
        // Find user by username or email
        const found = localUsers.find((u: any) => 
          (u.username.toLowerCase() === cleanUsernameLower || u.email?.toLowerCase() === cleanUsernameLower) && 
          u.password === password
        );

        if (!found) {
          // If they tried credentials that don't match, let's offer default admin credentials
          if (cleanUsernameLower === "admin" && password === "password123") {
            const guestUser = {
              id: "local-admin",
              email: "admin@skillmapper.local",
              is_local: false,
              guest: false,
              raw_user_meta_data: { name: "Portfolio Admin" }
            };
            localStorage.setItem("skill_mapper_guest_user", JSON.stringify(guestUser));
            setUser(guestUser);
            window.dispatchEvent(new Event("skill_mapper_auth_change"));
            if (onLoginSuccess) {
              onLoginSuccess(guestUser);
            }
            if (onLoginAsGuest) {
              onLoginAsGuest("Portfolio Admin");
            }
            setSuccessMsg("Successfully signed into default Admin Showcase account!");
            return;
          }
          throw new Error("Invalid username or password. (Hint: Try demo credentials like arjun / AIEngineer@123)");
        }

        const displayName = found.name || cleanUsername;
        const isDbUser = found.id && (found.id.startsWith("user-") || found.id === "local-admin");

        const guestUser = {
          id: found.id || `local-${cleanUsernameLower}`,
          email: found.email || `${cleanUsernameLower}@skillmapper.local`,
          is_local: !isDbUser,
          guest: false,
          raw_user_meta_data: { name: displayName }
        };
        localStorage.setItem("skill_mapper_guest_user", JSON.stringify(guestUser));
        setUser(guestUser);
        window.dispatchEvent(new Event("skill_mapper_auth_change"));
        if (onLoginSuccess) {
          onLoginSuccess(guestUser);
        }
        if (onLoginAsGuest) {
          onLoginAsGuest(displayName);
        }
        setSuccessMsg(`Successfully signed into profile "${displayName}"!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credential authentication failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    clearMessages();
    setAuthLoading(true);
    try {
      localStorage.removeItem("skill_mapper_guest_user");
      localStorage.removeItem("skill_mapper_guest_user_profile");
      localStorage.removeItem("skill_mapper_guest_analysis_results");
      setUser(null);
      if (onLogoutGuest) {
        onLogoutGuest();
      }
      await supabase.auth.signOut();
      setSuccessMsg("Successfully signed out.");
    } catch (err: any) {
      if (user?.id === "guest-user" || user?.guest) {
        setSuccessMsg("Successfully signed out.");
      } else {
        setErrorMsg(err.message || "Failed to sign out.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    clearMessages();
    setSyncLoading(true);

    try {
      if (user.id === "guest-user" || user.guest) {
        if (userProfile) {
          localStorage.setItem("skill_mapper_guest_user_profile", JSON.stringify(userProfile));
        }
        if (results) {
          localStorage.setItem("skill_mapper_guest_analysis_results", JSON.stringify(results));
        }
        setSuccessMsg("All profile configurations and analysis successfully stored in local memory! (Bypassed Cloud Database)");
        return;
      }
      if (!userProfile || !results) {
        throw new Error("No active profile metrics to save. Please make sure to complete your profile onboarding and analysis first.");
      }

      // 1. Sync User Profile
      const { error: profileErr } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          name: userProfile.name,
          degree: userProfile.degree,
          experience_level: userProfile.experienceLevel,
          career_goal: userProfile.careerGoal,
          known_skills: userProfile.knownSkills,
          updated_at: new Date().toISOString()
        });

      if (profileErr) throw profileErr;

      // 2. Clear out older results and insert latest mapping output
      const { error: deleteErr } = await supabase
        .from("mapping_results")
        .delete()
        .eq("user_id", user.id);

      if (deleteErr) console.warn("Supabase cleaning warning:", deleteErr);

      const { error: resultsErr } = await supabase
        .from("mapping_results")
        .insert({
          user_id: user.id,
          skills: results.skills,
          skill_gaps: results.skillGaps,
          career_paths: results.careerPaths,
          resume_analysis: results.resumeAnalysis,
          learning_roadmap: results.learningRoadmap
        });

      if (resultsErr) throw resultsErr;

      setSuccessMsg("All profile configurations and analysis successfully synchronized with Supabase secure storage!");
    } catch (err: any) {
      setErrorMsg(err.message || "Cloud sync failed. Verify database connectivity or ensure schema configuration completes correctly.");
    } finally {
      setSyncLoading(false);
    }
  };

  const cardContent = (
    <div className={`relative transition-all duration-300 ${
      noWrapper 
        ? "p-6 text-left" 
        : `p-8 rounded-2xl border backdrop-blur-xl shadow-2xl ${
            isDarkMode 
              ? "bg-[#161B22]/80 border-slate-800 shadow-purple-950/5 text-[#C9D1D9]" 
              : "bg-white border-slate-200/90 shadow-slate-250/20 text-slate-800"
          }`
    }`}>
      
      {/* Glow accent */}
      {!noWrapper && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
      )}

      {/* Brand / Title Icon */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="p-3 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-indigo-500/10">
          {user ? <ShieldCheck className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
        </div>
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {user ? "Account Authenticated" : (authMode === "login" ? "Welcome Back" : "Create Account")}
          </h2>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
            {user 
              ? "Manage your synchronized session with Supabase Secure Hub"
              : (authMode === "login" 
                  ? "Enter your unique username and password to access your dynamic profile map" 
                  : "Establish a simple username and password to save your profile online")}
          </p>
        </div>
      </div>

      {/* Notices/Banners */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-950/20 border border-red-900/30 text-red-500 text-xs rounded-xl flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          {(errorMsg.toLowerCase().includes("rate limit") || errorMsg.toLowerCase().includes("exceeded")) && (
            <div className="mt-1 p-2 bg-indigo-950/40 rounded-lg border border-indigo-900/30 flex flex-col gap-2 text-left">
              <p className="text-[10px] text-slate-350 leading-relaxed font-sans">
                Supabase limits signup requests per hour on standard projects to prevent abuse. Avoid this constraint entirely by loading a high-speed local session with the same exact core analytical capabilities.
              </p>
              <button
                type="button"
                onClick={handleLocalGuestSignIn}
                className="w-full py-1.5 px-3 bg-gradient-to-r from-cyan-600 to-indigo-650 hover:brightness-110 text-[10px] font-bold text-white rounded-lg transition-all text-center cursor-pointer"
              >
                🚀 Bypass Rate Limit & Continue as Local Guest
              </button>
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded-xl flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {user ? (
        /* LOGGED IN VIEW */
        <div className="space-y-6">
          <div className={`p-4 rounded-xl border flex flex-col gap-1.5 text-left ${
            isDarkMode ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-150"
          }`}>
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6366f1] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1" />
              ACTIVE PROFILE
            </div>
            <div className="flex flex-col gap-0.5 mt-2">
              <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-905"}`}>
                {user.id === "guest-user" || user.guest
                  ? (user.raw_user_meta_data?.name || "Guest")
                  : user.email?.endsWith("@skillmapper.local")
                    ? user.email.split("@")[0].toUpperCase()
                    : user.user_metadata?.name || user.email || "Active Sync User"}
              </span>
              <span className="text-[10px] font-mono text-gray-405 dark:text-gray-500 uppercase tracking-widest">
                {user.id === "guest-user" || user.guest ? "Local Guest Session" : "Signed In Account"}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleManualSync}
              disabled={syncLoading || !userProfile}
              className="w-full flex justify-center items-center gap-2 px-5 py-3 bg-[#6366f1] hover:bg-[#5356e0] rounded-xl text-xs font-bold text-white shadow-lg active:scale-98 transition-all disabled:opacity-40 cursor-pointer"
            >
              {syncLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>Backup Real-Time Profile Data</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              disabled={authLoading}
              className={`w-full flex justify-center items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                isDarkMode 
                  ? "bg-slate-950 border-slate-805 text-gray-300 hover:bg-slate-900 hover:text-white" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-905"
              }`}
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* LOGGED OUT FORM */
        <form onSubmit={handleAuth} className="space-y-4">
          {/* Username block */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono font-extrabold text-slate-400/90 dark:text-gray-400 uppercase tracking-widest block">
              USERNAME / ALIAS
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? "bg-slate-950 border-slate-850 text-white focus:border-indigo-500 focus:ring-indigo-500" 
                    : "bg-slate-50/70 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                placeholder="e.g. madhavan"
              />
            </div>
          </div>

          {/* Password block */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono font-extrabold text-slate-400/90 dark:text-gray-400 uppercase tracking-widest block">
              SECURE PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? "bg-slate-950 border-slate-850 text-white focus:border-indigo-500 focus:ring-indigo-500" 
                    : "bg-slate-50/70 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full mt-2 flex justify-center items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl text-xs font-bold text-white shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {authLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : authMode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In Securely</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Sync Profile</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Toggle Panel Mode */}
      {!user && (
        <div className="mt-6 border-t border-dashed border-slate-205 dark:border-slate-800 text-center">
          {onNewUser && (
            <div className="pt-6 pb-2">
              <button
                type="button"
                onClick={onNewUser}
                className="w-full flex justify-center items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl text-xs font-bold text-white shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>New User? Create Profile & Skill Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* Removed local credentials registration and guest sign in bypass */}
        </div>
      )}
    </div>
  );

  if (noWrapper) {
    return cardContent;
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-8">
      {cardContent}
    </div>
  );
}
