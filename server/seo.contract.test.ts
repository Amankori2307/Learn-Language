import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "../app/sitemap";
import {
  APP_GOOGLE_TAG_MANAGER_ID,
  APP_SITE_URL,
  getSeoRouteDefinition,
  SEO_ROUTE_DEFINITIONS,
} from "../shared/domain/constants/seo";

test("SEO route definitions include metadata for every app route", () => {
  const expectedRoutes = [
    "/",
    "/features",
    "/how-it-works",
    "/mastery",
    "/languages/telugu",
    "/topics",
    "/auth",
    "/dashboard",
    "/quiz",
    "/clusters",
    "/leaderboard",
    "/profile",
    "/history",
    "/analytics",
    "/analytics/words",
    "/review",
    "/review/add",
    "/contextual",
    "/tutor",
  ];

  assert.deepEqual(
    SEO_ROUTE_DEFINITIONS.map((route) => route.path),
    expectedRoutes,
  );

  for (const route of expectedRoutes) {
    const definition = getSeoRouteDefinition(route);
    assert.ok(definition, `missing SEO route definition for ${route}`);
    assert.ok(definition?.title.length);
    assert.ok(definition?.description.length);
  }
});

test("sitemap only contains indexable public routes", () => {
  assert.deepEqual(sitemap(), [
    {
      url: `${APP_SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_SITE_URL}/features`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${APP_SITE_URL}/how-it-works`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${APP_SITE_URL}/mastery`,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${APP_SITE_URL}/languages/telugu`,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${APP_SITE_URL}/topics`,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${APP_SITE_URL}/auth`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]);
});

test("GTM container id remains configured", () => {
  assert.equal(APP_GOOGLE_TAG_MANAGER_ID, "GTM-NTPX5G8P");
});
