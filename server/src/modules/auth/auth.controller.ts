import { Body, Controller, Get, Patch, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { UpdateProfileBodyDto } from "./auth.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError } from "../../common/http";
import { appLogger } from "../../common/logger/logger";
import { extractUserClaims, extractUserId } from "./auth.request-user";

@Controller()
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @Get("/auth/me")
  @UseGuards(AuthenticatedGuard)
  async getAuthUser(@Req() req: Request, @Res() res: Response) {
    appLogger.debug("AuthApiController.getAuthUser.start", {
      requestId: req.requestId ?? "unknown",
    });
    try {
      const claims = extractUserClaims(req);
      if (!claims?.sub) {
        sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
        return;
      }
      const user = await this.authService.getAuthUser(claims);
      res.json(user);
    } catch (error) {
      this.handleError(req, res, error);
    } finally {
      appLogger.debug("AuthApiController.getAuthUser.end", {
        requestId: req.requestId ?? "unknown",
      });
    }
  }

  @Get("/api/profile")
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request, @Res() res: Response) {
    appLogger.debug("AuthApiController.getProfile.start", {
      requestId: req.requestId ?? "unknown",
    });
    try {
      const userId = extractUserId(req);
      if (!userId) {
        sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
        return;
      }
      const profile = await this.authService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      this.handleError(req, res, error);
    } finally {
      appLogger.debug("AuthApiController.getProfile.end", {
        requestId: req.requestId ?? "unknown",
      });
    }
  }

  @Patch("/api/profile")
  @UseGuards(AuthenticatedGuard)
  async updateProfile(@Req() req: Request, @Res() res: Response, @Body() body: UpdateProfileBodyDto) {
    appLogger.debug("AuthApiController.updateProfile.start", {
      requestId: req.requestId ?? "unknown",
    });
    try {
      const userId = extractUserId(req);
      if (!userId) {
        sendError(req, res, 401, "UNAUTHORIZED", "Unauthorized");
        return;
      }
      const profile = await this.authService.updateProfile(userId, body);
      res.json(profile);
    } catch (error) {
      this.handleError(req, res, error);
    } finally {
      appLogger.debug("AuthApiController.updateProfile.end", {
        requestId: req.requestId ?? "unknown",
      });
    }
  }

  private handleError(req: Request, res: Response, error: unknown) {
    appLogger.error("AuthApiController.handleError", {
      requestId: req.requestId ?? "unknown",
      path: req.path,
      method: req.method,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof AppError) {
      appLogger.warn("Auth controller handled AppError", {
        requestId: req.requestId ?? "unknown",
        path: req.path,
        method: req.method,
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });
      sendError(req, res, error.status, error.code, error.message, error.details);
      return;
    }
    appLogger.error("Unhandled auth controller error", {
      requestId: req.requestId ?? "unknown",
      error: error instanceof Error ? error.message : String(error),
    });
    sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
