import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAnalyticsAdapter,
  resetAnalyticsAdapterForTests,
  setAnalyticsAdapterForTests,
  trackAnalyticsEvent,
} from "./analytics";

describe("analytics", () => {
  afterEach(() => {
    resetAnalyticsAdapterForTests();
    vi.unstubAllEnvs();
  });

  it("uses a noop adapter by default", () => {
    expect(() => {
      getAnalyticsAdapter().track("auth_login_started", {});
    }).not.toThrow();
  });

  it("delegates events to the active adapter", () => {
    const track = vi.fn();
    setAnalyticsAdapterForTests({ track });

    trackAnalyticsEvent("profile_updated", { hasAvatar: true });

    expect(track).toHaveBeenCalledWith("profile_updated", { hasAvatar: true });
  });
});
