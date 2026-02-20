import { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useWords } from "@/hooks/use-words";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TutorChatRoleEnum } from "@shared/domain/enums";

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

export default function TutorPage() {
  const { data: words } = useWords();
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatItem[]>([
    { role: TutorChatRoleEnum.TUTOR, text: "Welcome. Write a sentence and I will give vocabulary-focused feedback." },
  ]);

  const knownEnglish = useMemo(() => {
    const set = new Set<string>();
    for (const word of words ?? []) {
      set.add(word.english.toLowerCase());
    }
    return set;
  }, [words]);

  const onSend = () => {
    const value = input.trim();
    if (!value) return;

    const feedback = buildTutorFeedback(value, knownEnglish);
    setChat((prev) => [...prev, { role: TutorChatRoleEnum.USER, text: value }, { role: TutorChatRoleEnum.TUTOR, text: feedback }]);
    setInput("");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h2 className="text-3xl font-bold">Tutor Mode (Text)</h2>
          <p className="text-muted-foreground mt-1">
            Feature-flagged tutor for vocabulary coaching with safe local logic.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 h-[420px] overflow-y-auto space-y-3">
          {chat.map((msg, idx) => (
            <div
              key={`${msg.role}-${idx}`}
              className={`rounded-xl px-4 py-3 text-sm ${msg.role === TutorChatRoleEnum.USER ? "bg-primary/10" : "bg-secondary"}`}
            >
              <span className="font-semibold mr-2">{msg.role === TutorChatRoleEnum.USER ? "You" : "Tutor"}:</span>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a sentence..."
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <Button onClick={onSend}>Send</Button>
        </div>
      </div>
    </Layout>
  );
}
