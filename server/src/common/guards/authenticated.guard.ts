import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import { isAuthenticated } from "../../modules/auth/auth.oidc";
import { appLogger } from "../logger/logger";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    appLogger.debug("AuthenticatedGuard.canActivate.start", {
      requestId: request.requestId ?? "unknown",
      path: request.path,
      method: request.method,
    });

    return new Promise((resolve, reject) => {
      isAuthenticated(request, response, (err?: unknown) => {
        if (err) {
          appLogger.error("AuthenticatedGuard failed", {
            requestId: request.requestId ?? "unknown",
            path: request.path,
            method: request.method,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          });
          reject(err);
          return;
        }
        if (response.headersSent) {
          appLogger.warn("AuthenticatedGuard blocked request (headers already sent)", {
            requestId: request.requestId ?? "unknown",
            path: request.path,
            method: request.method,
          });
          resolve(false);
          return;
        }
        appLogger.debug("AuthenticatedGuard.canActivate.end", {
          requestId: request.requestId ?? "unknown",
          path: request.path,
          method: request.method,
          allowed: true,
        });
        resolve(true);
      });
    });
  }
}
