import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    @ApiOperation({ summary: 'Healthcheck da API' })
    @ApiOkResponse({
        description: 'Retorna status da API e do banco.',
    })
    async check() {
        const startedAt = process.uptime();
        let dbStatus: 'up' | 'down' = 'up';

        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch (err) {
            dbStatus = 'down';
        }

        return {
            status: 'ok',
            db: dbStatus,
            uptime_seconds: startedAt,
            timestamp: new Date().toISOString(),
        };
    }
}
