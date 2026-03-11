import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "./auth";

const handleLogin = vi.fn();
let isLoginPending = false;

vi.mock("@/features/auth/use-auth-page-view-model", () => ({
  useAuthPageViewModel: () => ({
    isLoginPending,
    handleLogin,
  }),
}));

describe("AuthPage integration", () => {
  beforeEach(() => {
    isLoginPending = false;
    handleLogin.mockClear();
  });

  it("starts login flow from the sign-in CTA", async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    await user.click(screen.getByRole("button", { name: "Continue to Sign In" }));

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it("passes pending login state through to the sign-in panel", () => {
    isLoginPending = true;

    render(<AuthPage />);

    const button = screen.getByRole("button", { name: "Redirecting..." });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
