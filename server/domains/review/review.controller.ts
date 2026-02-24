import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import { requireReviewer } from "../../auth/permissions";
import type { IReviewService } from "./review.service";

export interface IReviewController {
  register(app: Express): void;
}

export class ReviewController implements IReviewController {
  constructor(private readonly service: IReviewService) {}

  register(app: Express): void {
    app.get(api.review.queue.path, isAuthenticated, requireReviewer, (req, res) => this.service.getQueue(req, res));
    app.get(api.review.conflicts.path, isAuthenticated, requireReviewer, (req, res) =>
      this.service.getConflicts(req, res),
    );
    app.patch(api.review.transition.path, isAuthenticated, requireReviewer, (req, res) =>
      this.service.transition(req, res),
    );
    app.patch(api.review.bulkTransition.path, isAuthenticated, requireReviewer, (req, res) =>
      this.service.bulkTransition(req, res),
    );
    app.patch(api.review.resolveConflict.path, isAuthenticated, requireReviewer, (req, res) =>
      this.service.resolveConflict(req, res),
    );
    app.get(api.review.history.path, isAuthenticated, requireReviewer, (req, res) => this.service.getHistory(req, res));
    app.post(api.review.submitDraft.path, isAuthenticated, (req, res) => this.service.submitDraft(req, res));
  }
}

