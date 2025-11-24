import { ApiProperty } from '@nestjs/swagger';
import {
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FindPokemonDto {
    @ApiProperty({
        required: false,
        description: 'Filtrar pelo tipo exato (ex: fire, water)',
    })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({
        required: false,
        description:
            'Filtro por nome (busca parcial, case-insensitive)',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        required: false,
        default: 1,
        description: 'Página (para paginação)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiProperty({
        required: false,
        default: 10,
        description: 'Limite de registros por página (1–100)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @ApiProperty({
        required: false,
        enum: ['name', 'created_at'],
        default: 'name',
        description: 'Campo de ordenação',
    })
    @IsOptional()
    @IsIn(['name', 'created_at'])
    sortBy: 'name' | 'created_at' = 'name';

    @ApiProperty({
        required: false,
        enum: ['asc', 'desc'],
        default: 'asc',
        description: 'Ordem de ordenação',
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder: 'asc' | 'desc' = 'asc';
}
