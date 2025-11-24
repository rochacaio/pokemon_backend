import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ConflictException,
    ExceptionFilter,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = 400;
        let message: string = 'Erro ao processar a requisição.';

        // Prisma error codes:
        switch (exception.code) {
            case 'P2002':
                message = `O campo único já existe: ${exception?.meta?.target}`;
                status = 409;
                break;

            case 'P2025':
                message = 'Registro não encontrado.';
                status = 404;
                break;

            case 'P2003':
                message = 'Falha ao criar/atualizar referência (foreign key).';
                break;

            default:
                console.error('[PrismaExceptionFilter] UNHANDLED ERROR:', exception);
                throw new InternalServerErrorException(
                    'Erro interno ao acessar o banco de dados.',
                );
        }

        response.status(status).json({
            statusCode: status,
            message,
            error: 'PrismaException',
        });
    }
}
