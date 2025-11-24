import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';

// Mock do PrismaService
const prismaMock = {
    pokemon: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn()
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
};

describe('PokemonsService - Unit Tests', () => {
    let service: PokemonsService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new PokemonsService(prismaMock as any);
    });

    // CREATE
    it('create() deve criar um pokemon corretamente', async () => {
        prismaMock.pokemon.create.mockResolvedValue({
            id: 1,
            name: 'pikachu',
            type: 'electric',
        });

        const result = await service.create({
            name: 'Pikachu',
            type: 'Electric',
        });

        expect(result).toEqual({
            id: 1,
            name: 'pikachu',
            type: 'electric',
        });

        expect(prismaMock.pokemon.create).toHaveBeenCalledWith({
            data: {
                name: 'pikachu',
                type: 'electric',
            },
        });
    });

    // FIND MANY
    it('findMany() deve listar pokemons com paginação', async () => {
        prismaMock.$transaction.mockResolvedValue([
            [{ id: 1, name: 'bulbasaur', type: 'grass' }],
            1,
        ]);

        const result = await service.findMany({
            page: 1,
            limit: 10,
            sortBy: 'name',
            sortOrder: 'asc',
        });

        expect(result.data.length).toBe(1);
        expect(result.meta.total).toBe(1);
        expect(result.meta.totalPages).toBe(1);
    });

    // FIND ONE
    it('findOne() deve retornar pokemon pelo id', async () => {
        prismaMock.pokemon.findUnique.mockResolvedValue({
            id: 5,
            name: 'eevee',
            type: 'normal',
        });

        const result = await service.findOne(5);

        expect(result.id).toBe(5);
    });

    it('findOne() deve lançar erro se pokemon não existe', async () => {
        prismaMock.pokemon.findUnique.mockResolvedValue(null);

        await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    // UPDATE
    it('update() deve atualizar pokemon', async () => {
        prismaMock.pokemon.findUnique.mockResolvedValue({
            id: 3,
            name: 'squirtle',
            type: 'water',
        });

        prismaMock.pokemon.update.mockResolvedValue({
            id: 3,
            name: 'wartortle',
            type: 'water',
        });

        const result = await service.update(3, { name: 'Wartortle' });

        expect(result.name).toBe('wartortle');
    });

    it('update() deve lançar erro se pokemon não existe', async () => {
        prismaMock.pokemon.findUnique.mockResolvedValue(null);

        await expect(service.update(99, { name: 'test' })).rejects.toThrow(NotFoundException);
    });

    // DELETE
    it('delete() deve remover pokemon', async () => {
        prismaMock.pokemon.findUnique.mockResolvedValue({
            id: 2,
            name: 'abra',
            type: 'psychic',
        });

        prismaMock.pokemon.delete.mockResolvedValue({});

        await expect(service.delete(2)).resolves.not.toThrow();
    });

    it('delete() deve lançar erro se pokemon não existe', async () => {
        prismaMock.pokemon.findUnique.mockResolvedValue(null);

        await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    // IMPORT
    it('importById() deve validar ID inválido', async () => {
        await expect(service.importById(-1)).rejects.toThrow(BadRequestException);
    });
});
