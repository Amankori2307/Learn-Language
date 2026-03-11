import { Body, Controller, Get, Inject, Patch, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { UpdateProfileBodyDto } from "./auth.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError, sendSuccess } from "../../common/http";
import { appLogger } from "../../common/logger/logger";
import { extractUserClaims, extractUserId } from "./auth.request-user";

@Controller()
@UseGuards(AuthenticatedGuard)
export class AuthApiController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get("/auth/me")
  async getAuthUser(@Req() req: Request, @Res() res: Response) {
    try {
      const claims = extractUserClaims(req);
      if (!claims?.sub) {
        sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
        return;
      }
      const user = await this.authService.getAuthUser(claims);
      sendSuccess(req, res, user);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/auth/profile")
  async getProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = extractUserId(req);
      if (!userId) {
        sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
        return;
      }
      const profile = await this.authService.getProfile(userId);
      sendSuccess(req, res, profile);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/auth/profile")
  async updateProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateProfileBodyDto,
  ) {
    try {
      const userId = extractUserId(req);
      if (!userId) {
        sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
        return;
      }
      const profile = await this.authService.updateProfile(userId, body);
      sendSuccess(req, res, profile);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  private handleError(req: Request, res: Response, error: unknown) {
    if (error instanceof AppError) {
      sendError(req, res, error.status, error.code, error.message, error.details);
      return;
    }
    appLogger.error("AuthApiController.handleError", {
      requestId: req.requestId ?? "unknown",
      path: req.path,
      method: req.method,
      error,
    });
    sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
