import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

/**
 * AppService handles non-resource specific application logic.
 */
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checks the connectivity to the database.
   */
  async getStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        service: 'ecom-nest-api',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'ecom-nest-api',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
