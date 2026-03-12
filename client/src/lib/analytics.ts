import { getAnalyticsProviderEnv } from "@/config/runtime";

export type AnalyticsProvider = "noop" | "console" | "window-mixpanel";

export type AnalyticsEventName =
  | "auth_login_started"
  | "auth_login_completed"
  | "auth_login_failed"
  | "quiz_session_started"
  | "quiz_answer_submitted"
  | "quiz_session_completed"
  | "clusters_catalog_viewed"
  | "review_transition_completed"
  | "review_bulk_transition_completed"
  | "review_draft_created"
  | "profile_updated";

export type AnalyticsEventProperties = Record<string, unknown>;

type AnalyticsAdapter = {
  track: (event: AnalyticsEventName, properties: AnalyticsEventProperties) => void;
};

declare global {
  interface Window {
    mixpanel?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

function resolveProvider(): AnalyticsProvider {
  const raw = getAnalyticsProviderEnv();
  if (raw === "console") {
    return "console";
  }
  if (raw === "mixpanel" || raw === "window-mixpanel") {
    return "window-mixpanel";
  }
  return "noop";
}

function buildConsoleAdapter(): AnalyticsAdapter {
  return {
    track(event, properties) {
      // Intentional debug-only analytics sink for local verification.
      console.info("[analytics]", event, properties);
    },
  };
}

function buildWindowMixpanelAdapter(): AnalyticsAdapter {
  return {
    track(event, properties) {
      if (typeof window === "undefined") {
        return;
      }
      window.mixpanel?.track(event, properties);
    },
  };
}

function buildNoopAdapter(): AnalyticsAdapter {
  return {
    track() {},
  };
}

function buildAdapter(provider: AnalyticsProvider): AnalyticsAdapter {
  if (provider === "console") {
    return buildConsoleAdapter();
  }
  if (provider === "window-mixpanel") {
    return buildWindowMixpanelAdapter();
  }
  return buildNoopAdapter();
}

let adapter: AnalyticsAdapter | null = null;

export function getAnalyticsAdapter(): AnalyticsAdapter {
  adapter ??= buildAdapter(resolveProvider());
  return adapter;
}

export function resetAnalyticsAdapterForTests() {
  adapter = null;
}

export function setAnalyticsAdapterForTests(nextAdapter: AnalyticsAdapter | null) {
  adapter = nextAdapter;
}

export function trackAnalyticsEvent(
  event: AnalyticsEventName,
  properties: AnalyticsEventProperties = {},
) {
  getAnalyticsAdapter().track(event, properties);
}
