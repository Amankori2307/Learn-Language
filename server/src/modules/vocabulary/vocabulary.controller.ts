import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { VocabularyService } from "./vocabulary.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ListClustersQueryDto, ListWordsQueryDto } from "./vocabulary.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError, sendSuccess } from "../../common/http";

@Controller()
@UseGuards(AuthenticatedGuard)
export class VocabularyApiController {
  constructor(@Inject(VocabularyService) private readonly vocabularyService: VocabularyService) {}

  @Get("/words")
  async listWords(@Req() req: Request, @Res() res: Response, @Query() query: ListWordsQueryDto) {
    try {
      const words = await this.vocabularyService.listWords(query);
      sendSuccess(req, res, words);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/words/:id")
  async getWord(@Req() req: Request, @Res() res: Response, @Param("id", ParseIntPipe) id: number) {
    try {
      const word = await this.vocabularyService.getWord(id);
      sendSuccess(req, res, word);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/clusters")
  async listClusters(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ListClustersQueryDto,
  ) {
    try {
      const clusters = await this.vocabularyService.listClusters(query.language);
      sendSuccess(req, res, clusters);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/clusters/:id")
  async getCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Query() query: ListClustersQueryDto,
  ) {
    try {
      const cluster = await this.vocabularyService.getCluster(id, query.language);
      sendSuccess(req, res, cluster);
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
