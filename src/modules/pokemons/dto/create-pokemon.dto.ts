import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePokemonDto {
    @ApiProperty({ example: 'pikachu' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'electric' })
    @IsString()
    @IsNotEmpty()
    type: string;
}
