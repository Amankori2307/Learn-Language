import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Request } from "express";
import { Observable, tap } from "rxjs";
import { appLogger } from "./logger";

@Injectable()
export class ControllerLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const requestId = req.requestId ?? "unknown";
    const startedAt = Date.now();

    appLogger.debug("controller.start", {
      controllerName,
      handlerName,
      requestId,
      method: req.method,
      path: req.path,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          appLogger.debug("controller.end", {
            controllerName,
            handlerName,
            requestId,
            method: req.method,
            path: req.path,
            durationMs: Date.now() - startedAt,
          });
        },
        error: (error: unknown) => {
          appLogger.error("controller.error", {
            controllerName,
            handlerName,
            requestId,
            method: req.method,
            path: req.path,
            durationMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        },
      }),
    );
  }
}
