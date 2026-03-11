import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AuthPage from "./auth";

const handleLogin = vi.fn();

vi.mock("@/features/auth/use-auth-page-view-model", () => ({
  useAuthPageViewModel: () => ({
    isLoginPending: false,
    handleLogin,
  }),
}));

describe("AuthPage integration", () => {
  it("starts login flow from the sign-in CTA", async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    await user.click(screen.getByRole("button", { name: "Continue to Sign In" }));

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });
});
