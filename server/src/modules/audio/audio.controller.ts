import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import type { Request, Response } from "express";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { AppError } from "../../common/errors/app-error";
import { logApiEvent, sendError } from "../../common/http";
import { ResolveAudioBodyDto } from "./audio.dto";
import { AudioService } from "./audio.service";

@Controller()
@UseGuards(AuthenticatedGuard)
@LogMethodLifecycle()
export class AudioApiController {
  constructor(private readonly audioService: AudioService) {}

  @Post("/api/audio/resolve")
  async resolveAudio(@Req() req: Request, @Res() res: Response, @Body() body: ResolveAudioBodyDto) {
    try {
      const userId = String((req.user as { claims?: { sub?: string } } | undefined)?.claims?.sub ?? "unknown");
      const result = await this.audioService.resolveAudio({ userId, payload: body });
      logApiEvent(req, "audio_resolved", {
        wordId: body.wordId ?? null,
        source: result.source,
        cached: result.cached,
      });
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
