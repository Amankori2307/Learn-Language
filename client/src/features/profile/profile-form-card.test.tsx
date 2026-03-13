import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileFormCard } from "./profile-form-card";

describe("ProfileFormCard", () => {
  it("renders fallback initials and forwards edited profile values", async () => {
    const user = userEvent.setup();
    const setFirstName = vi.fn();
    const setLastName = vi.fn();
    const setAvatarUrl = vi.fn();
    const saveProfile = vi.fn();

    render(
      <ProfileFormCard
        profile={{
          id: "u-1",
          email: "learner@example.com",
          firstName: null,
          lastName: null,
          profileImageUrl: null,
          createdAt: null,
          updatedAt: null,
        }}
        firstName=""
        setFirstName={setFirstName}
        lastName=""
        setLastName={setLastName}
        avatarUrl=""
        setAvatarUrl={setAvatarUrl}
        avatarPreview=""
        isDirty
        saveProfile={saveProfile}
        isSaving={false}
        saveError={false}
        saveSuccess={false}
      />,
    );

    expect(screen.getByText("L")).toBeTruthy();

    await user.type(screen.getByLabelText("First Name"), "Aman");
    await user.type(screen.getByLabelText("Last Name"), "K");
    await user.type(screen.getByLabelText("Avatar URL"), "https://example.com/avatar.png");
    await user.click(screen.getByRole("button", { name: "Save Profile" }));

    expect(setFirstName).toHaveBeenCalled();
    expect(setLastName).toHaveBeenCalled();
    expect(setAvatarUrl).toHaveBeenCalled();
    expect(saveProfile).toHaveBeenCalledTimes(1);
  });

  it("shows pending and result messaging", () => {
    render(
      <ProfileFormCard
        profile={{
          id: "u-1",
          email: "learner@example.com",
          firstName: "Aman",
          lastName: "K",
          profileImageUrl: null,
          createdAt: null,
          updatedAt: null,
        }}
        firstName="Aman"
        setFirstName={vi.fn()}
        lastName="K"
        setLastName={vi.fn()}
        avatarUrl=""
        setAvatarUrl={vi.fn()}
        avatarPreview=""
        isDirty
        saveProfile={vi.fn()}
        isSaving
        saveError
        saveSuccess={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Saving..." })).toBeTruthy();
    expect(screen.getByText("Failed to save changes.")).toBeTruthy();
  });
});
