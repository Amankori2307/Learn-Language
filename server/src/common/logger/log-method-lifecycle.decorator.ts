import { appLogger } from "./logger";

const LOG_WRAPPED_KEY = Symbol("log_method_lifecycle_wrapped");

function resolveRequestIdFromArgs(args: unknown[]): string {
  for (const arg of args) {
    if (!arg || typeof arg !== "object") {
      continue;
    }

    const requestId = (arg as { requestId?: unknown }).requestId;
    if (typeof requestId === "string" && requestId.trim().length > 0) {
      return requestId;
    }

    const headers = (arg as { headers?: Record<string, unknown> }).headers;
    const headerRequestId = headers?.["x-request-id"];
    if (typeof headerRequestId === "string" && headerRequestId.trim().length > 0) {
      return headerRequestId;
    }
  }

  return "unknown";
}

export function LogMethodLifecycle(): ClassDecorator {
  return (target) => {
    const typedTarget = target as unknown as {
      name: string;
      prototype: Record<string, unknown>;
    };
    const className = typedTarget.name;
    const propertyNames = Object.getOwnPropertyNames(typedTarget.prototype);

    for (const propertyName of propertyNames) {
      if (propertyName === "constructor") {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(typedTarget.prototype, propertyName);
      if (!descriptor || typeof descriptor.value !== "function") {
        continue;
      }

      const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
      if ((originalMethod as unknown as Record<symbol, unknown>)[LOG_WRAPPED_KEY]) {
        continue;
      }

      const wrappedMethod = function (this: unknown, ...args: unknown[]) {
        const requestId = resolveRequestIdFromArgs(args);
        const startedAt = Date.now();
        const context = {
          className,
          methodName: propertyName,
          requestId,
        };

        appLogger.debug("method.start", context);

        try {
          const result = originalMethod.apply(this, args);
          if (result instanceof Promise) {
            return result
              .then((resolvedValue) => {
                appLogger.debug("method.end", {
                  ...context,
                  durationMs: Date.now() - startedAt,
                });
                return resolvedValue;
              })
              .catch((error: unknown) => {
                appLogger.error("method.error", {
                  ...context,
                  durationMs: Date.now() - startedAt,
                  error: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined,
                });
                throw error;
              });
          }

          appLogger.debug("method.end", {
            ...context,
            durationMs: Date.now() - startedAt,
          });
          return result;
        } catch (error) {
          appLogger.error("method.error", {
            ...context,
            durationMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw error;
        }
      };

      Object.defineProperty(wrappedMethod, LOG_WRAPPED_KEY, {
        value: true,
        enumerable: false,
        configurable: false,
      });

      const metadataKeys = Reflect.getMetadataKeys(originalMethod);
      for (const metadataKey of metadataKeys) {
        const metadataValue = Reflect.getMetadata(metadataKey, originalMethod);
        Reflect.defineMetadata(metadataKey, metadataValue, wrappedMethod);
      }

      Object.defineProperty(typedTarget.prototype, propertyName, {
        ...descriptor,
        value: wrappedMethod,
      });
    }
  };
}
