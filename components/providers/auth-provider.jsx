"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildAuthRedirectUrl } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const AuthContext = createContext(null);
const AUTH_REDIRECT_KEY = "hometech.auth.next";

export function AuthProvider({ children }) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
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
    if (!supabase) {
      setReady(true);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      setUser(data.session?.user || null);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(() => ({
    supabase,
    session,
    user,
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
    async signInWithEmail(email, nextPath) {
      if (!supabase || typeof window === "undefined") {
        return { error: new Error("supabase-not-configured") };
      }
      setPendingRedirect(nextPath);
      return supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: buildAuthRedirectUrl(window.location.origin, nextPath),
        },
      });
    },
    async signOut() {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  }), [clearPendingRedirect, getPendingRedirect, ready, session, supabase, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
