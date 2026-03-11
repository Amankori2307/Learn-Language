import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { UserTypeEnum } from "@shared/domain/enums";
import { ReviewAccessState } from "@/features/review/review-access-state";
import { AddVocabularyPageHeader } from "@/features/review/add-vocabulary-page-header";
import {
  CreateVocabularyDraftFormContent,
} from "@/features/review/create-vocabulary-draft-form";
import { useCreateVocabularyDraftForm } from "@/features/review/use-create-vocabulary-draft-form";
import { SurfaceMessage } from "@/components/ui/page-states";

function AddVocabularyPageContent() {
  const draftForm = useCreateVocabularyDraftForm();

  return (
    <div className="space-y-6">
      <AddVocabularyPageHeader />
      {draftForm.availableClustersQuery.isLoading ? (
        <SurfaceMessage
          title="Loading draft form"
          description="Fetching clusters so new vocabulary can be linked into the right review groups."
        />
      ) : (
        <CreateVocabularyDraftFormContent viewModel={draftForm} />
      )}
    </div>
  );
}

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
      <AddVocabularyPageContent />
    </Layout>
  );
}
