import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useProfilePageViewModel } from "@/features/profile/use-profile-page-view-model";
import { SurfaceMessage } from "@/components/ui/page-states";
import { ProfileFormCard } from "@/features/profile/profile-form-card";

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
          <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
            <div className="flex items-center gap-4 pb-2 border-b border-border/40">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                <div className="h-4 w-52 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-24 rounded-xl bg-muted animate-pulse" />
              <div className="h-24 rounded-xl bg-muted animate-pulse" />
            </div>
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-36 rounded bg-muted animate-pulse" />
          </div>
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
