import { Layout } from "@/components/layout";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildAvatarUrl } from "@/lib/avatar";

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
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setAvatarUrl(profile.profileImageUrl ?? "");
  }, [profile]);

  const avatarPreview = useMemo(() => {
    return buildAvatarUrl({
      profileImageUrl: avatarUrl.trim(),
      firstName: firstName || profile?.firstName,
      lastName: lastName || profile?.lastName,
      email: profile?.email,
    });
  }, [avatarUrl, firstName, lastName, profile]);
  const isDirty = profile
    ? firstName !== (profile.firstName ?? "") ||
      lastName !== (profile.lastName ?? "") ||
      avatarUrl !== (profile.profileImageUrl ?? "")
    : false;

  const onSave = async () => {
    await updateProfile.mutateAsync({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      profileImageUrl: avatarUrl.trim(),
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your identity and avatar.</p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">Loading profile...</div>
        ) : isError || !profile ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-red-700 font-medium">Could not load profile.</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4 pb-2 border-b border-border/40">
              <Avatar className="h-16 w-16 border border-border">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>{initials(firstName || null, lastName || null, profile.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-lg truncate">{[firstName, lastName].filter(Boolean).join(" ") || "Learner"}</p>
                <p className="text-sm text-muted-foreground truncate">{profile.email || "No email available"}</p>
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
              <Button onClick={onSave} disabled={!isDirty || updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
              {updateProfile.isError && (
                <span className="text-sm text-red-600">Failed to save changes.</span>
              )}
              {updateProfile.isSuccess && !updateProfile.isPending && (
                <span className="text-sm text-green-600">Saved.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
