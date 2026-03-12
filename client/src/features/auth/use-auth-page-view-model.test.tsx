import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthPageViewModel } from "./use-auth-page-view-model";

const setLocation = vi.fn();
const getLoginUrl = vi.fn(() => "http://localhost/api/auth/google");
const setToken = vi.fn();
const readAuthTokenFromUrl = vi.fn(() => null);
const readAuthErrorFromUrl = vi.fn(() => null);
const clearAuthTokenFromUrl = vi.fn();
const clearAuthErrorFromUrl = vi.fn();

let authState = {
  user: null as null | { id: string },
  isLoading: false,
};

vi.mock("wouter", () => ({
  useLocation: () => ["/auth", setLocation],
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/services/authService", () => ({
  authService: {
    getLoginUrl: () => getLoginUrl(),
    setToken: (token: string) => setToken(token),
  },
}));

vi.mock("@/services/authTokenStorage", () => ({
  readAuthTokenFromUrl: () => readAuthTokenFromUrl(),
  readAuthErrorFromUrl: () => readAuthErrorFromUrl(),
  clearAuthTokenFromUrl: () => clearAuthTokenFromUrl(),
  clearAuthErrorFromUrl: () => clearAuthErrorFromUrl(),
}));

function Harness() {
  const { isLoginPending, isBootstrapping, authError, handleLogin } = useAuthPageViewModel();

  return (
    <div>
      <button type="button" onClick={handleLogin}>
        trigger login
      </button>
      <span>{isLoginPending ? "pending" : "idle"}</span>
      <span>{isBootstrapping ? "bootstrapping" : "ready"}</span>
      <span>{authError?.title ?? "no-error"}</span>
    </div>
  );
}

describe("useAuthPageViewModel", () => {
  beforeEach(() => {
    authState = { user: null, isLoading: false };
    setLocation.mockReset();
    getLoginUrl.mockReset();
    getLoginUrl.mockReturnValue("http://localhost/api/auth/google");
    setToken.mockReset();
    readAuthTokenFromUrl.mockReset();
    readAuthTokenFromUrl.mockReturnValue(null);
    readAuthErrorFromUrl.mockReset();
    readAuthErrorFromUrl.mockReturnValue(null);
    clearAuthTokenFromUrl.mockReset();
    clearAuthErrorFromUrl.mockReset();
  });

  it("boots from a token in the URL and redirects to the dashboard", async () => {
    readAuthTokenFromUrl.mockReturnValue("jwt-token");

    render(<Harness />);

    expect(screen.getByText("bootstrapping")).toBeTruthy();

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith("jwt-token");
      expect(clearAuthTokenFromUrl).toHaveBeenCalledTimes(1);
      expect(setLocation).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects authenticated users away from /auth", async () => {
    authState = { user: { id: "u-1" }, isLoading: false };

    render(<Harness />);

    await waitFor(() => {
      expect(setLocation).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("stays in bootstrapping state while auth is still loading", () => {
    authState = { user: null, isLoading: true };

    render(<Harness />);

    expect(screen.getByText("bootstrapping")).toBeTruthy();
  });

  it("marks login pending and navigates to the login URL", async () => {
    const user = userEvent.setup();

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/auth" },
    });

    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "trigger login" }));

    expect(screen.getByText("pending")).toBeTruthy();
    expect(clearAuthErrorFromUrl).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("http://localhost/api/auth/google");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("surfaces redirect auth errors and clears them from the URL", async () => {
    readAuthErrorFromUrl.mockReturnValue("provider");

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByText("Sign-in failed")).toBeTruthy();
      expect(clearAuthErrorFromUrl).toHaveBeenCalledTimes(1);
    });
  });
});
