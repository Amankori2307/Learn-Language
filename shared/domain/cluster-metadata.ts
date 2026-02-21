export const CLUSTER_DESCRIPTION_MAP: Record<string, string> = {
  greetings: "High-frequency greetings and polite openings used in daily conversations.",
  "daily-use": "Core words and phrases you will encounter every day.",
  "daily-actions": "Action verbs and commands for common day-to-day tasks.",
  "question-words": "Question starters to ask for people, places, time, and reasons.",
  time: "Time-related vocabulary for schedules, planning, and sequencing events.",
  numbers: "Foundational number vocabulary for counting, prices, and quantities.",
  people: "Words for people, relationships, and social references.",
  family: "Family member vocabulary used in introductions and conversations at home.",
  travel: "Navigation and movement vocabulary for commuting and directions.",
  places: "Location vocabulary for landmarks, rooms, and orientation.",
  home: "Home and household vocabulary for daily routines.",
  shopping: "Practical vocabulary for buying items, asking price, and transactions.",
  food: "Core food vocabulary used in meals and market contexts.",
  "food-and-drink": "Food and drink words used for ordering and preferences.",
  education: "School and learning vocabulary for study situations.",
  descriptions: "Adjectives and adverbs for describing quality, speed, and state.",
  "core-grammar": "High-value grammar helper words that shape sentence meaning.",
  verbs: "Verb-heavy cluster for building sentence actions.",
  nouns: "Noun vocabulary for objects, people, and places.",
  pronouns: "Pronouns used for subjects, objects, and references.",
  adjectives: "Describing words for attributes and comparisons.",
  adverbs: "Modifier words for manner, time, and intensity.",
  phrases: "Multi-word expressions used as complete communication units.",
  numerals: "Number-form vocabulary and counting forms.",
};

export function getClusterDescription(name: string): string {
  const key = name.trim().toLowerCase();
  return CLUSTER_DESCRIPTION_MAP[key] ?? "Practical vocabulary cluster for focused learning practice.";
}

export function isGenericClusterDescription(description: string | null | undefined): boolean {
  if (!description) return true;
  const normalized = description.trim().toLowerCase();
  return normalized.endsWith("imported cluster");
}
