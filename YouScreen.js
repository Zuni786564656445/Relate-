import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { ScreenHeader, Section, Loading } from "../components/UI";
import { api } from "../api";
import { COLORS as C } from "../theme";

export default function YouScreen() {
  const { state, updateUser, addJournalEntry, setJournalReflection, deleteJournalEntry, deleteFact, deleteAllData, deleteAccount, logout } = useApp();
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("🙂");
  const [analyzingId, setAnalyzingId] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [age, setAge] = useState(state.user.age);

  const saveEntry = async (analyze) => {
    const text = entry;
    setEntry("");
    const newId = await addJournalEntry(text, mood);
    if (analyze && newId) {
      setAnalyzingId(newId);
      try {
        const { reflection } = await api.reflect(text);
        await setJournalReflection(newId, reflection);
      } catch (e) {
        // leave entry saved without a reflection
      }
      setAnalyzingId(null);
    }
  };

  const allFacts = state.people.flatMap((p) => p.facts.map((f) => ({ ...f, personName: p.name, personId: p.id })));

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
      <ScreenHeader title="You" />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Section label="About me">
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, gap: 12 }}>
            <View>
              <Text style={{ fontSize: 11.5, color: C.textSoft, fontWeight: "600" }}>NAME</Text>
              <TextInput value={name} onChangeText={setName} onBlur={() => updateUser({ name })} style={{ fontSize: 15, fontWeight: "500", color: C.text, borderBottomWidth: 1.5, borderBottomColor: C.line, paddingVertical: 5 }} />
            </View>
            <View>
              <Text style={{ fontSize: 11.5, color: C.textSoft, fontWeight: "600" }}>AGE</Text>
              <TextInput value={age} onChangeText={(v) => setAge(v.replace(/\D/g, ""))} onBlur={() => updateUser({ age })} keyboardType="number-pad" style={{ fontSize: 15, fontWeight: "500", color: C.text, borderBottomWidth: 1.5, borderBottomColor: C.line, paddingVertical: 5 }} />
            </View>
          </View>
        </Section>

        <Section label="Journal">
          <TextInput
            value={entry}
            onChangeText={setEntry}
            placeholder="What's on your mind?"
            multiline
            style={{ minHeight: 70, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, fontSize: 14.5, backgroundColor: "#fff", textAlignVertical: "top" }}
          />
          <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
            {["🙂", "😐", "😔", "😤", "😰"].map((m) => (
              <TouchableOpacity key={m} onPress={() => setMood(m)} style={{ backgroundColor: mood === m ? "rgba(81,70,229,0.1)" : "transparent", borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 18 }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <TouchableOpacity disabled={!entry.trim()} onPress={() => saveEntry(false)} style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 11, alignItems: "center" }}>
              <Text style={{ fontSize: 13.5, fontWeight: "600", color: C.text }}>Keep private</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={!entry.trim()} onPress={() => saveEntry(true)} style={{ flex: 1, backgroundColor: C.indigo, borderRadius: 12, paddingVertical: 11, alignItems: "center" }}>
              <Text style={{ fontSize: 13.5, fontWeight: "600", color: "#fff" }}>Help me understand it</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8, marginTop: 14 }}>
            {[...state.journal].reverse().map((j) => (
              <View key={j.id} style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, color: C.textSoft }}>{j.mood} {new Date(j.createdAt).toLocaleDateString()}</Text>
                  <TouchableOpacity onPress={() => deleteJournalEntry(j.id)}><Ionicons name="close" size={13} color={C.textSoft} /></TouchableOpacity>
                </View>
                <Text style={{ fontSize: 14, color: C.text, marginTop: 4 }}>{j.text}</Text>
                {analyzingId === j.id && <Loading label="Reflecting" />}
                {!!j.reflection && (
                  <View style={{ marginTop: 8, backgroundColor: "rgba(139,124,246,0.08)", borderRadius: 10, padding: 10 }}>
                    <Text style={{ fontSize: 13, color: C.text }}>{j.reflection}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Section>

        <Section label="My memory">
          {allFacts.length === 0 && <Text style={{ fontSize: 13.5, color: C.textSoft }}>Nothing saved yet.</Text>}
          <View style={{ gap: 6 }}>
            {allFacts.map((f) => (
              <View key={f.id} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: 13.5, color: C.text, flex: 1 }}><Text style={{ color: C.textSoft }}>{f.personName}: </Text>{f.text}</Text>
                <TouchableOpacity onPress={() => deleteFact(f.id)}><Ionicons name="close" size={13} color={C.textSoft} /></TouchableOpacity>
              </View>
            ))}
          </View>
        </Section>

        <Section label="Privacy & settings">
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 }}>
              <Text style={{ fontSize: 14.5, color: C.text, fontWeight: "500" }}>Proactive intelligence</Text>
              <Switch
                value={state.proactiveEnabled}
                onValueChange={(v) => updateUser({ proactiveEnabled: v })}
                trackColor={{ true: C.indigo, false: C.line }}
              />
            </View>
            <View style={{ height: 1, backgroundColor: C.line }} />
            <TouchableOpacity onPress={logout} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14 }}>
              <Ionicons name="log-out-outline" size={16} color={C.textSoft} />
              <Text style={{ fontSize: 14.5, fontWeight: "600", color: C.textSoft }}>Log out</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: C.line }} />
            <TouchableOpacity onPress={() => setConfirmReset(true)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14 }}>
              <Ionicons name="trash-outline" size={16} color={C.coral} />
              <Text style={{ fontSize: 14.5, fontWeight: "600", color: C.coral }}>Delete all data</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: C.line }} />
            <TouchableOpacity onPress={() => setConfirmDeleteAccount(true)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14 }}>
              <Ionicons name="person-remove-outline" size={16} color={C.coral} />
              <Text style={{ fontSize: 14.5, fontWeight: "600", color: C.coral }}>Delete account</Text>
            </TouchableOpacity>
          </View>
        </Section>
      </ScrollView>

      <Modal visible={confirmReset} transparent animationType="slide" onRequestClose={() => setConfirmReset(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(23,21,31,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: C.ivory, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 36 }}>
            <Text style={{ fontSize: 19, fontWeight: "700", color: C.text, marginBottom: 10 }}>Delete everything?</Text>
            <Text style={{ fontSize: 14.5, color: C.textSoft, marginBottom: 18 }}>This permanently deletes your people, decisions, journal, and memory. This can't be undone.</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setConfirmReset(false)} style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, alignItems: "center" }}>
                <Text style={{ color: C.textSoft, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { await deleteAllData(); setConfirmReset(false); }} style={{ flex: 1, backgroundColor: C.coral, borderRadius: 14, padding: 14, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmDeleteAccount} transparent animationType="slide" onRequestClose={() => setConfirmDeleteAccount(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(23,21,31,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: C.ivory, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 36 }}>
            <Text style={{ fontSize: 19, fontWeight: "700", color: C.text, marginBottom: 10 }}>Delete your account?</Text>
            <Text style={{ fontSize: 14.5, color: C.textSoft, marginBottom: 18 }}>This permanently deletes your account and everything in it, and logs you out. This can't be undone.</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setConfirmDeleteAccount(false)} style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, alignItems: "center" }}>
                <Text style={{ color: C.textSoft, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { await deleteAccount(); }} style={{ flex: 1, backgroundColor: C.coral, borderRadius: 14, padding: 14, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Delete account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
