import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useApp } from "../context/AppContext";
import { RelateMark, TextField, PrimaryButton, GhostButton } from "../components/UI";
import { COLORS as C } from "../theme";

export default function AuthScreen() {
  const { login, signup, authError } = useApp();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === "login") await login(email.trim(), password);
      else await signup(email.trim(), password);
    } catch (e) {
      // authError is set in context
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.ivory }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 28 }}>
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <RelateMark size={48} breathing />
          <Text style={{ fontSize: 24, fontWeight: "700", color: C.text, marginTop: 14, letterSpacing: 0.5 }}>RELATE</Text>
          <Text style={{ fontSize: 13.5, color: C.textSoft, marginTop: 4 }}>Understand the situation. Not just the feeling.</Text>
        </View>

        <View style={{ gap: 18 }}>
          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ fontSize: 17, fontWeight: "400" }}
          />
          <TextField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ fontSize: 17, fontWeight: "400" }}
          />
        </View>

        {authError ? <Text style={{ color: C.coral, marginTop: 14, fontSize: 13.5 }}>{authError}</Text> : null}

        <View style={{ marginTop: 26 }}>
          <PrimaryButton disabled={!email.trim() || password.length < 8 || loading} onPress={submit}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </PrimaryButton>
        </View>

        <GhostButton onPress={() => setMode(mode === "login" ? "signup" : "login")} style={{ marginTop: 8 }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </GhostButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
