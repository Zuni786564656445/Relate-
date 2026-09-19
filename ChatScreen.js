import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { RelateMark, Loading } from "../components/UI";
import { api } from "../api";
import { COLORS as C } from "../theme";

export default function ChatScreen({ route, navigation }) {
  const personId = route.params?.personId || null;
  const { state } = useApp();
  const person = state.people.find((p) => p.id === personId);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (thread.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [thread, loading]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    const nextThread = [...thread, { role: "user", content: value }];
    setThread(nextThread);
    setText("");
    setLoading(true);
    try {
      const { reply } = await api.chat(nextThread, personId);
      setThread((t) => [...t, { role: "assistant", content: reply }]);
    } catch (e) {
      setThread((t) => [...t, { role: "assistant", content: "I couldn't reach the server just now — try again in a moment." }]);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.ivory }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: "#fff" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <RelateMark size={26} />
          <View>
            <Text style={{ fontSize: 15.5, fontWeight: "700", color: C.text }}>Ask Relate</Text>
            {person && <Text style={{ fontSize: 12, color: C.textSoft }}>Focused on {person.name}</Text>}
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={thread}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 18, flexGrow: 1 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: C.textSoft, fontSize: 14, marginTop: 40 }}>
            {person ? `Ask anything about ${person.name}.` : "What's going on?"}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", justifyContent: item.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <View
              style={{
                maxWidth: "80%", paddingVertical: 11, paddingHorizontal: 14, borderRadius: 16,
                backgroundColor: item.role === "user" ? C.indigo : "#fff",
                borderWidth: item.role === "user" ? 0 : 1, borderColor: C.line,
              }}
            >
              <Text style={{ color: item.role === "user" ? "#fff" : C.text, fontSize: 14.5, lineHeight: 20 }}>{item.content}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={loading ? <Loading /> : null}
      />

      <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: "#fff", flexDirection: "row", gap: 8 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Tell me..."
          style={{ flex: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: 99, paddingVertical: 12, paddingHorizontal: 16, fontSize: 14.5 }}
          onSubmitEditing={send}
        />
        <TouchableOpacity onPress={send} disabled={loading} style={{ backgroundColor: C.indigo, borderRadius: 99, width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="send" size={17} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
