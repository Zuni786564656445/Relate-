import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import * as db from "../api";
import { initPurchases } from "../purchases";

const AppContext = createContext(null);

const EMPTY_STATE = {
  user: { name: "", age: "", gender: "" },
  onboarded: false,
  proactiveEnabled: true,
  isPremium: false,
  plan: null,
  planExpiresAt: null,
  situations: [],
  goals: [],
  people: [],
  decisions: [],
  journal: [],
};

export function AppProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [state, setState] = useState(EMPTY_STATE);
  const [userId, setUserId] = useState(null);

  const refresh = useCallback(async () => {
    const fresh = await db.getState();
    setState(fresh);
    return fresh;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          await refresh();
          if (mounted) {
            setAuthed(true);
            setUserId(session.user.id);
            initPurchases(session.user.id);
          }
        } catch (e) {
          // profile not ready yet or other transient error — leave logged out view
        }
      }
      if (mounted) setBooting(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthed(false);
        setState(EMPTY_STATE);
        setUserId(null);
      }
    });

    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, [refresh]);

  const signup = async (email, password) => {
    setAuthError("");
    try {
      const res = await db.signup(email, password);
      await refresh();
      setAuthed(true);
      setUserId(res.user?.id);
      if (res.user?.id) initPurchases(res.user.id);
    } catch (e) {
      setAuthError(e.message);
      throw e;
    }
  };

  const login = async (email, password) => {
    setAuthError("");
    try {
      const res = await db.login(email, password);
      await refresh();
      setAuthed(true);
      setUserId(res.user?.id);
      if (res.user?.id) initPurchases(res.user.id);
    } catch (e) {
      setAuthError(e.message);
      throw e;
    }
  };

  const logout = async () => {
    await db.logoutUser();
    setAuthed(false);
    setState(EMPTY_STATE);
    setUserId(null);
  };

  const value = {
    booting,
    authed,
    authError,
    state,
    userId,
    refresh,
    signup,
    login,
    logout,

    completeOnboarding: async (payload) => setState(await db.onboard(payload)),
    updateUser: async (patch) => setState(await db.updateUser(patch)),
    deleteAllData: async () => { await db.deleteAllData(); await refresh(); },
    deleteAccount: async () => { await db.deleteAccount(); setAuthed(false); setState(EMPTY_STATE); },

    addPerson: async (name, relationshipType) => setState(await db.addPerson(name, relationshipType)),
    updatePerson: async (id, patch) => setState(await db.updatePerson(id, patch)),
    deletePerson: async (id) => setState(await db.deletePerson(id)),

    addFact: async (personId, text, type) => setState(await db.addFact(personId, text, type)),
    deleteFact: async (factId) => setState(await db.deleteFact(factId)),

    addEvent: async (personId, title, date) => setState(await db.addEvent(personId, title, date)),
    deleteEvent: async (eventId) => setState(await db.deleteEvent(eventId)),

    addDecision: async (payload) => setState(await db.addDecision(payload)),
    updateDecisionOutcome: async (id, actualOutcome) => setState(await db.updateDecisionOutcome(id, actualOutcome)),

    addJournalEntry: async (text, mood) => {
      const res = await db.addJournal(text, mood);
      setState(res);
      return res.newEntryId;
    },
    setJournalReflection: async (id, reflection) => setState(await db.updateJournal(id, { reflection })),
    deleteJournalEntry: async (id) => setState(await db.deleteJournal(id)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
