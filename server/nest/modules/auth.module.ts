import { Module } from "@nestjs/common";
import { AuthApiController } from "../controllers/auth.controller";
import { AuthRepository } from "../../auth/auth.repository";
import { AuthService } from "../../auth/auth.service";

@Module({
  controllers: [AuthApiController],
  providers: [AuthRepository, AuthService],
  exports: [AuthRepository, AuthService],
})
export class AuthApiModule {}

