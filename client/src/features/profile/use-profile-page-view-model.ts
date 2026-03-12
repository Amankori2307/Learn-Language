import { useEffect, useMemo, useState } from "react";
import { useQuizConfidencePreference } from "@/hooks/use-quiz-confidence-preference";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { buildAvatarUrl } from "@/lib/avatar";

export function useProfilePageViewModel() {
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const quizConfidencePreference = useQuizConfidencePreference();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!profileQuery.data) return;
    setFirstName(profileQuery.data.firstName ?? "");
    setLastName(profileQuery.data.lastName ?? "");
    setAvatarUrl(profileQuery.data.profileImageUrl ?? "");
  }, [profileQuery.data]);

  const avatarPreview = useMemo(
    () =>
      buildAvatarUrl({
        profileImageUrl: avatarUrl.trim(),
        firstName: firstName || profileQuery.data?.firstName,
        lastName: lastName || profileQuery.data?.lastName,
        email: profileQuery.data?.email,
      }),
    [avatarUrl, firstName, lastName, profileQuery.data],
  );

  const isDirty = profileQuery.data
    ? firstName !== (profileQuery.data.firstName ?? "") ||
      lastName !== (profileQuery.data.lastName ?? "") ||
      avatarUrl !== (profileQuery.data.profileImageUrl ?? "")
    : false;

  const saveProfile = async () => {
    await updateProfile.mutateAsync({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      profileImageUrl: avatarUrl.trim(),
    });
  };

  return {
    profile: profileQuery.data ?? null,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    avatarUrl,
    setAvatarUrl,
    avatarPreview,
    isDirty,
    saveProfile,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError || !profileQuery.data,
    retry: () => profileQuery.refetch(),
    isSaving: updateProfile.isPending,
    saveError: updateProfile.isError,
    saveSuccess: updateProfile.isSuccess && !updateProfile.isPending,
    quizConfidenceEnabled: quizConfidencePreference.enabled,
    setQuizConfidenceEnabled: quizConfidencePreference.setEnabled,
  };
}
