import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TutorChatRoleEnum } from "@shared/domain/enums";

type TutorMessage = {
  role: TutorChatRoleEnum;
  text: string;
};

export function TutorChatPanel({
  input,
  setInput,
  chat,
  sendMessage,
}: {
  input: string;
  setInput: (value: string) => void;
  chat: TutorMessage[];
  sendMessage: () => void;
}) {
  return (
    <>
      <div className="h-[var(--pane-tutor-chat-height)] space-y-3 overflow-y-auto rounded-2xl border border-border/50 bg-card p-4">
        {chat.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`rounded-xl px-4 py-3 text-sm ${msg.role === TutorChatRoleEnum.USER ? "bg-primary/10" : "bg-secondary"}`}
          >
            <span className="mr-2 font-semibold">
              {msg.role === TutorChatRoleEnum.USER ? "You" : "Tutor"}:
            </span>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className="flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a sentence..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <Button className="w-full sm:w-auto" onClick={sendMessage}>
          Send
        </Button>
      </div>
    </>
  );
}
