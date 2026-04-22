import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) {}

    async log(action: string, entityId?: string, userId?: string, metadata?: any) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action,
                    entityId,
                    userId,
                    metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
                },
            });
        } catch (error) {
            // We don't want audit logging to crash the main request
            console.error('Audit Log Error:', error);
        }
    }
}
