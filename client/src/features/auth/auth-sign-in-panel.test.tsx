import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthSignInPanel } from "./auth-sign-in-panel";

describe("AuthSignInPanel", () => {
  it("starts sign-in when the CTA is clicked", async () => {
    const user = userEvent.setup();
    const handleLogin = vi.fn();

    render(<AuthSignInPanel isLoginPending={false} handleLogin={handleLogin} />);

    await user.click(screen.getByRole("button", { name: "Continue to Sign In" }));

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it("shows a pending label while login is in flight", () => {
    const { container } = render(<AuthSignInPanel isLoginPending handleLogin={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Redirecting..." });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(container.innerHTML.includes("min-h-dvh")).toBe(true);
  });
});
