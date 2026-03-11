import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { UserTypeEnum } from "@shared/domain/enums";
import { ReviewAccessState } from "@/features/review/review-access-state";
import { CreateVocabularyDraftForm } from "@/features/review/create-vocabulary-draft-form";

export default function AddVocabularyPage() {
  const { user } = useAuth();
  const canReview = user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN;

  if (!canReview) {
    return (
      <Layout>
        <ReviewAccessState description="Only reviewer/admin roles can add vocabulary drafts." />
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
