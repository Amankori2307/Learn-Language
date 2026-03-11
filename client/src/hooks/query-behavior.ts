export const QUERY_BEHAVIOR_RULES = {
  auth: {
    userStaleTimeMs: 1000 * 60 * 5,
  },
  quiz: {
    generateStaleTimeMs: 0,
    refetchOnWindowFocus: false,
  },
} as const;
