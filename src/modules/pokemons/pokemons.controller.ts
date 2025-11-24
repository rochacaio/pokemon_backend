import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { FindPokemonDto } from './dto/find-pokemon.dto';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@ApiTags('pokemons')
@Controller('pokemons')
@UseGuards(RateLimitGuard)
export class PokemonsController {
    constructor(private readonly pokemonsService: PokemonsService) {}

    @Post()
    @ApiOperation({ summary: 'Cria um novo Pokémon' })
    @ApiCreatedResponse({
        description: 'Pokemon criado com sucesso',
    })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    async create(@Body() dto: CreatePokemonDto) {
        return this.pokemonsService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: 'Lista Pokémons com filtros, paginação e ordenação',
    })
    @ApiOkResponse({
        description: 'Lista de Pokémons',
    })
    async findMany(@Query() query: FindPokemonDto) {
        return this.pokemonsService.findMany(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Busca um Pokémon por ID' })
    @ApiOkResponse({ description: 'Pokemon encontrado' })
    @ApiNotFoundResponse({ description: 'Pokemon não encontrado' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.pokemonsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualiza um Pokémon por ID' })
    @ApiOkResponse({ description: 'Pokemon atualizado com sucesso' })
    @ApiBadRequestResponse({ description: 'Dados inválidos' })
    @ApiNotFoundResponse({ description: 'Pokemon não encontrado' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePokemonDto,
    ) {
        return this.pokemonsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove um Pokémon por ID' })
    @ApiNoContentResponse({ description: 'Pokemon removido com sucesso' })
    @ApiNotFoundResponse({ description: 'Pokemon não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.pokemonsService.delete(id);
        return;
    }

    @Post('import/:id')
    @ApiOperation({
        summary:
            'Importa/atualiza um Pokémon da PokeAPI pelo ID oficial(BONUS)',
    })
    @ApiOkResponse({
        description:
            'Pokemon importado/atualizado com sucesso a partir da PokeAPI',
    })
    @ApiBadRequestResponse({
        description: 'Erro ao consultar a PokeAPI ou dados inválidos',
    })
    @ApiNotFoundResponse({
        description: 'Pokemon não encontrado na PokeAPI',
    })
    async importById(@Param('id', ParseIntPipe) id: number) {
        return this.pokemonsService.importById(id);
    }
}
