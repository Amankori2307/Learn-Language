import assert from "node:assert/strict";
import test from "node:test";
import {
  getPublicLanguagePage,
  getSampleWordsForLanguage,
  getTopClustersForLanguage,
  getTopPublicTopics,
} from "../shared/domain/public-seo-content";

test("public Telugu page content remains available", () => {
  const teluguPage = getPublicLanguagePage("telugu");

  assert.ok(teluguPage);
  assert.equal(teluguPage?.slug, "telugu");
  assert.match(teluguPage?.title ?? "", /Telugu/i);
});

test("public Telugu samples expose real seed words", () => {
  const words = getSampleWordsForLanguage("telugu", 6);

  assert.equal(words.length, 6);
  assert.ok(words.every((word) => word.language === "telugu"));
  assert.ok(words.every((word) => word.originalScript.length > 0));
  assert.ok(words.every((word) => word.english.length > 0));
});

test("public Telugu cluster summaries remain populated", () => {
  const clusters = getTopClustersForLanguage("telugu", 6);

  assert.equal(clusters.length, 6);
  assert.ok(clusters.every((cluster) => cluster.wordCount > 0));
  assert.ok(clusters.every((cluster) => cluster.description.length > 0));
});

test("public topic summaries remain populated", () => {
  const topics = getTopPublicTopics(10);

  assert.equal(topics.length, 10);
  assert.ok(topics.every((topic) => topic.wordCount > 0));
  assert.ok(topics.every((topic) => topic.description.length > 0));
});
