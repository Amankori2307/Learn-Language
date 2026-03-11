import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import type { useProfilePageViewModel } from "@/features/profile/use-profile-page-view-model";

type ProfileViewModel = ReturnType<typeof useProfilePageViewModel>;

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

export function ProfileFormCard({
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
  isSaving,
  saveError,
  saveSuccess,
}: Pick<
  ProfileViewModel,
  | "profile"
  | "firstName"
  | "setFirstName"
  | "lastName"
  | "setLastName"
  | "avatarUrl"
  | "setAvatarUrl"
  | "avatarPreview"
  | "isDirty"
  | "saveProfile"
  | "isSaving"
  | "saveError"
  | "saveSuccess"
>) {
  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card p-6 md:p-8">
      <div className="flex items-center gap-4 border-b border-border/40 pb-2">
        <Avatar className="h-16 w-16 border border-border">
          <AvatarImage src={avatarPreview} />
          <AvatarFallback>
            {initials(firstName || null, lastName || null, profile.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">
            {[firstName, lastName].filter(Boolean).join(" ") || "Learner"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {profile.email || "No email available"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PendingButton
          onClick={saveProfile}
          disabled={!isDirty}
          pending={isSaving}
          pendingLabel="Saving..."
        >
          Save Profile
        </PendingButton>
        {saveError ? <span className="text-sm text-red-600">Failed to save changes.</span> : null}
        {saveSuccess ? <span className="text-sm text-green-600">Saved.</span> : null}
      </div>
    </div>
  );
}
