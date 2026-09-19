import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { RelateMark, TextField, PrimaryButton, GhostButton, Chip } from "../components/UI";
import { COLORS as C, SITUATIONS, GOAL_OPTIONS } from "../theme";

const FOCUS_OPTIONS = ["Partner", "Someone I'm dating", "Ex", "Crush", "Friend", "Family member", "Multiple people", "It depends"];
const TOTAL = 8;

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ name: "", age: "", gender: "", situations: [], focus: "", goals: [] });
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(16);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const toggle = (key, val) => {
    setDraft((d) => {
      const has = d[key].includes(val);
      return { ...d, [key]: has ? d[key].filter((v) => v !== val) : [...d[key], val] };
    });
  };

  const canContinue = () => {
    if (step === 1) return draft.name.trim().length > 0;
    if (step === 2) return String(draft.age).trim().length > 0;
    if (step === 3) return draft.gender !== "";
    if (step === 4) return draft.situations.length > 0;
    if (step === 5) return draft.focus !== "";
    if (step === 6) return draft.goals.length > 0;
    return true;
  };

  const finish = () => completeOnboarding({ name: draft.name, age: draft.age, gender: draft.gender, situations: draft.situations, goals: draft.goals });

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory }}>
      {step > 0 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 60 }}>
          <View style={{ height: 4, borderRadius: 99, backgroundColor: C.line, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${(step / (TOTAL - 1)) * 100}%`, backgroundColor: C.indigo }} />
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 26, paddingTop: step === 0 ? 80 : 36 }}>
        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}>
        {step === 0 && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 22 }}>
            <RelateMark size={54} breathing />
            <Text style={{ fontSize: 27, fontWeight: "700", color: C.text, textAlign: "center", lineHeight: 34 }}>
              Let's make sense of your relationships.
            </Text>
            <Text style={{ fontSize: 15.5, color: C.textSoft, textAlign: "center", maxWidth: 280, lineHeight: 22 }}>
              Relate remembers the important stuff so you don't have to explain everything twice.
            </Text>
          </View>
        )}

        {step === 1 && (
          <Question title="What should I call you?">
            <TextField placeholder="Your first name" value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} autoFocus />
            {!!draft.name && <Text style={{ marginTop: 14, color: C.indigo, fontSize: 15, fontWeight: "500" }}>Nice to meet you, {draft.name}.</Text>}
          </Question>
        )}

        {step === 2 && (
          <Question title="How old are you?">
            <TextField placeholder="Age" value={draft.age} onChangeText={(v) => setDraft({ ...draft, age: v.replace(/\D/g, "") })} keyboardType="number-pad" autoFocus />
          </Question>
        )}

        {step === 3 && (
          <Question title="How do you identify?">
            <View style={{ gap: 10, marginTop: 6 }}>
              {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                <SelectRow key={g} label={g} selected={draft.gender === g} onPress={() => setDraft({ ...draft, gender: g })} />
              ))}
            </View>
          </Question>
        )}

        {step === 4 && (
          <Question title="What kind of situations do you want help with?" subtitle="Pick as many as apply.">
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {SITUATIONS.map((s) => <Chip key={s} label={s} selected={draft.situations.includes(s)} onPress={() => toggle("situations", s)} />)}
            </View>
          </Question>
        )}

        {step === 5 && (
          <Question title="Who usually needs the most explaining?">
            <View style={{ gap: 10, marginTop: 6 }}>
              {FOCUS_OPTIONS.map((f) => <SelectRow key={f} label={f} selected={draft.focus === f} onPress={() => setDraft({ ...draft, focus: f })} />)}
            </View>
          </Question>
        )}

        {step === 6 && (
          <Question title="What do you want Relate to do?" subtitle="Pick as many as apply.">
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {GOAL_OPTIONS.map((g) => <Chip key={g} label={g} selected={draft.goals.includes(g)} onPress={() => toggle("goals", g)} />)}
            </View>
          </Question>
        )}

        {step === 7 && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
            <RelateMark size={46} breathing />
            <Text style={{ fontSize: 25, fontWeight: "700", color: C.text }}>You're ready.</Text>
            <Text style={{ fontSize: 15.5, color: C.textSoft, maxWidth: 260, textAlign: "center" }}>
              From here, Relate will start connecting the dots.
            </Text>
          </View>
        )}
        </Animated.View>
      </ScrollView>

      <View style={{ padding: 26, paddingBottom: 40, flexDirection: "row", gap: 10 }}>
        {step > 0 && step < TOTAL - 1 && (
          <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={{ padding: 14 }}>
            <Ionicons name="chevron-back" size={22} color={C.textSoft} />
          </TouchableOpacity>
        )}
        <PrimaryButton
          disabled={!canContinue()}
          onPress={() => (step === TOTAL - 1 ? finish() : setStep((s) => s + 1))}
        >
          {step === 0 ? "Let's begin" : step === TOTAL - 1 ? "Enter Relate" : "Continue"}
        </PrimaryButton>
      </View>
    </View>
  );
}

function Question({ title, subtitle, children }) {
  return (
    <View>
      <Text style={{ fontSize: 25, fontWeight: "700", color: C.text, lineHeight: 32 }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 14.5, color: C.textSoft, marginTop: 6 }}>{subtitle}</Text>}
      <View style={{ marginTop: 22 }}>{children}</View>
    </View>
  );
}

function SelectRow({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14,
        borderWidth: 1.5, borderColor: selected ? C.indigo : C.line,
        backgroundColor: selected ? "rgba(81,70,229,0.06)" : "#fff",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "500", color: C.text }}>{label}</Text>
      {selected && <Ionicons name="checkmark" size={18} color={C.indigo} />}
    </TouchableOpacity>
  );
}
