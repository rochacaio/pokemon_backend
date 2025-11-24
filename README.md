<p align="center">
  <a href="#backend-node-api">
    <img src="https://img.shields.io/badge/PT--BR-Versão%20em%20Português-green?style=for-the-badge" alt="Portuguese Version">
  </a>
  &nbsp;
  <a href="#-english-version">
    <img src="https://img.shields.io/badge/EN-English%20Version-blue?style=for-the-badge" alt="English Version">
  </a>
</p>

<br/>

# Backend Node Api
API de gerenciamento de Pokémons desenvolvida com **Node.js + NestJS + Prisma**, seguindo arquitetura limpa, testes unitários e boas práticas de escalabilidade.

---

# Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Como Rodar o Projeto](#como-rodar-o-projeto)
4. [Documentação da API (Swagger)](#documentação-da-api-swagger)
5. [Estrutura de Pastas (Arquitetura Limpa)](#estrutura-de-pastas-arquitetura-limpa)
6. [Rotas Disponíveis](#rotas-disponíveis)
7. [Importação da PokeAPI](#importação-da-pokeapi)
8. [Testes Unitários](#testes-unitários)
9. [Implementações Obrigatórias](#tarefas-obrigatórias-implementadas)
10. [Implementações Bônus](#bônus-implementados)
11. [Decisões Técnicas e Extras](#decisões-técnicas-e-pontos-extras)

---

# Visão Geral

Este projeto implementa uma API REST completa para gerenciamento de Pokémons.

O foco do desenvolvimento foi:

- **Qualidade de código**
- **Boas práticas modernas de backend**
- **Arquitetura limpa e organizada**
- **Facilidade de manutenção**
- **Escalabilidade**
- **Testabilidade**

A API foi desenvolvida com **NestJS**, utilizando **Prisma ORM**.

---

# Tecnologias Utilizadas

| Tecnologia | Uso |
|-----------|-----|
| **Node.js** | Ambiente de execução |
| **NestJS** | Framework backend e arquitetura modular |
| **Prisma ORM** | ORM utilizado com SQLite |
| **SQLite** | Banco local simples e leve |
| **Jest** | Testes unitários |
| **class-validator** | Validação de entrada |
| **Swagger** | Documentação automática da API |
| **Fetch do Node 18** | Consumo da PokeAPI |
| **Arquitetura limpa** | Módulos independentes, DTOs e Services |

---

# Como Rodar o Projeto

```bash
npm install
npm run start:dev
```

A API ficará disponível em:

```
http://localhost:4000
```

---

# Documentação da API (Swagger)

Acesse:

**http://localhost:4000/api-docs**

A documentação contém:

- Endpoints
- Query params
- Exemplos
- Modelos de entrada
- Respostas esperadas

---

# Estrutura de Pastas (Arquitetura Limpa)

```
src/
 ├── common/
 │     ├── guards/
 │     │     └── rate-limit.guard.ts
 │     └── filters/
 │           └── prisma-exception.filter.ts
 ├── modules/
 │     ├── hello/
 │     ├── health/
 │     │     ├── health.controller.ts
 │     │     └── health.module.ts
 │     ├── prisma/
 │     │     ├── prisma.module.ts
 │     │     └── prisma.service.ts
 │     └── pokemons/
 │           ├── dto/
 │           │     ├── create-pokemon.dto.ts
 │           │     ├── update-pokemon.dto.ts
 │           │     └── find-pokemon.dto.ts
 │           ├── pokemons.controller.ts
 │           ├── pokemons.service.ts
 │           └── pokemons.module.ts
 ├── app.module.ts
 └── main.ts
```

**Principais decisões:**

- DTOs com validação automática
- Prisma injetado via módulo próprio
- Guard de rate-limit aplicado apenas nos Pokémons
- Cache simples e eficiente em memória
- Filtro global para erros do Prisma (PrismaExceptionFilter)

---

# Rotas Disponíveis

## **Pokémons**

| Método | Rota | Descrição |
|-------|-------|-----------|
| POST | `/pokemons` | Cria um Pokémon |
| GET | `/pokemons` | Lista todos com filtros, paginação e ordenação |
| GET | `/pokemons/:id` | Busca por ID |
| PATCH | `/pokemons/:id` | Atualiza um Pokémon |
| DELETE | `/pokemons/:id` | Remove |
| POST | `/pokemons/import/:id` | Importa da PokeAPI |

---

# Importação da PokeAPI

### Exemplo:
```
POST /pokemons/import/158
```

Fluxo:

1. Buscar dados na PokeAPI
2. Se não existir → erro 404
3. Se existir → cria ou atualiza via Prisma `upsert`
4. Salva:
   - nome
   - tipo principal do Pokémon

---

# Testes Unitários

O projeto contém **testes unitários reais usando apenas JEST**, conforme solicitado pelo bônus.

### Motivação:

- Testar regras de negócio isoladas
- Sem depender de HTTP
- Sem Supertest
- Totalmente unitário
- Mais rápido e confiável

### O que foi testado:

- `create()`
- `findMany()`
- `findOne()`
- `update()`
- `delete()`
- Filtros
- Paginação
- Erros esperados (404, 400)
- Importação (validação de ID)

Rodar testes:

```bash
npm run test
```

---

# Implementações Obrigatórias

### CRUD Completo (REST)
- `createOnePokemon`
- `updateOnePokemon`
- `deleteOnePokemon`
- `findManyPokemon`

---

# Implementações Bônus

### **Filtros**
- Por tipo
- Por nome parcial (`contains`)

### **Paginação**
- `page`, `limit`

### **Ordenação**
- `sortBy=name|created_at`
- `sortOrder=asc|desc`

### **Rate Limiting**
Guard customizado de 60 req/min por IP/rota.

### **Caching**
Cache em memória com TTL de 30s para listagem.

### **Validação (class-validator)**
DTOs com validação automática através do ValidationPipe global.

### **Tratamento de Erros**
- `NotFoundException`
- `BadRequestException`
- Tratamento global de erros do Prisma (PrismaExceptionFilter)
   - Evita erro 500
   - Converte P2002 → 409 Conflict
   - Converte P2025 → 404
   - Respostas amigáveis e padronizadas

### **Testes Unitários (JEST)**
Testando exclusivamente o PokemonsService (unit tests reais).

### **Swagger**
Documentação completa em `/api-docs`.

### **Healthcheck**
`GET /health` retorna:
- status da aplicação
- status do banco
- uptime
- timestamp

### **Importação da PokeAPI**
Consome API externa e usa `upsert` para criar/atualizar.

---

# Decisões Técnicas e Extras

- **Arquitetura limpa e modularizada**
- **Código facilmente escalável**
- **Boa separação de responsabilidades**
- **Cache e rate-limit implementados manualmente sem libs externas**
- **Import da PokeAPI com tratamento de erros**
- **Uso correto e seguro do Prisma**
- **Documentação completa no Swagger**
- **Testes unitários realmente isolados**

---

# English Version

## Backend Node API
Pokémon management API built with **Node.js + NestJS + Prisma**, following clean architecture, unit testing, and modern backend best practices.

---

## Overview

This project implements a full REST API for Pokémon management.

Key goals:

- **Code quality**
- **Modern backend best practices**
- **Clean and organized architecture**
- **Maintainability**
- **Scalability**
- **Testability**

Developed using **NestJS** and **Prisma ORM**.

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **NestJS** | Backend framework & modular architecture |
| **Prisma ORM** | ORM used with SQLite |
| **SQLite** | Lightweight local database |
| **Jest** | Unit testing |
| **class-validator** | Input validation |
| **Swagger** | Automatic API documentation |
| **Node Fetch** | PokeAPI consumption |
| **Clean Architecture** | Independent modules, DTOs, and services |

---

## How to Run

```bash
npm install
npm run start:dev
```

API available at:

```
http://localhost:4000
```

---

## API Documentation (Swagger)

Visit:

```
http://localhost:4000/api-docs
```

Includes:

- Endpoints
- Query params
- Examples
- Input models
- Expected responses

---

## Folder Structure (Clean Architecture)

```
src/
 ├── common/
 │     ├── guards/
 │     │     └── rate-limit.guard.ts
 │     └── filters/
 │           └── prisma-exception.filter.ts
 ├── modules/
 │     ├── hello/
 │     ├── health/
 │     │     ├── health.controller.ts
 │     │     └── health.module.ts
 │     ├── prisma/
 │     │     ├── prisma.module.ts
 │     │     └── prisma.service.ts
 │     └── pokemons/
 │           ├── dto/
 │           │     ├── create-pokemon.dto.ts
 │           │     ├── update-pokemon.dto.ts
 │           │     └── find-pokemon.dto.ts
 │           ├── pokemons.controller.ts
 │           ├── pokemons.service.ts
 │           └── pokemons.module.ts
 ├── app.module.ts
 └── main.ts
```

---

## Routes Available

### Pokemons

| Method | Route | Description |
|--------|--------|-------------|
| POST | `/pokemons` | Create |
| GET | `/pokemons` | List with filters |
| GET | `/pokemons/:id` | Get by ID |
| PATCH | `/pokemons/:id` | Update |
| DELETE | `/pokemons/:id` | Delete |
| POST | `/pokemons/import/:id` | Import from PokeAPI |

---

## PokeAPI Import

Example:

```
POST /pokemons/import/158
```

Flow:

1. Fetch from PokeAPI
2. If not found → 404
3. If found → create or update via `upsert`
4. Save:
   - name
   - primary type

---

## Unit Tests

Built with **pure Jest unit tests**, covering:

- CRUD
- Filters
- Sorting
- Pagination
- Error handling
- Import logic

Run:

```
npm run test
```

---

## Mandatory Features

- createOnePokemon
- updateOnePokemon
- deleteOnePokemon
- findManyPokemon

---

## Bonus Features

- Filters
- Pagination
- Sorting
- Rate limiting
- In-memory caching
- DTO validation
- PrismaExceptionFilter for friendly error handling
- Swagger docs
- Healthcheck route
- Upsert-based PokeAPI import
- Full unit test coverage

---

## Technical Decisions & Extras

- Modular and clean architecture
- Clear separation of concerns
- Safe Prisma usage
- No external libs for rate limiting or cache
- Fully documented API
- Isolated and robust unit tests  

