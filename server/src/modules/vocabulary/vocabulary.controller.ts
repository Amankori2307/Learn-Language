import { Controller, Get, Param, ParseIntPipe, Query, Req, Res, UseGuards } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import type { Request, Response } from "express";
import { VocabularyService } from "./vocabulary.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ListClustersQueryDto, ListWordsQueryDto } from "./vocabulary.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError } from "../../common/http";

@Controller()
@UseGuards(AuthenticatedGuard)
@LogMethodLifecycle()
export class VocabularyApiController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get("/api/words")
  async listWords(@Req() req: Request, @Res() res: Response, @Query() query: ListWordsQueryDto) {
    try {
      const words = await this.vocabularyService.listWords(query);
      res.json(words);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/words/:id")
  async getWord(@Req() req: Request, @Res() res: Response, @Param("id", ParseIntPipe) id: number) {
    try {
      const word = await this.vocabularyService.getWord(id);
      res.json(word);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/clusters")
  async listClusters(@Req() req: Request, @Res() res: Response, @Query() query: ListClustersQueryDto) {
    try {
      const clusters = await this.vocabularyService.listClusters(query.language);
      res.json(clusters);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/clusters/:id")
  async getCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Query() query: ListClustersQueryDto,
  ) {
    try {
      const cluster = await this.vocabularyService.getCluster(id, query.language);
      res.json(cluster);
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
