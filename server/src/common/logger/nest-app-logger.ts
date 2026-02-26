import { ConsoleLogger, Injectable, type LoggerService } from "@nestjs/common";
import { appLogger } from "./logger";

@Injectable()
export class NestAppLogger extends ConsoleLogger implements LoggerService {
  log(message: string, context?: string): void {
    appLogger.info(message, { context: context ?? "Nest" });
  }

  error(message: string, trace?: string, context?: string): void {
    appLogger.error(message, {
      context: context ?? "Nest",
      trace: trace ?? undefined,
    });
  }

  warn(message: string, context?: string): void {
    appLogger.warn(message, { context: context ?? "Nest" });
  }

  debug(message: string, context?: string): void {
    appLogger.debug(message, { context: context ?? "Nest" });
  }

  verbose(message: string, context?: string): void {
    appLogger.verbose(message, { context: context ?? "Nest" });
  }
}
