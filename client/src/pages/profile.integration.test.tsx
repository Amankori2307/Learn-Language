import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./profile";

const mutateAsync = vi.fn().mockResolvedValue(undefined);
const refetch = vi.fn();
const profileData = {
  id: "u-1",
  email: "learner@example.com",
  firstName: "Aman",
  lastName: "K",
  profileImageUrl: "https://example.com/a.png",
  createdAt: null,
  updatedAt: null,
};
let mockProfile = profileData;
let mockProfileLoading = false;
let mockProfileError = false;

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({
    data: mockProfile,
    isLoading: mockProfileLoading,
    isError: mockProfileError,
    refetch,
  }),
  useUpdateProfile: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

describe("ProfilePage integration", () => {
  beforeEach(() => {
    mockProfile = profileData;
    mockProfileLoading = false;
    mockProfileError = false;
    mutateAsync.mockClear();
    refetch.mockClear();
  });

  it("submits updated profile fields from UI controls", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const saveButton = screen.getByRole("button", { name: "Save Profile" });
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);

    const firstNameInput = screen.getByLabelText("First Name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Amanpreet");

    await waitFor(() => {
      expect((saveButton as HTMLButtonElement).disabled).toBe(false);
    });
    await user.click(saveButton);

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith({
      firstName: "Amanpreet",
      lastName: "K",
      profileImageUrl: "https://example.com/a.png",
    });
  });

  it("shows a retryable error surface when the profile request fails", async () => {
    const user = userEvent.setup();
    mockProfile = null as unknown as typeof profileData;
    mockProfileError = true;

    render(<ProfilePage />);

    expect(screen.getByText("Could not load profile")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
