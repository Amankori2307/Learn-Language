import { Module } from "@nestjs/common";
import { AudioApiController } from "./audio.controller";
import { AudioRepository } from "./audio.repository";
import { AudioService } from "./audio.service";

@Module({
  controllers: [AudioApiController],
  providers: [AudioRepository, AudioService],
})
export class AudioApiModule {}
