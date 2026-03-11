import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useProfilePageViewModel } from "@/features/profile/use-profile-page-view-model";
import { SurfaceMessage } from "@/components/ui/page-states";
import { ProfileFormCard } from "@/features/profile/profile-form-card";
import { ProfileLoadingCard } from "@/features/profile/profile-loading-card";
import { ProfilePageHeader } from "@/features/profile/profile-page-header";

export default function ProfilePage() {
  const {
    profile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    avatarUrl,
    setAvatarUrl,
    avatarPreview,
    isDirty,
    saveProfile,
    isLoading,
    isError,
    retry,
    isSaving,
    saveError,
    saveSuccess,
    quizConfidenceEnabled,
    setQuizConfidenceEnabled,
  } = useProfilePageViewModel();

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <ProfilePageHeader />

        {isLoading ? (
          <ProfileLoadingCard />
        ) : isError || !profile ? (
          <SurfaceMessage
            title="Could not load profile"
            description="The profile request failed before the form could be populated."
            tone="error"
            action={
              <Button variant="outline" onClick={retry}>
                Retry
              </Button>
            }
          />
        ) : (
          <ProfileFormCard
            profile={profile}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            avatarPreview={avatarPreview}
            isDirty={isDirty}
            saveProfile={saveProfile}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            quizConfidenceEnabled={quizConfidenceEnabled}
            setQuizConfidenceEnabled={setQuizConfidenceEnabled}
          />
        )}
      </div>
    </Layout>
  );
}
