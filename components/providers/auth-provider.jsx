"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildAuthRedirectUrl } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getVisualPreview } from "@/lib/visual-preview";

const AuthContext = createContext(null);
const AUTH_REDIRECT_KEY = "hometech.auth.next";
const ALLOWED_ADMIN_ROLE = "admin";

async function upsertAndReadProfile(supabase, user) {
  if (!supabase || !user) {
    return { profile: null, supported: false };
  }

  const payload = {
    id: user.id,
    email: user.email || null,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
  };

  const upsertResult = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("id, email, full_name, role")
    .maybeSingle();

  if (!upsertResult.error) {
    return { profile: upsertResult.data || null, supported: true };
  }

  const readResult = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (readResult.error) {
    return { profile: null, supported: false };
  }

  return { profile: readResult.data || null, supported: true };
}

export function AuthProvider({ children }) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authEvent, setAuthEvent] = useState(null);
  const [ready, setReady] = useState(false);

  const getPendingRedirect = () => {
    if (typeof window === "undefined") return "/konto";
    return window.sessionStorage.getItem(AUTH_REDIRECT_KEY) || "/konto";
  };

  const setPendingRedirect = (nextPath) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(AUTH_REDIRECT_KEY, nextPath || "/konto");
  };

  const clearPendingRedirect = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  };

  useEffect(() => {
    let mounted = true;
    const preview = getVisualPreview();

    if (preview?.auth) {
      setSession(preview.auth.session || { access_token: "visual-preview-token" });
      setUser(preview.auth.user || null);
      setProfile(preview.auth.profile || null);
      setAuthEvent("VISUAL_PREVIEW");
      setReady(true);
      return undefined;
    }

    if (!supabase) {
      setReady(true);
      return undefined;
    }

    async function syncSession(nextSession, event = null) {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setAuthEvent(event);
      if (!nextSession?.user) {
        setProfile(null);
        setReady(true);
        return;
      }

      const result = await upsertAndReadProfile(supabase, nextSession.user);
      if (!mounted) return;
      setProfile(result.profile || null);
      setReady(true);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      syncSession(data.session || null, "INITIAL_SESSION");
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      syncSession(nextSession || null, event);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const role = profile?.role || user?.app_metadata?.role || user?.user_metadata?.role || "customer";
  const isAdmin = role === ALLOWED_ADMIN_ROLE;

  const value = useMemo(() => ({
    supabase,
    session,
    user,
    profile,
    role,
    isAdmin,
    authEvent,
    ready,
    isAuthenticated: Boolean(user),
    getPendingRedirect,
    setPendingRedirect,
    clearPendingRedirect,
    async exchangeCodeForSession(url) {
      if (!supabase) return { error: new Error("supabase-not-configured") };
      return supabase.auth.exchangeCodeForSession(url);
    },
    async signInWithGoogle(nextPath) {
      if (!supabase || typeof window === "undefined") {
        return { error: new Error("supabase-not-configured") };
      }
      setPendingRedirect(nextPath);
      return supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildAuthRedirectUrl(window.location.origin, nextPath),
        },
      });
    },
    async signInWithPassword(email, password, nextPath) {
      if (!supabase || typeof window === "undefined") {
        return { error: new Error("supabase-not-configured") };
      }
      setPendingRedirect(nextPath);
      return supabase.auth.signInWithPassword({
        email,
        password,
      });
    },
    async signUpWithEmail(email, password, nextPath) {
      if (!supabase || typeof window === "undefined") {
        return { error: new Error("supabase-not-configured") };
      }
      setPendingRedirect(nextPath);
      return supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildAuthRedirectUrl(window.location.origin, nextPath, { mode: "bestaetigen" }),
        },
      });
    },
    async requestPasswordReset(email, nextPath) {
      if (!supabase || typeof window === "undefined") {
        return { error: new Error("supabase-not-configured") };
      }
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthRedirectUrl(window.location.origin, nextPath, { mode: "passwort" }),
      });
    },
    async updatePassword(password) {
      if (!supabase) {
        return { error: new Error("supabase-not-configured") };
      }
      return supabase.auth.updateUser({ password });
    },
    async signOut() {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  }), [authEvent, clearPendingRedirect, getPendingRedirect, isAdmin, profile, ready, role, session, supabase, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
