# 🔗 URL Encoder

[![NestJS](https://img.shields.io/badge/NestJS-v11.0.1-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-green.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-60%20passed-brightgreen.svg)](https://jestjs.io/)

Uma API robusta para encurtamento de URLs com autenticação, rastreamento de visitas e observabilidade completa.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Reference](#-api-reference)
- [Testes](#-testes)
- [Deploy](#-deploy)

## 🎯 Visão Geral

O URL Encoder é uma aplicação backend desenvolvida em NestJS que permite:

- **Encurtamento de URLs**: Transforma URLs longas em códigos curtos e memoráveis
- **Autenticação JWT**: Sistema completo de login e autenticação
- **Rastreamento de Visitas**: Monitora cliques e estatísticas de uso
- **Observabilidade**: Métricas, logs e monitoramento integrados
- **API RESTful**: Interface completa para integração com frontends

## ✨ Funcionalidades

### 🔐 Autenticação e Usuários
- Registro e login de usuários
- Autenticação JWT com refresh tokens
- Perfis de usuário personalizados
- Proteção de rotas com guards

### 🔗 Gerenciamento de URLs
- Criação de URLs encurtadas
- URLs personalizadas (opcional)
- Redirecionamento automático
- Rastreamento de visitas e cliques
- Estatísticas de uso por usuário

### 📊 Observabilidade
- Métricas Prometheus integradas
- Logs estruturados
- Monitoramento de performance
- Rastreamento de erros

### 🛡️ Segurança
- Validação de dados com class-validator
- Hash de senhas com bcrypt
- Proteção contra ataques comuns

## 🛠️ Tecnologias

### Backend
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação
- **[TypeORM](https://typeorm.io/)** - ORM para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens
- **[bcrypt](https://github.com/dcodeIO/bcrypt.js/)** - Hash de senhas

### Observabilidade
- **[Prometheus](https://prometheus.io/)** - Métricas e monitoramento
- **[OpenTelemetry](https://opentelemetry.io/)** - Rastreamento distribuído
- **[NestJS Logger](https://docs.nestjs.com/techniques/logger)** - Sistema de logs

### Desenvolvimento
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[Docker](https://www.docker.com/)** - Containerização
- **[Swagger](https://swagger.io/)** - Documentação da API

## 🏗️ Arquitetura

```
src/
├── auth/           # Autenticação e autorização
├── users/          # Gerenciamento de usuários
├── urls/           # Lógica de encurtamento de URLs
├── database/       # Configuração do banco de dados
├── observability/  # Métricas e monitoramento
└── main.ts         # Ponto de entrada da aplicação
```

### Módulos Principais

- **AuthModule**: Gerencia autenticação JWT e guards
- **UsersModule**: CRUD de usuários e perfis
- **UrlModule**: Encurtamento e rastreamento de URLs
- **ObservabilityModule**: Métricas e monitoramento

## 🚀 Instalação

### Pré-requisitos

- Node.js 22+
- PostgreSQL 15+
- Docker (opcional)

### Instalação Local

```bash
git clone https://github.com/pedrohmirandadev/url-encoder.git
cd url-encoder

npm install

```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=url_encoder

# Application
PORT=3000
BASE_URL=http://localhost

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Observability
OTEL_ENDPOINT=http://localhost:4318/v1/traces
```

### Banco de Dados

```bash
npm run db:migrate

npm run db:generate
```

## 💻 Uso

### Desenvolvimento

```bash
npm run start:dev

npm run start:debug

npm run build
```

### Produção

```bash
npm run start:prod

docker-compose up -d
```

### Testes

```bash
npm run test

npm run test:cov

```

## 📚 API Reference

### Autenticação

#### POST `/auth/login`
Login de usuário.

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/auth/me`
Obter perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

### URLs

#### POST `/urls`
Criar uma nova URL encurtada.

```json
{
  "url": "https://example.com/very-long-url",
}
```

#### GET `/urls`
Listar URLs do usuário autenticado.

#### GET `/:code`
Redirecionar para URL original.

#### PATCH `/urls/:id`
Atualizar URL.

#### DELETE `/urls/:id`
Deletar URL.

### Documentação Swagger

Acesse a documentação interativa da API em:
```
http://localhost:3000/api
```

## 🧪 Testes

### Executar Testes

```bash
npm run test

npm run test:cov

npm run test:watch

npm test -- --testPathPattern=auth
```

### Estrutura de Testes

```
src/
├── auth/
│   ├── auth.service.spec.ts
│   └── auth.controller.spec.ts
├── users/
│   └── users.service.spec.ts
└── urls/
    ├── urls.service.spec.ts
    └── urls.controller.spec.ts
```

## 🚀 Deploy

### Docker

```bash
docker build -t url-encoder .

docker run -p 3000:3000 url-encoder
```

### Docker Compose

```bash
docker-compose up -d

docker-compose logs -f app
```

### Variáveis de Produção

```env
BASE_URL=production.com.br
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=url_encoder
JWT_SECRET=your-secure-jwt-secret
```

## 📊 Monitoramento

### Métricas Prometheus

Acesse as métricas em:
```
http://localhost:3000/metrics
```

### Logs

Os logs são estruturados e incluem:
- Timestamp
- Nível de log
- Contexto
- Mensagem
- Metadados

### Health Checks

```
GET /health
```

## Padrões de Código

- Uso TypeScript strict mode
- Sigo as convenções do NestJS
- Escrevi testes para novas funcionalidades

## 🆘 Suporte
- **Documentação**: [Swagger UI](http://localhost:3000/api)