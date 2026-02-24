import { Module } from "@nestjs/common";
import { AuthApiController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthApiController],
  providers: [AuthRepository, AuthService],
  exports: [AuthRepository, AuthService],
})
export class AuthApiModule {}
