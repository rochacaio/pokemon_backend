import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { HelloModule } from "./modules/hello/hello.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PokemonsModule } from "./modules/pokemons/pokemons.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
      },
    }),
    HelloModule,
    PrismaModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "./database/database_orm.sqlite",
      autoLoadEntities: true,
      synchronize: true,
      migrations: ["../typeorm/migrations/*.ts"],
    }),
    PokemonsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
