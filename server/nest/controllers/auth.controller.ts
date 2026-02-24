import { Body, Controller, Get, Patch, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "../../auth/auth.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { UpdateProfileBodyDto } from "../dto/profile.dto";

@Controller()
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @Get("/api/auth/user")
  @UseGuards(AuthenticatedGuard)
  getAuthUser(@Req() req: Request, @Res() res: Response) {
    return this.authService.getAuthUser(req, res);
  }

  @Get("/api/profile")
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req: Request, @Res() res: Response) {
    return this.authService.getProfile(req, res);
  }

  @Patch("/api/profile")
  @UseGuards(AuthenticatedGuard)
  updateProfile(@Req() req: Request, @Res() res: Response, @Body() body: UpdateProfileBodyDto) {
    req.body = body;
    return this.authService.updateProfile(req, res);
  }
}
