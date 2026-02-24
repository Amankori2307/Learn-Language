import { Module } from "@nestjs/common";
import { InfraApiController } from "../controllers/infra.controller";
import { InfraRepository } from "../../domains/infra/infra.repository";
import { InfraService } from "../../domains/infra/infra.service";

@Module({
  controllers: [InfraApiController],
  providers: [InfraRepository, InfraService],
})
export class InfraApiModule {}

