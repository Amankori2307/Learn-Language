import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewStatusEnum } from "@shared/domain/enums";
import {
  reviewHistoryQueryKey,
  reviewQueueQueryPrefix,
  useBulkTransitionReview,
  useTransitionReview,
} from "./use-review";

const invalidateQueries = vi.fn();
const useMutationMock = vi.fn();
const transitionMock = vi.fn();
const bulkTransitionMock = vi.fn();
const trackAnalyticsEventMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: (options: unknown) => useMutationMock(options),
  useQueryClient: () => ({
    invalidateQueries,
  }),
}));

vi.mock("@/services/reviewService", () => ({
  reviewService: {
    transition: (...args: unknown[]) => transitionMock(...args),
    bulkTransition: (...args: unknown[]) => bulkTransitionMock(...args),
  },
}));

vi.mock("@/lib/analytics", () => ({
  trackAnalyticsEvent: (...args: unknown[]) => trackAnalyticsEventMock(...args),
}));

describe("useReview invalidation", () => {
  beforeEach(() => {
    invalidateQueries.mockReset();
    transitionMock.mockReset();
    bulkTransitionMock.mockReset();
    trackAnalyticsEventMock.mockReset();
    useMutationMock.mockImplementation((options) => options);
  });

  it("invalidates queue and only the transitioned word history on single review transition", async () => {
    transitionMock.mockResolvedValue({ id: 42, reviewStatus: ReviewStatusEnum.APPROVED });
    const mutation = useTransitionReview();

    await mutation.mutationFn({
      id: 42,
      toStatus: ReviewStatusEnum.APPROVED,
      notes: "Looks good",
    });
    mutation.onSuccess?.({ id: 42, reviewStatus: ReviewStatusEnum.APPROVED }, {
      id: 42,
      toStatus: ReviewStatusEnum.APPROVED,
      notes: "Looks good",
    });

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: reviewQueueQueryPrefix(),
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: reviewHistoryQueryKey(42),
    });
  });

  it("invalidates queue and each touched review history on bulk review transition", async () => {
    bulkTransitionMock.mockResolvedValue({ updated: 2, skipped: 0 });
    const mutation = useBulkTransitionReview();

    await mutation.mutationFn({
      ids: [12, 19],
      toStatus: ReviewStatusEnum.APPROVED,
      notes: "Bulk approved",
    });
    mutation.onSuccess?.({ updated: 2, skipped: 0 }, {
      ids: [12, 19],
      toStatus: ReviewStatusEnum.APPROVED,
      notes: "Bulk approved",
    });

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: reviewQueueQueryPrefix(),
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: reviewHistoryQueryKey(12),
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: reviewHistoryQueryKey(19),
    });
  });
});
