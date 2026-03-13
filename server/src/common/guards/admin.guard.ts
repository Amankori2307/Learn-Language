import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserTypeEnum } from "@shared/domain/enums";
import { getCurrentUserRole } from "../../modules/auth/auth.permissions";

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const role = await getCurrentUserRole(request);
    return role === UserTypeEnum.ADMIN;
  }
}
