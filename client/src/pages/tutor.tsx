import { Layout } from "@/components/layout";
import { useTutorPageViewModel } from "@/features/tutor/use-tutor-page-view-model";
import { TutorChatPanel } from "@/features/tutor/tutor-chat-panel";

export default function TutorPage() {
  const { input, setInput, chat, sendMessage } = useTutorPageViewModel();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h2 className="text-3xl font-bold">Tutor Mode (Text)</h2>
          <p className="text-muted-foreground mt-1">
            Feature-flagged tutor for vocabulary coaching with safe local logic.
          </p>
        </div>

        <TutorChatPanel input={input} setInput={setInput} chat={chat} sendMessage={sendMessage} />
      </div>
    </Layout>
  );
}
