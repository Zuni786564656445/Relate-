import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, ScrollView, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { RelateMark } from "../components/UI";
import { PLANS, purchasePlan, restorePurchases } from "../purchases";
import { COLORS as C } from "../theme";

const FEATURES = [
  "Unlimited conversations with Relate",
  "Long-term memory for every relationship",
  "Decision Room + Decision Replay",
  "Message Lab — every tone, every time",
  "Pattern detection across your history",
];

export default function PaywallScreen() {
  const { refresh, userId } = useApp();
  const [selected, setSelected] = useState("relate_monthly");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.035, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const plan = PLANS.find((p) => p.id === selected);

  const continueTapped = async () => {
    setLoading(true);
    try {
      const res = await purchasePlan(plan, userId);
      await refresh();
      if (res.testMode) {
        Alert.alert("Test mode", "No real payment was made — your account was marked premium for development. Add your RevenueCat keys in src/purchases.js to take real payments.");
      }
    } catch (e) {
      Alert.alert("Couldn't complete purchase", e.message);
    }
    setLoading(false);
  };

  const restoreTapped = async () => {
    setRestoring(true);
    try {
      const res = await restorePurchases(userId);
      if (res.testMode) {
        Alert.alert("Test mode", "Restore isn't available until real purchases are wired up — see src/purchases.js.");
      } else if (res.restored) {
        await refresh();
        Alert.alert("Restored", "Your premium access is back.");
      } else {
        Alert.alert("Nothing to restore", "No active purchase was found for this account.");
      }
    } catch (e) {
      Alert.alert("Couldn't restore", e.message);
    }
    setRestoring(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory }}>
      <LinearGradient colors={[C.indigo, C.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 70, paddingBottom: 34, paddingHorizontal: 26, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], alignItems: "center" }}>
          <RelateMark size={44} breathing />
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 14, textAlign: "center", lineHeight: 29 }}>
            Relate gets smarter{"\n"}when it knows your story.
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 8, textAlign: "center" }}>
            Unlock the full relationship intelligence system.
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <View style={{ gap: 10, marginBottom: 24 }}>
            {FEATURES.map((f) => (
              <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(81,70,229,0.1)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="checkmark" size={13} color={C.indigo} />
                </View>
                <Text style={{ fontSize: 14.5, color: C.text, flex: 1 }}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            {PLANS.map((p) => {
              const isSelected = selected === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelected(p.id)}
                  activeOpacity={0.9}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    padding: 16, borderRadius: 16,
                    borderWidth: isSelected ? 2 : 1.5,
                    borderColor: isSelected ? C.indigo : C.line,
                    backgroundColor: isSelected ? "rgba(81,70,229,0.06)" : "#fff",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                      borderColor: isSelected ? C.indigo : C.line,
                      alignItems: "center", justifyContent: "center",
                      backgroundColor: isSelected ? C.indigo : "transparent",
                    }}>
                      {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />}
                    </View>
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ fontSize: 15.5, fontWeight: "700", color: C.text }}>{p.label}</Text>
                        {p.badge && (
                          <View style={{ backgroundColor: C.coral, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{p.badge.toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>
                    {p.price}<Text style={{ fontSize: 12.5, fontWeight: "500", color: C.textSoft }}>{p.period}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Animated.View style={{ marginTop: 24, transform: [{ scale: pulse }] }}>
            <TouchableOpacity
              onPress={continueTapped}
              disabled={loading}
              style={{ backgroundColor: C.indigo, borderRadius: 16, paddingVertical: 16, alignItems: "center", shadowColor: C.indigo, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Unlock Relate Pro</Text>}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={restoreTapped} disabled={restoring} style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={{ color: C.textSoft, fontSize: 13.5, fontWeight: "600" }}>{restoring ? "Restoring..." : "Restore purchases"}</Text>
          </TouchableOpacity>

          <Text style={{ marginTop: 14, textAlign: "center", fontSize: 11.5, color: C.textSoft, lineHeight: 16 }}>
            Weekly and monthly plans auto-renew until cancelled. Manage or cancel anytime in your device's subscription settings.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
