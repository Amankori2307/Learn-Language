import { Layout } from "@/components/layout";
import { useTutorPageViewModel } from "@/features/tutor/use-tutor-page-view-model";
import { TutorChatPanel } from "@/features/tutor/tutor-chat-panel";
import { TutorPageHeader } from "@/features/tutor/tutor-page-header";

export default function TutorPage() {
  const { input, setInput, chat, sendMessage } = useTutorPageViewModel();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        <TutorPageHeader />

        <TutorChatPanel input={input} setInput={setInput} chat={chat} sendMessage={sendMessage} />
      </div>
    </Layout>
  );
}
