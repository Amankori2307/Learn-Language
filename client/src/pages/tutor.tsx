import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { SurfaceMessage } from "@/components/ui/page-states";
import { useTutorPageViewModel } from "@/features/tutor/use-tutor-page-view-model";
import { TutorChatPanel } from "@/features/tutor/tutor-chat-panel";
import { TutorPageHeader } from "@/features/tutor/tutor-page-header";

export default function TutorPage() {
  const { input, setInput, chat, sendMessage, isLoading, isError, hasWords, retry } =
    useTutorPageViewModel();

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-4">
        <TutorPageHeader />

        {isLoading ? (
          <SurfaceMessage
            title="Preparing tutor context"
            description="Loading your learned vocabulary so the tutor can give grounded feedback."
          />
        ) : isError ? (
          <SurfaceMessage
            title="Could not load tutor context"
            description="The tutor could not read your vocabulary list, so feedback would be unreliable."
            tone="error"
            action={
              <Button variant="outline" onClick={() => void retry()}>
                Retry
              </Button>
            }
          />
        ) : !hasWords ? (
          <SurfaceMessage
            title="No tutor context yet"
            description="Learn a few words first so the tutor can coach you against your saved vocabulary."
            tone="empty"
          />
        ) : (
          <TutorChatPanel
            input={input}
            setInput={setInput}
            chat={chat}
            sendMessage={sendMessage}
          />
        )}
      </div>
    </Layout>
  );
}
