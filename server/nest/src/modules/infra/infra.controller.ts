import { Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { InfraService } from "../../../../domains/infra/infra.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ReviewerGuard } from "../../common/guards/reviewer.guard";
import { SrsDriftQueryDto } from "../../common/dto/infra.dto";

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
  getSrsDrift(@Req() req: Request, @Res() res: Response, @Query() query: SrsDriftQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.infraService.getSrsDrift(req, res);
  }
}
