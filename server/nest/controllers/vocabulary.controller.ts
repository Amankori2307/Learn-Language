import { Controller, Get, Param, ParseIntPipe, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { VocabularyService } from "../../domains/vocabulary/vocabulary.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { ListClustersQueryDto, ListWordsQueryDto } from "../dto/vocabulary.dto";

@Controller()
@UseGuards(AuthenticatedGuard)
export class VocabularyApiController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get("/api/words")
  listWords(@Req() req: Request, @Res() res: Response, @Query() query: ListWordsQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.vocabularyService.listWords(req, res);
  }

  @Get("/api/words/:id")
  getWord(@Req() req: Request, @Res() res: Response, @Param("id", ParseIntPipe) id: number) {
    req.params.id = String(id);
    return this.vocabularyService.getWord(req, res);
  }

  @Get("/api/clusters")
  listClusters(@Req() req: Request, @Res() res: Response, @Query() query: ListClustersQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.vocabularyService.listClusters(req, res);
  }

  @Get("/api/clusters/:id")
  getCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Query() query: ListClustersQueryDto,
  ) {
    req.params.id = String(id);
    req.query = query as unknown as Request["query"];
    return this.vocabularyService.getCluster(req, res);
  }
}
