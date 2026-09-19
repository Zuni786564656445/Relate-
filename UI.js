import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, Animated, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { COLORS as C } from "../theme";

export function RelateMark({ size = 36, breathing = false }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!breathing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 1300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathing]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Path d="M6 14 C 18 14, 18 34, 24 34" stroke={C.indigo} strokeWidth="3.4" strokeLinecap="round" />
        <Path d="M42 14 C 30 14, 30 34, 24 34" stroke={C.coral} strokeWidth="3.4" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

export function PrimaryButton({ children, onPress, disabled, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.primaryBtn, disabled && { backgroundColor: "#C9C5F5" }, style]}
    >
      <Text style={styles.primaryBtnText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ children, onPress, style, textStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={[{ padding: 12, alignItems: "center" }, style]}>
      <Text style={[{ color: C.textSoft, fontSize: 15, fontWeight: "600" }, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? C.indigo : C.line, backgroundColor: selected ? "rgba(81,70,229,0.08)" : "#fff" },
      ]}
    >
      <Text style={{ color: selected ? C.indigo : C.text, fontSize: 15, fontWeight: "500" }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function TextField(props) {
  return <TextInput placeholderTextColor="#ABA8B5" style={styles.input} {...props} />;
}

export function Section({ label, children, style }) {
  return (
    <View style={[{ marginTop: 18 }, style]}>
      <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

export function EmptyState({ text, cta, onPress }) {
  return (
    <View style={styles.emptyState}>
      <Text style={{ color: C.textSoft, fontSize: 14.5, textAlign: "center", lineHeight: 21 }}>{text}</Text>
      {cta && (
        <TouchableOpacity onPress={onPress} style={{ marginTop: 12 }}>
          <Text style={{ color: C.indigo, fontWeight: "600", fontSize: 14.5 }}>{cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Loading({ label = "Thinking" }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 }}>
      <ActivityIndicator size="small" color={C.violet} />
      <Text style={{ color: C.textSoft, fontSize: 13.5 }}>{label}</Text>
    </View>
  );
}

export function ScreenHeader({ title, right }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: C.indigo,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    margin: 4,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: C.line,
    fontSize: 22,
    fontWeight: "600",
    color: C.text,
    paddingVertical: 8,
  },
  sectionLabel: { fontSize: 12.5, fontWeight: "700", color: C.textSoft, marginBottom: 8, letterSpacing: 0.2 },
  emptyState: {
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    borderStyle: "dashed",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: C.text },
});
