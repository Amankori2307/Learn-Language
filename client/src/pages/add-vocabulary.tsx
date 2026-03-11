import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { UserTypeEnum } from "@shared/domain/enums";
import { ReviewAccessState } from "@/features/review/review-access-state";
import { AddVocabularyPageHeader } from "@/features/review/add-vocabulary-page-header";
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
        <AddVocabularyPageHeader />
        <CreateVocabularyDraftForm />
      </div>
    </Layout>
  );
}
