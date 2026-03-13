import test from "node:test";
import assert from "node:assert/strict";
import { api, errorSchemas } from "./routes";
import {
  LanguageEnum,
  PartOfSpeechEnum,
  QuizDirectionEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
  VocabularyTagEnum,
} from "./domain/enums";

function success<T>(data: T) {
  return {
    success: true as const,
    error: false as const,
    data,
    message: "OK",
    requestId: "req-contract",
  };
}

test("quiz generate contract accepts expected payload", () => {
  const payload = [
    {
      wordId: 1,
      type: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
      questionText: "nenu",
      audioUrl: null,
      options: [
        { id: 1, text: "I" },
        { id: 2, text: "You" },
      ],
    },
  ];

  const parsed = api.quiz.generate.responses[200].parse(success(payload));
  assert.equal(parsed.data[0].wordId, 1);
});

test("quiz generate input accepts all supported quiz modes", () => {
  const modes = [
    QuizModeEnum.DAILY_REVIEW,
    QuizModeEnum.NEW_WORDS,
    QuizModeEnum.CLUSTER,
    QuizModeEnum.WEAK_WORDS,
    QuizModeEnum.LISTEN_IDENTIFY,
    QuizModeEnum.COMPLEX_WORKOUT,
  ];

  for (const mode of modes) {
    const parsed = api.quiz.generate.input.parse({
      mode,
      count: 10,
      language: LanguageEnum.TELUGU,
    });
    assert.equal(parsed.mode, mode);
  }
});

test("quiz submit contract accepts answer submissions without learner confidence", () => {
  const parsed = api.quiz.submit.input.parse({
    wordId: 1,
    selectedOptionId: 2,
    responseTimeMs: 1400,
  });

  assert.equal(parsed.wordId, 1);
  assert.equal(parsed.selectedOptionId, 2);
});

test("quiz submit contract rejects sentence-style question types in words-first mode", () => {
  assert.throws(() => {
    api.quiz.submit.input.parse({
      wordId: 1,
      selectedOptionId: 2,
      questionType: "fill_in_blank",
    });
  });
});

test("quiz submit response contract requires examples array with triplet fields", () => {
  const payload = {
    isCorrect: true,
    correctAnswer: {
      id: 1,
      originalScript: "neeru",
      transliteration: "neeru",
      english: "water",
      partOfSpeech: "noun",
      difficulty: 1,
      difficultyLevel: "beginner",
      frequencyScore: 0.9,
      cefrLevel: "A1",
      audioUrl: null,
      exampleSentences: ["nenu neeru taaganu."],
      tags: [],
      reviewStatus: ReviewStatusEnum.APPROVED,
      submittedBy: null,
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      sourceUrl: null,
      sourceCapturedAt: null,
      createdAt: null,
    },
    examples: [
      {
        originalScript: "nenu neeru taaganu.",
        pronunciation: "nenu neeru taagaanu",
        meaning: "I drank water.",
      },
    ],
    progressUpdate: {
      streak: 1,
      masteryLevel: 1,
      nextReview: "2026-02-21T10:00:00.000Z",
    },
  };

  const parsed = api.quiz.submit.responses[200].parse(success(payload));
  assert.equal(parsed.data.examples[0].meaning, "I drank water.");
});

test("stats contract accepts direction metrics", () => {
  const payload = {
    totalWords: 300,
    mastered: 10,
    learning: 200,
    weak: 50,
    streak: 4,
    xp: 120,
    recognitionAccuracy: 72.5,
    recallAccuracy: 61.2,
    sourceToTargetStrength: 0.42,
    targetToSourceStrength: 0.68,
    recommendedDirection: QuizDirectionEnum.SOURCE_TO_TARGET,
  };

  const parsed = api.stats.get.responses[200].parse(success(payload));
  assert.equal(parsed.data.recommendedDirection, QuizDirectionEnum.SOURCE_TO_TARGET);
});

test("leaderboard contract accepts ranked entries", () => {
  const payload = {
    items: [
      {
        rank: 1,
        userId: "u-1",
        firstName: "Aman",
        lastName: "K",
        email: "a@example.com",
        profileImageUrl: null,
        xp: 180,
        streak: 5,
        attempts: 24,
        accuracy: 83.3,
      },
    ],
    page: 1,
    limit: 25,
    total: 1,
    currentUserEntry: {
      rank: 1,
      userId: "u-1",
      firstName: "Aman",
      lastName: "K",
      email: "a@example.com",
      profileImageUrl: null,
      xp: 180,
      streak: 5,
      attempts: 24,
      accuracy: 83.3,
    },
  };

  const parsed = api.leaderboard.list.responses[200].parse(success(payload));
  assert.equal(parsed.data.items[0].rank, 1);
  assert.equal(parsed.data.currentUserEntry?.userId, "u-1");
});

