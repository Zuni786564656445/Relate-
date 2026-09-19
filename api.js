import { supabase } from "./supabaseClient";

/* ---------------- auth ---------------- */
export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function logoutUser() {
  await supabase.auth.signOut();
}

/* ---------------- state ---------------- */
function mapPerson(p) {
  return {
    id: p.id,
    name: p.name,
    relationshipType: p.relationship_type,
    notes: p.notes || "",
    createdAt: p.created_at,
    facts: (p.facts || []).map((f) => ({ id: f.id, text: f.text, type: f.type, createdAt: f.created_at })),
    events: (p.events || []).sort((a, b) => a.date.localeCompare(b.date)).map((e) => ({ id: e.id, title: e.title, date: e.date })),
  };
}

function mapDecision(d) {
  return {
    id: d.id,
    personId: d.person_id,
    situationText: d.situation_text,
    summary: d.summary,
    knownFacts: d.known_facts || [],
    unknowns: d.unknowns || [],
    assumptions: d.assumptions || [],
    options: d.options || [],
    outcomes: d.outcomes || [],
    recommendation: d.recommendation,
    reasoning: d.reasoning,
    confidence: d.confidence,
    actualOutcome: d.actual_outcome || "",
    createdAt: d.created_at,
  };
}

function mapJournal(j) {
  return { id: j.id, text: j.text, mood: j.mood, reflection: j.reflection || "", createdAt: j.created_at };
}

export async function getState() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const [{ data: profile, error: profileErr }, { data: people, error: peopleErr }, { data: decisions, error: decisionsErr }, { data: journal, error: journalErr }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("people").select("*, facts(*), events(*)").eq("user_id", user.id).order("created_at"),
    supabase.from("decisions").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at"),
  ]);
  if (profileErr) throw new Error(profileErr.message);
  if (peopleErr) throw new Error(peopleErr.message);
  if (decisionsErr) throw new Error(decisionsErr.message);
  if (journalErr) throw new Error(journalErr.message);

  return {
    user: { name: profile.name || "", age: profile.age || "", gender: profile.gender || "" },
    onboarded: !!profile.onboarded,
    proactiveEnabled: !!profile.proactive_enabled,
    isPremium: !!profile.is_premium,
    plan: profile.plan || null,
    planExpiresAt: profile.plan_expires_at || null,
    situations: profile.situations || [],
    goals: profile.goals || [],
    people: (people || []).map(mapPerson),
    decisions: (decisions || []).map(mapDecision),
    journal: (journal || []).map(mapJournal),
  };
}

/* ---------------- onboarding / profile ---------------- */
export async function onboard({ name, age, gender, situations, goals }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("profiles").update({
    name, age, gender, situations, goals, onboarded: true,
  }).eq("id", user.id);
  if (error) throw new Error(error.message);
  return getState();
}

export async function updateUser(patch) {
  const { data: { user } } = await supabase.auth.getUser();
  const dbPatch = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.age !== undefined) dbPatch.age = patch.age;
  if (patch.proactiveEnabled !== undefined) dbPatch.proactive_enabled = patch.proactiveEnabled;
  const { error } = await supabase.from("profiles").update(dbPatch).eq("id", user.id);
  if (error) throw new Error(error.message);
  return getState();
}

export async function deleteAllData() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: people } = await supabase.from("people").select("id").eq("user_id", user.id);
  const personIds = (people || []).map((p) => p.id);
  if (personIds.length) {
    await supabase.from("facts").delete().in("person_id", personIds);
    await supabase.from("events").delete().in("person_id", personIds);
  }
  await supabase.from("people").delete().eq("user_id", user.id);
  await supabase.from("decisions").delete().eq("user_id", user.id);
  await supabase.from("journal_entries").delete().eq("user_id", user.id);
  await supabase.from("profiles").update({ onboarded: false, name: "", age: "", gender: "", situations: [], goals: [] }).eq("id", user.id);
}

export async function deleteAccount() {
  // Deleting the auth user requires elevated privileges the app doesn't
  // hold, so this wipes all owned data and signs the user out. If you want
  // true auth-user deletion, add a Supabase Edge Function that calls
  // `supabase.auth.admin.deleteUser` with the service-role key server-side.
  await deleteAllData();
  await logoutUser();
}

/* ---------------- people ---------------- */
export async function addPerson(name, relationshipType) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("people").insert({ user_id: user.id, name, relationship_type: relationshipType });
  if (error) throw new Error(error.message);
  return getState();
}

export async function updatePerson(id, patch) {
  const dbPatch = {};
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.relationshipType !== undefined) dbPatch.relationship_type = patch.relationshipType;
  if (patch.name !== undefined) dbPatch.name = patch.name;
  const { error } = await supabase.from("people").update(dbPatch).eq("id", id);
  if (error) throw new Error(error.message);
  return getState();
}

export async function deletePerson(id) {
  await supabase.from("facts").delete().eq("person_id", id);
  await supabase.from("events").delete().eq("person_id", id);
  await supabase.from("decisions").update({ person_id: null }).eq("person_id", id);
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return getState();
}

/* ---------------- facts / events ---------------- */
export async function addFact(personId, text, type) {
  const { error } = await supabase.from("facts").insert({ person_id: personId, text, type: type || "fact" });
  if (error) throw new Error(error.message);
  return getState();
}
export async function deleteFact(factId) {
  const { error } = await supabase.from("facts").delete().eq("id", factId);
  if (error) throw new Error(error.message);
  return getState();
}
export async function addEvent(personId, title, date) {
  const { error } = await supabase.from("events").insert({ person_id: personId, title, date });
  if (error) throw new Error(error.message);
  return getState();
}
export async function deleteEvent(eventId) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
  return getState();
}

/* ---------------- decisions ---------------- */
export async function addDecision(d) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("decisions").insert({
    user_id: user.id,
    person_id: d.personId || null,
    situation_text: d.situationText || "",
    summary: d.summary || "",
    known_facts: d.knownFacts || [],
    unknowns: d.unknowns || [],
    assumptions: d.assumptions || [],
    options: d.options || [],
    outcomes: d.outcomes || [],
    recommendation: d.recommendation || "",
    reasoning: d.reasoning || "",
    confidence: d.confidence || "",
  });
  if (error) throw new Error(error.message);
  return getState();
}

export async function updateDecisionOutcome(id, actualOutcome) {
  const { error } = await supabase.from("decisions").update({ actual_outcome: actualOutcome || "" }).eq("id", id);
  if (error) throw new Error(error.message);
  return getState();
}

/* ---------------- journal ---------------- */
export async function addJournal(text, mood) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("journal_entries").insert({ user_id: user.id, text, mood }).select().single();
  if (error) throw new Error(error.message);
  const state = await getState();
  return { ...state, newEntryId: data.id };
}
export async function updateJournal(id, patch) {
  const { error } = await supabase.from("journal_entries").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  return getState();
}
export async function deleteJournal(id) {
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return getState();
}

/* ---------------- AI (Supabase Edge Function) ---------------- */
async function callAi(payload) {
  const { data, error } = await supabase.functions.invoke("ai", { body: payload });
  if (error) {
    const message = error.context?.error || error.message || "AI request failed";
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const api = {
  chat: (messages, personId) => callAi({ action: "chat", messages, personId }),
  decisionRoom: (situation, personId) => callAi({ action: "decision", situation, personId }),
  messageLab: (goal, personId) => callAi({ action: "messagelab", goal, personId }),
  reflect: (text) => callAi({ action: "reflect", text }),
};
