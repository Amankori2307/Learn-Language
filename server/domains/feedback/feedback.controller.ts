import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import type { IFeedbackService } from "./feedback.service";

export interface IFeedbackController {
  register(app: Express): void;
}

export class FeedbackController implements IFeedbackController {
  constructor(private readonly service: IFeedbackService) {}

  register(app: Express): void {
    app.post(api.feedback.submit.path, isAuthenticated, (req, res) => this.service.submitFeedback(req, res));
  }
}

