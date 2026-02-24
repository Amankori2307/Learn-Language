import { Body, Controller, Get, Patch, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { UpdateProfileBodyDto } from "./auth.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError } from "../../common/http";

@Controller()
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @Get("/api/auth/user")
  @UseGuards(AuthenticatedGuard)
  async getAuthUser(@Req() req: Request, @Res() res: Response) {
    try {
      const claims = (req.user as { claims: Parameters<AuthService["getAuthUser"]>[0] }).claims;
      const user = await this.authService.getAuthUser(claims);
      res.json(user);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/profile")
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const profile = await this.authService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/api/profile")
  @UseGuards(AuthenticatedGuard)
  async updateProfile(@Req() req: Request, @Res() res: Response, @Body() body: UpdateProfileBodyDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const profile = await this.authService.updateProfile(userId, body);
      res.json(profile);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  private handleError(req: Request, res: Response, error: unknown) {
    if (error instanceof AppError) {
      sendError(req, res, error.status, error.code, error.message, error.details);
      return;
    }
    sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
