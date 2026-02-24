import { Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { InfraService } from "./infra.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ReviewerGuard } from "../../common/guards/reviewer.guard";
import { SrsDriftQueryDto } from "./infra.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError } from "../../common/http";

@Controller()
export class InfraApiController {
  constructor(private readonly infraService: InfraService) {}

  @Post("/api/admin/seed")
  @UseGuards(AuthenticatedGuard)
  async seed(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.infraService.seed();
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/admin/srs/drift")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getSrsDrift(@Req() req: Request, @Res() res: Response, @Query() query: SrsDriftQueryDto) {
    try {
      const result = await this.infraService.getSrsDrift(query.language);
      res.json(result);
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
