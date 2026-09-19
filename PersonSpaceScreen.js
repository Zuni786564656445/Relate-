import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { EmptyState, ScreenHeader, Chip } from "../components/UI";
import { COLORS as C, relIcon } from "../theme";

export default function PersonSpaceScreen({ route, navigation }) {
  const { personId } = route.params;
  const { state, updatePerson, deletePerson, addFact, deleteFact, addEvent, deleteEvent } = useApp();
  const person = state.people.find((p) => p.id === personId);
  const [tab, setTab] = useState("overview");
  const [factText, setFactText] = useState("");
  const [factType, setFactType] = useState("fact");
  const [evTitle, setEvTitle] = useState("");
  const [evDate, setEvDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState(person?.notes || "");

  if (!person) {
    return (
      <View style={{ flex: 1, backgroundColor: C.ivory, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: C.textSoft }}>This person was removed.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 19, fontWeight: "700", color: C.text }}>{person.name}</Text>
        </View>
        <TouchableOpacity onPress={() => setConfirmDelete(true)}>
          <Ionicons name="trash-outline" size={18} color={C.textSoft} />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 13.5, color: C.textSoft, marginTop: 4, marginBottom: 16 }}>{relIcon(person.relationshipType)} {person.relationshipType}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat", { personId: person.id })}
          style={{ flex: 1, backgroundColor: C.indigo, borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Ionicons name="chatbubble-outline" size={15} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Talk about {person.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("MessageLab", { personId: person.id })}
          style={{ flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Ionicons name="sparkles-outline" size={15} color={C.coral} />
          <Text style={{ color: C.text, fontSize: 14, fontWeight: "600" }}>Message Lab</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 4, backgroundColor: "#fff", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.line }}>
        {["overview", "timeline", "notes"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 9, borderRadius: 9, backgroundColor: tab === t ? C.indigo : "transparent", alignItems: "center" }}>
            <Text style={{ color: tab === t ? "#fff" : C.textSoft, fontSize: 13.5, fontWeight: "600", textTransform: "capitalize" }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 60 }}>
        {tab === "overview" && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.textSoft, marginBottom: 8 }}>WHAT RELATE KNOWS</Text>
            {person.facts.length === 0 && <EmptyState text="Nothing recorded yet. Add what's worth remembering." />}
            <View style={{ gap: 8 }}>
              {person.facts.map((f) => (
                <View key={f.id} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 13 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: "700", color: f.type === "fact" ? C.indigo : C.coral, textTransform: "uppercase" }}>{f.type}</Text>
                    <Text style={{ fontSize: 14.5, color: C.text, marginTop: 3 }}>{f.text}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteFact(f.id)}><Ionicons name="close" size={15} color={C.textSoft} /></TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
                <Chip label="Fact" selected={factType === "fact"} onPress={() => setFactType("fact")} />
                <Chip label="Interpretation" selected={factType === "interpretation"} onPress={() => setFactType("interpretation")} />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput value={factText} onChangeText={setFactText} placeholder="What should I know?" style={{ flex: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, fontSize: 14.5, backgroundColor: "#fff" }} />
                <TouchableOpacity
                  onPress={() => { if (factText.trim()) { addFact(person.id, factText.trim(), factType); setFactText(""); } }}
                  style={{ backgroundColor: C.indigo, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {tab === "timeline" && (
          <View>
            {person.events.length === 0 && <EmptyState text="No events yet. Add the moments that matter." />}
            {person.events.map((e) => (
              <View key={e.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <View>
                  <Text style={{ fontSize: 12, color: C.textSoft, fontWeight: "600" }}>{e.date}</Text>
                  <Text style={{ fontSize: 14.5, color: C.text, fontWeight: "500" }}>{e.title}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteEvent(e.id)}><Ionicons name="close" size={15} color={C.textSoft} /></TouchableOpacity>
              </View>
            ))}
            <View style={{ gap: 8, marginTop: 12 }}>
              <TextInput value={evDate} onChangeText={setEvDate} placeholder="YYYY-MM-DD" style={{ borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, fontSize: 14.5, backgroundColor: "#fff" }} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput value={evTitle} onChangeText={setEvTitle} placeholder="What happened?" style={{ flex: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, fontSize: 14.5, backgroundColor: "#fff" }} />
                <TouchableOpacity
                  onPress={() => { if (evTitle.trim() && evDate) { addEvent(person.id, evTitle.trim(), evDate); setEvTitle(""); setEvDate(""); } }}
                  style={{ backgroundColor: C.indigo, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {tab === "notes" && (
          <TextInput
            value={notes}
            onChangeText={setNotes}
            onBlur={() => updatePerson(person.id, { notes })}
            placeholder="Freeform notes about this relationship..."
            multiline
            style={{ minHeight: 200, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 14, fontSize: 14.5, backgroundColor: "#fff", textAlignVertical: "top" }}
          />
        )}
      </ScrollView>

      <Modal visible={confirmDelete} transparent animationType="slide" onRequestClose={() => setConfirmDelete(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(23,21,31,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: C.ivory, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 36 }}>
            <Text style={{ fontSize: 19, fontWeight: "700", color: C.text, marginBottom: 10 }}>Remove {person.name}?</Text>
            <Text style={{ fontSize: 14.5, color: C.textSoft, marginBottom: 18 }}>This deletes everything Relate knows about {person.name}. This can't be undone.</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setConfirmDelete(false)} style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, alignItems: "center" }}>
                <Text style={{ color: C.textSoft, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => { await deletePerson(person.id); setConfirmDelete(false); navigation.goBack(); }}
                style={{ flex: 1, backgroundColor: C.coral, borderRadius: 14, padding: 14, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
