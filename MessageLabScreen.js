import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { PrimaryButton, Loading, ScreenHeader } from "../components/UI";
import { api } from "../api";
import { COLORS as C } from "../theme";

export default function MessageLabScreen({ route, navigation }) {
  const personId = route.params?.personId || null;
  const { state } = useApp();
  const person = state.people.find((p) => p.id === personId);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const json = await api.messageLab(goal, personId);
      setVariants(json);
    } catch (e) {
      setError("Couldn't generate messages. Try again.");
    }
    setLoading(false);
  };

  const copy = async (key, val) => {
    await Clipboard.setStringAsync(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 19, fontWeight: "700", color: C.text }}>Message Lab</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {person && <Text style={{ fontSize: 13, color: C.textSoft, marginBottom: 12 }}>Writing to {person.name}</Text>}
        <TextInput
          value={goal}
          onChangeText={setGoal}
          placeholder="What do you want to say?"
          multiline
          style={{ minHeight: 80, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, fontSize: 14.5, backgroundColor: "#fff", textAlignVertical: "top" }}
        />
        <View style={{ marginTop: 12 }}>
          <PrimaryButton disabled={!goal.trim() || loading} onPress={generate}>{loading ? "Writing..." : "Generate messages"}</PrimaryButton>
        </View>
        {loading && <Loading label="Finding the right words" />}
        {!!error && <Text style={{ color: C.coral, fontSize: 13.5, marginTop: 10 }}>{error}</Text>}

        {variants && (
          <View style={{ marginTop: 20, gap: 10 }}>
            {Object.entries(variants).map(([key, val]) => (
              <View key={key} style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: C.violet, textTransform: "uppercase", letterSpacing: 0.4 }}>{key}</Text>
                  <TouchableOpacity onPress={() => copy(key, val)} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name={copiedKey === key ? "checkmark" : "copy-outline"} size={13} color={copiedKey === key ? C.indigo : C.textSoft} />
                    <Text style={{ fontSize: 12.5, fontWeight: "600", color: copiedKey === key ? C.indigo : C.textSoft }}>{copiedKey === key ? "Copied" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 14.5, color: C.text, marginTop: 6, lineHeight: 20 }}>{val}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
