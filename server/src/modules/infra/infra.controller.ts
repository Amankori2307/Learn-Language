import { Controller, Get, Inject, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { InfraService } from "./infra.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ReviewerGuard } from "../../common/guards/reviewer.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { SrsDriftQueryDto } from "./infra.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError, sendSuccess } from "../../common/http";

@Controller()
export class InfraApiController {
  constructor(@Inject(InfraService) private readonly infraService: InfraService) {}

  @Post("/admin/seed")
  @UseGuards(AuthenticatedGuard)
  async seed(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.infraService.seed();
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/admin/srs/drift")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getSrsDrift(@Req() req: Request, @Res() res: Response, @Query() query: SrsDriftQueryDto) {
    try {
      const result = await this.infraService.getSrsDrift(query.language);
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/admin/vocabulary/export")
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async exportVocabularyData(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.infraService.exportVocabularyData();
      sendSuccess(req, res, result);
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
