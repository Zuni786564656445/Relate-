import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { EmptyState, ScreenHeader, PrimaryButton, Chip, Loading, Section } from "../components/UI";
import { api } from "../api";
import { COLORS as C } from "../theme";

export default function DecideScreen() {
  const { state, addDecision, updateDecisionOutcome } = useApp();
  const [view, setView] = useState("list"); // list | new | detail
  const [activeId, setActiveId] = useState(null);
  const [personId, setPersonId] = useState("");
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confidence, setConfidence] = useState("");

  const active = state.decisions.find((d) => d.id === activeId);

  const organize = async () => {
    setLoading(true); setError("");
    try {
      const json = await api.decisionRoom(situation, personId || null);
      setResult(json);
    } catch (e) {
      setError("Couldn't organize this right now. Try again.");
    }
    setLoading(false);
  };

  const save = async () => {
    await addDecision({ personId: personId || null, situationText: situation, ...result, confidence });
    setView("list"); setSituation(""); setResult(null); setConfidence(""); setPersonId("");
  };

  if (view === "detail" && active) {
    const person = state.people.find((p) => p.id === active.personId);
    return (
      <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
        <BackHeader title="Decision" onBack={() => setView("list")} />
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <DecisionBody d={active} personName={person?.name} />
          <OutcomeBlock decision={active} onSave={(text) => updateDecisionOutcome(active.id, text)} />
        </ScrollView>
      </View>
    );
  }

  if (view === "new") {
    return (
      <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
        <BackHeader title="New decision" onBack={() => setView("list")} />
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {!result && (
            <>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.textSoft, marginBottom: 8 }}>WHO IS THIS ABOUT? (OPTIONAL)</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
                {state.people.map((p) => <Chip key={p.id} label={p.name} selected={personId === p.id} onPress={() => setPersonId(personId === p.id ? "" : p.id)} />)}
              </View>
              <TextInput
                value={situation}
                onChangeText={setSituation}
                placeholder="What's the decision? e.g. Should I text her back or wait?"
                multiline
                style={{ minHeight: 110, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 14, fontSize: 15, backgroundColor: "#fff", textAlignVertical: "top" }}
              />
              <View style={{ marginTop: 18 }}>
                <PrimaryButton disabled={!situation.trim() || loading} onPress={organize}>{loading ? "Organizing..." : "Organize this"}</PrimaryButton>
              </View>
              {loading && <Loading label="Sorting facts from assumptions" />}
              {!!error && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
                  <Ionicons name="alert-circle-outline" size={14} color={C.coral} />
                  <Text style={{ color: C.coral, fontSize: 13.5 }}>{error}</Text>
                </View>
              )}
            </>
          )}

          {result && (
            <>
              <DecisionBody d={{ situationText: situation, ...result }} personName={state.people.find((p) => p.id === personId)?.name} />
              <Section label="How confident are you?">
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["Low", "Medium", "High"].map((c) => <Chip key={c} label={c} selected={confidence === c} onPress={() => setConfidence(c)} />)}
                </View>
              </Section>
              <View style={{ marginTop: 20 }}>
                <PrimaryButton disabled={!confidence} onPress={save}>Save this decision</PrimaryButton>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
      <ScreenHeader
        title="Decide"
        right={
          <TouchableOpacity onPress={() => setView("new")} style={{ backgroundColor: C.indigo, borderRadius: 12, padding: 8 }}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 60, gap: 10 }}>
        {state.decisions.length === 0 && <EmptyState text="No decisions yet. Bring Relate a situation you're stuck on." cta="New decision" onPress={() => setView("new")} />}
        {[...state.decisions].reverse().map((d) => {
          const person = state.people.find((p) => p.id === d.personId);
          return (
            <TouchableOpacity
              key={d.id}
              onPress={() => { setActiveId(d.id); setView("detail"); }}
              style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 15 }}
            >
              <Text style={{ fontSize: 12, color: C.textSoft, fontWeight: "600" }}>{person ? person.name : "General"} · {new Date(d.createdAt).toLocaleDateString()}</Text>
              <Text style={{ fontSize: 15, color: C.text, fontWeight: "600", marginTop: 4 }}>{d.summary || d.situationText}</Text>
              <Text style={{ fontSize: 12.5, color: d.actualOutcome ? C.indigo : C.textSoft, marginTop: 6 }}>{d.actualOutcome ? "Outcome recorded" : "Awaiting outcome"}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function BackHeader({ title, onBack }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <TouchableOpacity onPress={onBack} style={{ padding: 4 }}><Ionicons name="chevron-back" size={22} color={C.text} /></TouchableOpacity>
      <Text style={{ fontSize: 19, fontWeight: "700", color: C.text }}>{title}</Text>
    </View>
  );
}

function DecisionBody({ d, personName }) {
  return (
    <View>
      <Section label="The situation">
        <Text style={{ fontSize: 15, color: C.text, lineHeight: 21 }}>{d.summary || d.situationText}</Text>
        {personName && <Text style={{ fontSize: 12.5, color: C.textSoft, marginTop: 4 }}>About {personName}</Text>}
      </Section>
      <ListSection label="What we know" items={d.knownFacts} />
      <ListSection label="What we don't know" items={d.unknowns} />
      <ListSection label="What you're assuming" items={d.assumptions} />
      {d.options?.length > 0 && (
        <Section label="Your options">
          <View style={{ gap: 8 }}>
            {d.options.map((o, i) => (
              <View key={i} style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12 }}>
                <Text style={{ fontSize: 14.5, fontWeight: "600", color: C.text }}>{o.title}</Text>
                <Text style={{ fontSize: 13.5, color: C.textSoft, marginTop: 3 }}>{o.description}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}
      <ListSection label="Possible outcomes" items={d.outcomes} />
      {!!d.recommendation && (
        <Section label="My take">
          <View style={{ backgroundColor: "rgba(81,70,229,0.06)", borderRadius: 12, padding: 13 }}>
            <Text style={{ fontSize: 14.5, color: C.text, fontWeight: "600", lineHeight: 20 }}>{d.recommendation}</Text>
            {!!d.reasoning && <Text style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>{d.reasoning}</Text>}
          </View>
        </Section>
      )}
    </View>
  );
}

function ListSection({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <Section label={label}>
      <View style={{ gap: 6 }}>
        {items.map((it, i) => (
          <Text key={i} style={{ fontSize: 14, color: C.text, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 10 }}>{it}</Text>
        ))}
      </View>
    </Section>
  );
}

function OutcomeBlock({ decision, onSave }) {
  const [text, setText] = useState(decision.actualOutcome || "");
  const [editing, setEditing] = useState(!decision.actualOutcome);

  if (!editing && decision.actualOutcome) {
    return (
      <Section label="Decision replay">
        <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 13 }}>
          <Text style={{ fontSize: 12.5, color: C.textSoft, fontWeight: "600" }}>You expected</Text>
          <Text style={{ fontSize: 14, color: C.text, marginTop: 2 }}>{decision.recommendation}</Text>
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 10 }} />
          <Text style={{ fontSize: 12.5, color: C.textSoft, fontWeight: "600" }}>What actually happened</Text>
          <Text style={{ fontSize: 14, color: C.text, marginTop: 2 }}>{decision.actualOutcome}</Text>
          <TouchableOpacity onPress={() => setEditing(true)} style={{ marginTop: 10 }}>
            <Text style={{ color: C.indigo, fontSize: 13, fontWeight: "600" }}>Edit</Text>
          </TouchableOpacity>
        </View>
      </Section>
    );
  }

  return (
    <Section label="What happened?">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Record the actual outcome so Relate can learn from it..."
        multiline
        style={{ minHeight: 80, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: "#fff", textAlignVertical: "top" }}
      />
      <TouchableOpacity
        disabled={!text.trim()}
        onPress={() => { onSave(text); setEditing(false); }}
        style={{ marginTop: 8, backgroundColor: text.trim() ? C.indigo : "#C9C5F5", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignSelf: "flex-start" }}
      >
        <Text style={{ color: "#fff", fontSize: 13.5, fontWeight: "600" }}>Save outcome</Text>
      </TouchableOpacity>
    </Section>
  );
}
