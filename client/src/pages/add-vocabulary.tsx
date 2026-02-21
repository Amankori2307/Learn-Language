import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { UserTypeEnum } from "@shared/domain/enums";
import { CreateVocabularyDraftForm } from "@/components/review/create-vocabulary-draft-form";

export default function AddVocabularyPage() {
  const { user } = useAuth();
  const canReview = user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN;

  if (!canReview) {
    return (
      <Layout>
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Review Access Required</h1>
          <p className="text-muted-foreground mt-2">
            Only reviewer/admin roles can add vocabulary drafts.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Vocabulary</h1>
          <p className="text-muted-foreground">
            Add new entries with examples. Items enter the review lifecycle as drafts.
          </p>
        </div>
        <CreateVocabularyDraftForm />
      </div>
    </Layout>
  );
}
