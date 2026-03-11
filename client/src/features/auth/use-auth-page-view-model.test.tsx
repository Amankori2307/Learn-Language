import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthPageViewModel } from "./use-auth-page-view-model";

const setLocation = vi.fn();
const getLoginUrl = vi.fn(() => "http://localhost/api/auth/google");
const setToken = vi.fn();
const readAuthTokenFromUrl = vi.fn(() => null);
const clearAuthTokenFromUrl = vi.fn();

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
  clearAuthTokenFromUrl: () => clearAuthTokenFromUrl(),
}));

function Harness() {
  const { isLoginPending, isBootstrapping, handleLogin } = useAuthPageViewModel();

  return (
    <div>
      <button type="button" onClick={handleLogin}>
        trigger login
      </button>
      <span>{isLoginPending ? "pending" : "idle"}</span>
      <span>{isBootstrapping ? "bootstrapping" : "ready"}</span>
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
    clearAuthTokenFromUrl.mockReset();
  });

  it("boots from a token in the URL and redirects home", async () => {
    readAuthTokenFromUrl.mockReturnValue("jwt-token");

    render(<Harness />);

    expect(screen.getByText("bootstrapping")).toBeTruthy();

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith("jwt-token");
      expect(clearAuthTokenFromUrl).toHaveBeenCalledTimes(1);
      expect(setLocation).toHaveBeenCalledWith("/");
    });
  });

  it("redirects authenticated users away from /auth", async () => {
    authState = { user: { id: "u-1" }, isLoading: false };

    render(<Harness />);

    await waitFor(() => {
      expect(setLocation).toHaveBeenCalledWith("/");
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
    expect(window.location.href).toBe("http://localhost/api/auth/google");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
