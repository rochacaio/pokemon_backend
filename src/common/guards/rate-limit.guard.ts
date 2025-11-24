import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    BadRequestException,
} from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly logger = new Logger(RateLimitGuard.name);

    private readonly WINDOW_SIZE_MS = 60_000;
    private readonly MAX_REQUESTS = 60;

    private readonly requests = new Map<
        string,
        { count: number; windowStart: number }
    >();

    canActivate(context: ExecutionContext): boolean {
        const httpContext = context.switchToHttp();
        const request: any = httpContext.getRequest();

        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const path = request.route?.path || request.url || 'unknown';

        const key = `${ip}:${path}`;
        const now = Date.now();

        const entry =
            this.requests.get(key) ?? { count: 0, windowStart: now };

        if (now - entry.windowStart > this.WINDOW_SIZE_MS) { // verificação para ver se a diferença de tempo entre agora e o começo da janela é maior que a janela setada
            // se for maior ele recomeça a janela jogando o contador pra zero e o inicio da janela para agora
            entry.count = 0;
            entry.windowStart = now;
        }

        entry.count += 1;
        this.requests.set(key, entry);

        if (entry.count > this.MAX_REQUESTS) { // verifica se a quantidade de requisições na janela é maior que o numero permitido de requisições
            this.logger.warn(`Rate limit exceeded for ${key}`);
            throw new BadRequestException(
                `Too many requests, please try again later. Max requests in a hour: ${this.MAX_REQUESTS}`,
            );
        }

        return true;
    }
}
