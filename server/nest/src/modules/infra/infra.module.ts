import { Module } from "@nestjs/common";
import { InfraApiController } from "./infra.controller";
import { InfraRepository } from "./infra.repository";
import { InfraService } from "./infra.service";

@Module({
  controllers: [InfraApiController],
  providers: [InfraRepository, InfraService],
})
export class InfraApiModule {}
