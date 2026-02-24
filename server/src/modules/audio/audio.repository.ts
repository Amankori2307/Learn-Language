import { Injectable } from "@nestjs/common";
import { storage } from "../../infrastructure/storage";

@Injectable()
export class AudioRepository {
  getWord(wordId: number) {
    return storage.getWord(wordId);
  }

  async updateWordAudioUrl(wordId: number, audioUrl: string) {
    await storage.updateWordAudioUrl(wordId, audioUrl);
  }
}
