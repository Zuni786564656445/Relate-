import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { EmptyState, ScreenHeader, TextField, PrimaryButton, Chip } from "../components/UI";
import { COLORS as C, RELATIONSHIP_TYPES, relIcon } from "../theme";

export default function PeopleScreen({ navigation }) {
  const { state, addPerson } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const submit = async () => {
    await addPerson(name.trim(), type);
    setAdding(false); setName(""); setType("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.ivory, paddingTop: 60, paddingHorizontal: 20 }}>
      <ScreenHeader
        title="People"
        right={
          <TouchableOpacity onPress={() => setAdding(true)} style={{ backgroundColor: C.indigo, borderRadius: 12, padding: 8 }}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 40, gap: 10 }}>
        {state.people.length === 0 && <EmptyState text="No one here yet. Add someone you'd like help understanding." cta="Add someone" onPress={() => setAdding(true)} />}
        {state.people.map((p) => (
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
      </ScrollView>

      <Modal visible={adding} animationType="slide" transparent onRequestClose={() => setAdding(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(23,21,31,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: C.ivory, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 36 }}>
            <View style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: C.line, alignSelf: "center", marginBottom: 16 }} />
            <Text style={{ fontSize: 19, fontWeight: "700", color: C.text, marginBottom: 14 }}>Add someone</Text>
            <TextField placeholder="Their name" value={name} onChangeText={setName} autoFocus />
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.textSoft, marginTop: 18 }}>RELATIONSHIP</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
              {RELATIONSHIP_TYPES.map((t) => <Chip key={t} label={t} selected={type === t} onPress={() => setType(t)} />)}
            </View>
            <View style={{ marginTop: 24 }}>
              <PrimaryButton disabled={!name.trim() || !type} onPress={submit}>Add {name || "person"}</PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
