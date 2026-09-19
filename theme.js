export const COLORS = {
  indigo: "#5146E5",
  indigoDeep: "#3D34B8",
  violet: "#8B7CF6",
  coral: "#FF8A7A",
  ivory: "#FAF9F7",
  surface: "#FFFFFF",
  text: "#17151F",
  textSoft: "#74717D",
  line: "#ECEAF3",
};

export const SITUATIONS = ["Dating", "Relationship", "Breakups", "Friendships", "Family", "Communication", "Boundaries", "Mixed signals", "Conflict", "Decision-making", "Moving on", "Confidence"];
export const GOAL_OPTIONS = ["Understand situations", "Give honest advice", "Help me decide", "Help me communicate", "Remember important context", "Spot patterns", "Help me understand people", "Help me understand myself"];
export const RELATIONSHIP_TYPES = ["Partner", "Dating", "Friend", "Family", "Ex", "Crush", "Colleague"];

export function relIcon(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("partner") || t.includes("dating") || t.includes("crush")) return "❤️";
  if (t.includes("family")) return "🏠";
  return "👤";
}
