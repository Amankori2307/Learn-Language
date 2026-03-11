import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useProfilePageViewModel } from "@/features/profile/use-profile-page-view-model";
import { SurfaceMessage } from "@/components/ui/page-states";
import { ProfileFormCard } from "@/features/profile/profile-form-card";
import { ProfileLoadingCard } from "@/features/profile/profile-loading-card";

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
  } = useProfilePageViewModel();

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your identity and avatar.</p>
        </div>

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
          />
        )}
      </div>
    </Layout>
  );
}
