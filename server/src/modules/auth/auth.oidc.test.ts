import test from "node:test";
import assert from "node:assert/strict";
import {
  getFrontendAuthRedirectWithError,
  getFrontendAuthRedirectWithToken,
} from "./auth.oidc";

test("getFrontendAuthRedirectWithToken falls back to local auth route", () => {
  const redirect = getFrontendAuthRedirectWithToken("jwt-token");
  assert.equal(redirect, "/auth#token=jwt-token");
});

test("getFrontendAuthRedirectWithError falls back to local auth route", () => {
  const redirect = getFrontendAuthRedirectWithError("provider");
  assert.equal(redirect, "/auth?authError=provider");
});
