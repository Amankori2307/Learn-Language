import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { InfraService } from "../../domains/infra/infra.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { ReviewerGuard } from "../guards/reviewer.guard";

@Controller()
export class InfraApiController {
  constructor(private readonly infraService: InfraService) {}

  @Post("/api/admin/seed")
  @UseGuards(AuthenticatedGuard)
  seed(@Req() req: Request, @Res() res: Response) {
    return this.infraService.seed(req, res);
  }

  @Get("/api/admin/srs/drift")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getSrsDrift(@Req() req: Request, @Res() res: Response) {
    return this.infraService.getSrsDrift(req, res);
  }
}

