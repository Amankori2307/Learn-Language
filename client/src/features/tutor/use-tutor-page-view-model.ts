import { useMemo, useState } from "react";
import { TutorChatRoleEnum } from "@shared/domain/enums";
import { useWords } from "@/hooks/use-words";

type ChatItem = { role: TutorChatRoleEnum; text: string };

function buildTutorFeedback(input: string, knownEnglish: Set<string>) {
  const tokens = input
    .toLowerCase()
    .split(/[^a-zA-Z]+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return "Try writing a short sentence using words you learned today.";
  }

  const knownMatches = tokens.filter((t) => knownEnglish.has(t));
  const unknown = tokens.filter((t) => !knownEnglish.has(t));

  if (knownMatches.length === 0) {
    return "Good attempt. Try including at least one word from your learned vocabulary list.";
  }

  if (unknown.length === 0) {
    return `Great. You used known vocabulary: ${knownMatches.slice(0, 5).join(", ")}.`;
  }

  return `Nice work. Known words used: ${knownMatches.slice(0, 5).join(", ")}. Review these new words: ${unknown.slice(0, 5).join(", ")}.`;
}

export function useTutorPageViewModel() {
  const wordsQuery = useWords();
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatItem[]>([
    {
      role: TutorChatRoleEnum.TUTOR,
      text: "Welcome. Write a sentence and I will give vocabulary-focused feedback.",
    },
  ]);

  const knownEnglish = useMemo(() => {
    const set = new Set<string>();
    for (const word of wordsQuery.data ?? []) {
      set.add(word.english.toLowerCase());
    }
    return set;
  }, [wordsQuery.data]);

  const sendMessage = () => {
    const value = input.trim();
    if (!value) return;

    const feedback = buildTutorFeedback(value, knownEnglish);
    setChat((prev) => [
      ...prev,
      { role: TutorChatRoleEnum.USER, text: value },
      { role: TutorChatRoleEnum.TUTOR, text: feedback },
    ]);
    setInput("");
  };

  return {
    wordsQuery,
    input,
    setInput,
    chat,
    sendMessage,
  };
}
