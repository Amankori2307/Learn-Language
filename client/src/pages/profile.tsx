import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfilePageViewModel } from "@/features/profile/use-profile-page-view-model";
import { PendingButton } from "@/components/ui/pending-button";
import { SurfaceMessage } from "@/components/ui/page-states";

function initials(firstName: string | null, lastName: string | null, email: string | null) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "U").toUpperCase();
}

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
          <div className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4 pb-2 border-b border-border/40">
              <Avatar className="h-16 w-16 border border-border">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>
                  {initials(firstName || null, lastName || null, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-lg truncate">
                  {[firstName, lastName].filter(Boolean).join(" ") || "Learner"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {profile.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use initials avatar fallback.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <PendingButton
                onClick={saveProfile}
                disabled={!isDirty}
                pending={isSaving}
                pendingLabel="Saving..."
              >
                Save Profile
              </PendingButton>
              {saveError && (
                <span className="text-sm text-red-600">Failed to save changes.</span>
              )}
              {saveSuccess && (
                <span className="text-sm text-green-600">Saved.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
