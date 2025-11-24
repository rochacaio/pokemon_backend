import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePokemonDto {
    @ApiProperty({ example: 'raichu', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'electric', required: false })
    @IsString()
    @IsOptional()
    type?: string;
}
