import { Module } from '@nestjs/common';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@Module({
    controllers: [PokemonsController],
    providers: [PokemonsService, RateLimitGuard],
})
export class PokemonsModule {}
