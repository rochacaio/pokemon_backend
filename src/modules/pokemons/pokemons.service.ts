import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { FindPokemonDto } from './dto/find-pokemon.dto';
import { Pokemon, Prisma } from '@prisma/client';

@Injectable()
export class PokemonsService {
    private readonly logger = new Logger(PokemonsService.name);

    private readonly cache = new Map<
        string,
        { data: any; expiresAt: number }
    >();
    private readonly CACHE_TTL_MS = 30_000; // 30 segundos

    constructor(private readonly prisma: PrismaService) {}

    private buildWhereFilter(
        filters: FindPokemonDto,
    ): Prisma.PokemonWhereInput {
        const where: Prisma.PokemonWhereInput = {};

        if (filters.type) {
            where.type = filters.type.toLowerCase();
        }

        if (filters.name) {
            where.name = {
                contains: filters.name.toLowerCase(),
            };
        }

        return where;
    }

    private buildOrderBy(filters: FindPokemonDto): Prisma.PokemonOrderByWithRelationInput {
        return {
            [filters.sortBy]: filters.sortOrder,
        };
    }

    private getCacheKey(filters: FindPokemonDto): string {
        return JSON.stringify(filters);
    }

    private getFromCache(key: string): any | null {
        const entry = this.cache.get(key);
        if (entry && entry.expiresAt > Date.now()) {
            this.logger.debug(`Cache HIT para key=${key}`);
            return entry.data;
        }
        if (entry) {
            this.cache.delete(key);
        }
        return null;
    }

    private saveToCache(key: string, data: any) {
        this.logger.debug(`Cache SET para key=${key}`);
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + this.CACHE_TTL_MS,
        });
    }

    private invalidateCache() {
        this.logger.debug('Invalidando cache de listagem de pokemons');
        this.cache.clear();
    }

    async create(dto: CreatePokemonDto): Promise<Pokemon> {
        const pokemon = await this.prisma.pokemon.create({
            data: {
                name: dto.name.toLowerCase(),
                type: dto.type.toLowerCase(),
            },
        });
        this.invalidateCache();
        return pokemon;
    }

    async findMany(filters: FindPokemonDto) {
        const key = this.getCacheKey(filters);
        const cached = this.getFromCache(key);
        if (cached) {
            return cached;
        }

        const { page, limit } = filters;
        const where = this.buildWhereFilter(filters);
        const orderBy = this.buildOrderBy(filters);

        const [items, total] = await this.prisma.$transaction([
            this.prisma.pokemon.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.pokemon.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const result = {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };

        this.saveToCache(key, result);
        return result;
    }

    async findOne(id: number): Promise<Pokemon> {
        const pokemon = await this.prisma.pokemon.findUnique({
            where: { id },
        });

        if (!pokemon) {
            throw new NotFoundException(`Pokemon with id ${id} not found`);
        }

        return pokemon;
    }

    async update(
        id: number,
        dto: UpdatePokemonDto,
    ): Promise<Pokemon> {
        const exists = await this.prisma.pokemon.findUnique({
            where: { id },
        });

        if (!exists) {
            throw new NotFoundException(`Pokemon with id ${id} not found`);
        }

        const data: Prisma.PokemonUpdateInput = {};
        if (dto.name !== undefined) {
            data.name = dto.name.toLowerCase();
        }
        if (dto.type !== undefined) {
            data.type = dto.type.toLowerCase();
        }

        const updated = await this.prisma.pokemon.update({
            where: { id },
            data,
        });

        this.invalidateCache();
        return updated;
    }

    async delete(id: number): Promise<void> {
        const exists = await this.prisma.pokemon.findUnique({
            where: { id },
        });

        if (!exists) {
            throw new NotFoundException(`Pokemon with id ${id} not found`);
        }

        await this.prisma.pokemon.delete({
            where: { id },
        });

        this.invalidateCache();
    }

    /**
     * Importa ou atualiza um Pokémon com base na PokeAPI,
     * usando o id oficial (ex: 158 -> totodile).
     */
    async importById(id: number): Promise<Pokemon> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException(
                'Pokemon id must be a positive integer',
            );
        }

        const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
        this.logger.log(`Importando Pokemon da PokeAPI: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new NotFoundException(
                    `Pokemon with id ${id} not found in PokeAPI`,
                );
            }
            throw new BadRequestException(
                `Error calling PokeAPI (status ${response.status})`,
            );
        }

        const data: any = await response.json();

        const name: string = data.name;
        const firstType: string | undefined =
            data.types?.[0]?.type?.name;

        if (!name || !firstType) {
            throw new BadRequestException(
                'PokeAPI response missing name or type',
            );
        }

        const pokemon = await this.prisma.pokemon.upsert({
            where: { id },
            create: {
                id,
                name: name.toLowerCase(),
                type: firstType.toLowerCase(),
            },
            update: {
                name: name.toLowerCase(),
                type: firstType.toLowerCase(),
            },
        });

        this.invalidateCache();
        return pokemon;
    }
}
