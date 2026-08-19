import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Used on SSE/streaming endpoints to bypass the global response wrapper
@Injectable()
export class NoopInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle();
  }
}

function normalizeMongoIds(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'object' && 'toObject' in value && typeof value.toObject === 'function') {
    return normalizeMongoIds(value.toObject());
  }

  if (typeof value === 'object' && 'toHexString' in value && typeof value.toHexString === 'function') {
    return value.toHexString();
  }

  if (Array.isArray(value)) return value.map(normalizeMongoIds);
  if (value instanceof Date) return value;
  if (typeof value !== 'object') return value;

  const object = value as Record<string, unknown>;
  const normalized = Object.fromEntries(
    Object.entries(object).map(([key, entry]) => [key, normalizeMongoIds(entry)]),
  );

  if ('_id' in normalized && !('id' in normalized)) {
    normalized.id = normalized._id;
  }

  return normalized;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If already formatted, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          const response = data as { data?: unknown; [key: string]: unknown };
          return { ...response, data: normalizeMongoIds(response.data) };
        }
        return { success: true, data: normalizeMongoIds(data) };
      }),
    );
  }
}
