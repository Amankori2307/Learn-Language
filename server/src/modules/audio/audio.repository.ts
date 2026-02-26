import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { storage } from "../../infrastructure/storage";

@Injectable()
@LogMethodLifecycle()
export class AudioRepository {
  getWord(wordId: number) {
    return storage.getWord(wordId);
  }

  async updateWordAudioUrl(wordId: number, audioUrl: string) {
    await storage.updateWordAudioUrl(wordId, audioUrl);
  }
}
