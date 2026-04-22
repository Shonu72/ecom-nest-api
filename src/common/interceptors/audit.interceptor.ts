import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, body, params } = request;

        // Skip GET requests
        if (method === 'GET') {
            return next.handle();
        }

        return next.handle().pipe(
            tap((data) => {
                const action = `${method} ${url}`;
                const userId = user?.id;
                const entityId = data?.id || params?.id;

                // Log sensitive metadata but exclude passwords/secrets
                const metadata = { ...body };
                delete metadata.password;
                delete metadata.token;

                this.auditService.log(action, entityId, userId, metadata);
            }),
        );
    }
}
