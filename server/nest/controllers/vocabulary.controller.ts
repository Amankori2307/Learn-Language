import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { VocabularyService } from "../../domains/vocabulary/vocabulary.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";

@Controller()
@UseGuards(AuthenticatedGuard)
export class VocabularyApiController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get("/api/words")
  listWords(@Req() req: Request, @Res() res: Response) {
    return this.vocabularyService.listWords(req, res);
  }

  @Get("/api/words/:id")
  getWord(@Req() req: Request, @Res() res: Response) {
    return this.vocabularyService.getWord(req, res);
  }

  @Get("/api/clusters")
  listClusters(@Req() req: Request, @Res() res: Response) {
    return this.vocabularyService.listClusters(req, res);
  }

  @Get("/api/clusters/:id")
  getCluster(@Req() req: Request, @Res() res: Response) {
    return this.vocabularyService.getCluster(req, res);
  }
}

