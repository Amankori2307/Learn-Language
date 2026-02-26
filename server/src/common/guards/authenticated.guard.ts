import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../logger/log-method-lifecycle.decorator";
import type { Request, Response } from "express";
import { isAuthenticated } from "../../modules/auth/auth.oidc";

@Injectable()
@LogMethodLifecycle()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return new Promise((resolve, reject) => {
      isAuthenticated(request, response, (err?: unknown) => {
        if (err) {
          reject(err);
          return;
        }
        if (response.headersSent) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
