import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/UI";
import { COLORS as C, relIcon } from "../theme";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function computeInsight(state) {
  const counts = {};
  state.decisions.forEach((d) => d.personId && (counts[d.personId] = (counts[d.personId] || 0) + 1));
  state.journal.forEach((j) => {
    state.people.forEach((p) => {
      if (j.text.toLowerCase().includes(p.name.toLowerCase())) counts[p.id] = (counts[p.id] || 0) + 1;
    });
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 2) return null;
  const person = state.people.find((p) => p.id === top[0]);
  if (!person) return null;
  return { personId: person.id, text: `${person.name} has come up ${top[1]} times across your decisions and journal lately. Want to look at what keeps bringing it up?` };
}

export default function HomeScreen({ navigation }) {
  const { state } = useApp();
  const insight = computeInsight(state);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.ivory }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: C.text }}>{greeting()}, {state.user.name || "there"}</Text>
      <Text style={{ fontSize: 14.5, color: C.textSoft, marginTop: 4 }}>Here's where things stand.</Text>

      {insight && (
        <TouchableOpacity
          onPress={() => navigation.navigate("PersonSpace", { personId: insight.personId })}
          style={{ marginTop: 20, padding: 18, borderRadius: 18, backgroundColor: C.indigo }}
        >
          <Text style={{ fontSize: 12.5, fontWeight: "600", color: "rgba(255,255,255,0.85)" }}>SOMETHING WORTH NOTICING</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", marginTop: 8, lineHeight: 22 }}>{insight.text}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 4 }}>
            <Text style={{ color: "#fff", fontSize: 13.5, fontWeight: "600" }}>Look closer</Text>
            <Ionicons name="chevron-forward" size={15} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      <Text style={{ marginTop: 28, fontSize: 13, fontWeight: "700", color: C.textSoft, letterSpacing: 0.3 }}>YOUR WORLD</Text>
      <View style={{ marginTop: 12, gap: 10 }}>
        {state.people.length === 0 && <EmptyState text="No one here yet. Add someone you'd like help understanding." />}
        {state.people.slice(0, 5).map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => navigation.navigate("PersonSpace", { personId: p.id })}
            style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 14 }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(139,124,246,0.14)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: C.violet }}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, fontWeight: "600", color: C.text }}>{p.name}</Text>
              <Text style={{ fontSize: 13, color: C.textSoft, marginTop: 1 }}>{relIcon(p.relationshipType)} {p.relationshipType}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={C.textSoft} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 28 }}>
        <TouchableOpacity onPress={() => navigation.navigate("Decide")} style={{ flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16 }}>
          <Ionicons name="git-branch-outline" size={18} color={C.indigo} />
          <Text style={{ fontSize: 14.5, fontWeight: "600", color: C.text, marginTop: 8 }}>Bring a decision</Text>
          <Text style={{ fontSize: 12.5, color: C.textSoft, marginTop: 2 }}>Think it through, step by step</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chat", { personId: null })} style={{ flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16 }}>
          <Ionicons name="chatbubble-outline" size={18} color={C.coral} />
          <Text style={{ fontSize: 14.5, fontWeight: "600", color: C.text, marginTop: 8 }}>Talk it out</Text>
          <Text style={{ fontSize: 12.5, color: C.textSoft, marginTop: 2 }}>Tell Relate what's going on</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
