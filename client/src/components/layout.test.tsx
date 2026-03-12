import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Layout } from "./layout";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLocation: () => ["/dashboard", vi.fn()],
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: {
      firstName: "Aman",
      lastName: "Kori",
      email: "aman@example.com",
      role: "admin",
      profileImageUrl: null,
    },
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-language", () => ({
  useLearningLanguage: () => ({
    language: "telugu",
    setLanguage: vi.fn(),
    options: [{ value: "telugu", label: "Telugu" }],
  }),
}));

describe("Layout", () => {
  it("uses design-system shell sizing tokens for desktop and mobile navigation", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Layout>
        <div>Page Content</div>
      </Layout>,
    );

    expect(screen.getByText("Page Content")).toBeTruthy();
    expect(container.querySelector(".w-\\[var\\(--shell-sidebar-width\\)\\]")).toBeTruthy();
    expect(container.querySelector(".md\\:ml-\\[var\\(--shell-sidebar-width\\)\\]")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(container.querySelector(".w-\\[var\\(--shell-sidebar-width-collapsed\\)\\]")).toBeTruthy();
    expect(
      container.querySelector(".md\\:ml-\\[var\\(--shell-sidebar-width-collapsed\\)\\]"),
    ).toBeTruthy();
  });
});