test("attempt history contract accepts payload", () => {
  const payload = {
    items: [
      {
        id: 99,
        wordId: 1,
        isCorrect: true,
        confidenceLevel: 3,
        direction: QuizDirectionEnum.SOURCE_TO_TARGET,
        questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
        responseTimeMs: 1820,
        createdAt: "2026-02-20T12:00:00.000Z",
        word: {
          language: LanguageEnum.TELUGU,
          originalScript: "neeru",
          transliteration: "neeru",
          english: "water",
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
    summary: {
      total: 1,
      correct: 1,
      accuracy: 100,
    },
  };

  const parsed = api.attempts.history.responses[200].parse(success(payload));
  assert.equal(parsed.data.items[0].wordId, 1);
});

test("profile update contract rejects invalid avatar URL", () => {
  assert.throws(() => {
    api.auth.profile.update.input.parse({
      firstName: "Aman",
      profileImageUrl: "not-a-url",
    });
  });
});

test("shared error schemas accept rate-limited payloads", () => {
  const parsed = errorSchemas.rateLimited.parse({
    success: false,
    error: true,
    data: null,
    code: "RATE_LIMITED",
    message: "Too many requests",
    requestId: "req-rate-limited",
  });

  assert.equal(parsed.code, "RATE_LIMITED");
});

test("audio resolve contract validates and accepts cached miss payload", () => {
  const input = api.audio.resolve.input.parse({
    language: LanguageEnum.TELUGU,
    text: "నమస్తే",
  });
  assert.equal(input.language, LanguageEnum.TELUGU);

  const output = api.audio.resolve.responses[200].parse(success({
    audioUrl: null,
    source: "unavailable",
    cached: false,
  }));
  assert.equal(output.data.cached, false);
});

test("review queue contract accepts pending review payload", () => {
  const payload = {
    items: [
      {
        id: 10,
        language: LanguageEnum.TELUGU,
        originalScript: "namaste",
        transliteration: "namaste",
        english: "hello",
        partOfSpeech: "phrase",
        reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
        sourceUrl: null,
        sourceCapturedAt: null,
        submittedBy: null,
        submittedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        reviewerConfidenceScore: 4,
        requiresSecondaryReview: false,
        disagreementStatus: ReviewDisagreementStatusEnum.NONE,
      },
    ],
    page: 1,
    limit: 50,
    total: 1,
  };

  const parsed = api.review.queue.responses[200].parse(success(payload));
  assert.equal(parsed.data.items[0].reviewStatus, ReviewStatusEnum.PENDING_REVIEW);
});

test("review transition contract rejects invalid status", () => {
  assert.throws(() => {
    api.review.transition.input.parse({
      toStatus: "published",
    });
  });
});

test("review transition contract accepts governance v2 metadata", () => {
  const parsed = api.review.transition.input.parse({
    toStatus: ReviewStatusEnum.PENDING_REVIEW,
    reviewerConfidenceScore: 2,
    requiresSecondaryReview: true,
    disagreementStatus: ReviewDisagreementStatusEnum.FLAGGED,
  });
  assert.equal(parsed.toStatus, ReviewStatusEnum.PENDING_REVIEW);
  assert.equal(parsed.reviewerConfidenceScore, 2);
  assert.equal(parsed.requiresSecondaryReview, true);
});

test("review bulk transition contract accepts payload", () => {
  const parsed = api.review.bulkTransition.input.parse({
    ids: [1, 2, 3],
    toStatus: ReviewStatusEnum.APPROVED,
    notes: "Looks good",
    reviewerConfidenceScore: 5,
    requiresSecondaryReview: true,
    disagreementStatus: ReviewDisagreementStatusEnum.FLAGGED,
  });
  assert.equal(parsed.ids.length, 3);
});

test("review history contract accepts payload", () => {
  const payload = {
    word: {
      id: 1,
      language: LanguageEnum.TELUGU,
      originalScript: "namaste",
      transliteration: "namaste",
      english: "hello",
      reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
      sourceUrl: null,
      sourceCapturedAt: null,
      reviewNotes: null,
      reviewerConfidenceScore: 3,
      requiresSecondaryReview: true,
      disagreementStatus: ReviewDisagreementStatusEnum.FLAGGED,
    },
    clusters: [{ id: 1, name: "daily-use", type: "semantic" }],
    relatedClusterWords: [
      {
        id: 2,
        originalScript: "శుభోదయం",
        transliteration: "shubhodhayam",
        english: "good morning",
        reviewStatus: ReviewStatusEnum.APPROVED,
      },
    ],
    events: [
      {
        id: 10,
        fromStatus: ReviewStatusEnum.DRAFT,
        toStatus: ReviewStatusEnum.PENDING_REVIEW,
        changedBy: "u-1",
        notes: "submitted",
        sourceUrl: "https://example.com/source",
        sourceCapturedAt: "2026-02-20T11:00:00.000Z",
        createdAt: null,
      },
    ],
  };

  const parsed = api.review.history.responses[200].parse(success(payload));
  assert.equal(parsed.data.word.id, 1);
  assert.equal(parsed.data.events.length, 1);
});

test("review conflicts contract accepts flagged queue payload", () => {
  const payload = [
    {
      id: 22,
      language: LanguageEnum.TELUGU,
      originalScript: "vandana",
      transliteration: "vandana",
      english: "greetings",
      partOfSpeech: "noun",
      reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
      reviewerConfidenceScore: 2,
      requiresSecondaryReview: true,
      disagreementStatus: ReviewDisagreementStatusEnum.FLAGGED,
      reviewNotes: "Needs second opinion",
      submittedAt: "2026-02-21T10:00:00.000Z",
      reviewedAt: "2026-02-21T12:00:00.000Z",
    },
  ];
  const parsed = api.review.conflicts.responses[200].parse(success(payload));
  assert.equal(parsed.data[0].disagreementStatus, ReviewDisagreementStatusEnum.FLAGGED);
});

test("review resolve conflict contract accepts payload", () => {
  const input = api.review.resolveConflict.input.parse({
    toStatus: ReviewStatusEnum.APPROVED,
    notes: "Second reviewer approved this entry",
    reviewerConfidenceScore: 4,
  });
  assert.equal(input.toStatus, ReviewStatusEnum.APPROVED);
  assert.equal(input.reviewerConfidenceScore, 4);
});

test("review submit draft contract accepts optional cluster links", () => {
  const parsed = api.review.submitDraft.input.parse({
    language: LanguageEnum.TELUGU,
    originalScript: "ప్రేమ",
    pronunciation: "prema",
    english: "love",
    partOfSpeech: "noun",
    clusterIds: [1, 2],
    tags: ["manual-draft"],
    examples: [
      {
        originalScript: "ఆమె ప్రేమతో మాట్లాడింది.",
        pronunciation: "aame premato maatladindi",
        englishSentence: "She spoke with love.",
        contextTag: "daily-use",
        difficulty: 1,
      },
    ],
  });
  assert.equal(parsed.clusterIds?.length, 2);
});

test("admin srs drift contract accepts alert summary payload", () => {
  const payload = {
    generatedAt: "2026-02-21T12:00:00.000Z",
    overdueCount: 120,
    totalTracked: 300,
    overdueRatio: 0.4,
    highIntervalCount: 20,
    highIntervalRatio: 0.0667,
    emptyReviewDays: 2,
    alerts: [
      {
        code: "overdue_growth",
        severity: "warning",
        message: "Overdue queue exceeds 35% of tracked progress rows.",
      },
    ],
  };
  const parsed = api.admin.srsDrift.responses[200].parse(success(payload));
  assert.equal(parsed.data.alerts[0].code, "overdue_growth");
});

test("admin vocab export contract accepts repo-style payload", () => {
  const payload = {
    generatedAt: "2026-03-13T06:00:00.000Z",
    words: [
      {
        key: "telugu::namaste::hello",
        language: LanguageEnum.TELUGU,
        originalScript: "నమస్తే",
        transliteration: "namaste",
        english: "hello",
        partOfSpeech: PartOfSpeechEnum.PHRASE,
        difficulty: 1,
        difficultyLevel: "beginner",
        frequencyScore: 0.9,
        cefrLevel: "A1",
        tags: [VocabularyTagEnum.MODEL_SEED],
        clusters: ["greetings"],
        source: {
          type: "model-knowledge",
          generatedAt: "2026-03-13T06:00:00.000Z",
          reviewStatus: ReviewStatusEnum.APPROVED,
        },
      },
    ],
    sentences: [
      {
        language: LanguageEnum.TELUGU,
        originalScript: "నమస్తే, మీరు ఎలా ఉన్నారు?",
        pronunciation: "Namastee, meeru elaa unnaaru?",
        english: "Hello, how are you?",
        contextTag: "daily-use",
        difficulty: 1,
        wordRefs: ["telugu::namaste::hello"],
      },
    ],
  };

  const parsed = api.admin.vocabExport.responses[200].parse(success(payload));
  assert.equal(parsed.data.words[0]?.key, "telugu::namaste::hello");
  assert.equal(parsed.data.sentences[0]?.wordRefs[0], "telugu::namaste::hello");
});
