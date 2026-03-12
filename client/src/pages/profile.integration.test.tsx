import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./profile";
import { APP_STORAGE_KEYS } from "@shared/domain/constants/app-brand";

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
    window.localStorage.clear();
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

  it("shows profile loading composition while the profile request is pending", () => {
    mockProfileLoading = true;

    const { container } = render(<ProfilePage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("persists quiz confidence preference from the profile toggle", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const toggle = screen.getByRole("switch", { name: "Quiz confidence selector" });
    expect(toggle.getAttribute("data-state")).toBe("unchecked");

    await user.click(toggle);

    expect(window.localStorage.getItem(APP_STORAGE_KEYS.quizConfidenceEnabled)).toBe("true");
  });

  it("keeps the profile form mobile-safe with stacked actions and two-column upgrade classes", () => {
    const { container } = render(<ProfilePage />);

    expect(screen.getByRole("button", { name: "Save Profile" }).className).toContain("sm:w-auto");

    const formCard = container.querySelector(".rounded-2xl.border.border-border\\/50.bg-card");
    expect(formCard?.querySelector(".grid.gap-4.md\\:grid-cols-2")).toBeTruthy();
    expect(formCard?.querySelector(".flex.flex-col.gap-4.border-b.border-border\\/40.pb-3.sm\\:flex-row.sm\\:items-center")).toBeTruthy();
  });
});
