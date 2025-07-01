# 🔧 Guia Técnico - URL Encoder

Este documento contém informações técnicas detalhadas para desenvolvedores que trabalham no projeto URL Encoder.

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   URL Encoder   │    │   PostgreSQL    │
│                 │    │   Backend       │    │   Database      │
│ - Web App       │───▶│ - NestJS App    │───▶│ - Users         │
│ - Mobile App    │    │ - TypeORM       │    │ - URLs          │
│ - CLI Tools     │    │ - JWT Auth      │    │ - Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Módulos da Aplicação

#### 1. AuthModule
**Responsabilidades:**
- Autenticação JWT
- Validação de tokens
- Guards de proteção
- Gerenciamento de sessões

**Componentes:**
- `AuthService`: Lógica de autenticação
- `AuthController`: Endpoints de auth
- `AuthGuard`: Guard para rotas protegidas
- `OptionalAuthGuard`: Guard para rotas opcionais

#### 2. UsersModule
**Responsabilidades:**
- CRUD de usuários
- Gerenciamento de perfis
- Validação de dados

**Componentes:**
- `UsersService`: Lógica de negócio
- `UsersController`: Endpoints de usuários
- `Users` Entity: Modelo de dados

#### 3. UrlModule
**Responsabilidades:**
- Encurtamento de URLs
- Rastreamento de visitas
- Geração de códigos únicos
- Redirecionamentos

**Componentes:**
- `UrlService`: Lógica de encurtamento
- `UrlController`: Endpoints de URLs
- `Urls` Entity: Modelo de dados

#### 4. ObservabilityModule
**Responsabilidades:**
- Métricas Prometheus
- Logs estruturados
- Rastreamento distribuído
- Health checks

## 🗄️ Modelo de Dados

### Entidade Users

```typescript
@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Urls, (url) => url.user)
    urls: Urls[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
}
```

### Entidade Urls

```typescript
@Entity()
export class Urls {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({ unique: true })
    code: string;

    @Column({ default: 0 })
    clicks: number;

    @ManyToOne(() => Users, (user) => user.urls)
    user: Users;

    @Column({ nullable: true })
    user_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
```

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login**: Usuário envia credenciais
2. **Validação**: Verificação de email/senha
3. **Geração de Token**: JWT com payload do usuário
4. **Retorno**: Token de acesso
5. **Uso**: Token enviado em requisições subsequentes

### Estrutura do JWT

```typescript
interface JWTPayload {
    id: number;
    email: string;
    name: string;
    iat: number;
    exp: number;
}
```

### Guards de Autenticação

#### AuthGuard
- Protege rotas que requerem autenticação
- Valida token JWT
- Injeta dados do usuário na requisição

#### OptionalAuthGuard
- Permite acesso sem autenticação
- Injeta dados do usuário se token válido
- Útil para URLs que podem ser criadas anonimamente

## 📊 Sistema de Observabilidade

### Métricas Prometheus

```typescript
const urlCreationCounter = new Counter({
    name: 'url_creation_total',
    help: 'Total number of URLs created',
    labelNames: ['user_id', 'has_custom_code']
});

const urlRedirectCounter = new Counter({
    name: 'url_redirect_total',
    help: 'Total number of URL redirects',
    labelNames: ['url_id', 'code']
});

const urlCreationDuration = new Histogram({
    name: 'url_creation_duration_seconds',
    help: 'Duration of URL creation process',
    buckets: [0.1, 0.5, 1, 2, 5]
});
```

### Logs Estruturados

```typescript
this.logger.log({
    message: 'URL created successfully',
    urlId: url.id,
    code: url.code,
    userId: userId || 'anonymous',
    duration: Date.now() - startTime
});
```

### Health Checks

```typescript
@Get('health')
async healthCheck() {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        database: await this.checkDatabaseConnection()
    };
}
```

## 🧪 Estratégia de Testes

### Tipos de Testes

1. **Testes Unitários**: Testam funções isoladas
2. **Testes de Integração**: Testam interação entre módulos

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

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

```env
# Desenvolvimento
BASE_URL=http://localhost
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=url_encoder_dev

# JWT
JWT_SECRET=dev-secret-key

# Observability
OTEL_ENDPOINT=http://localhost:4318/v1/traces
```

### Scripts de Desenvolvimento

```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "db:generate": "npm run typeorm migration:generate",
    "db:migrate": "npm run typeorm migration:run",
    "db:drop": "npm run typeorm schema:drop"
  }
}
```

## 🚀 Deploy e Produção

### Docker

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Docker Compose

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_PORT: ${DB_PORT}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
    ports:
      - "${PORT}:${PORT}"
```

### Configuração de Produção

```env
# Produção
BASE_URL=production_host.com.br
PORT=3000

# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_DATABASE=url_encoder_prod

# JWT
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRES_IN=1d

# Observability
OTEL_ENDPOINT=https://your-otel-collector.com/v1/traces
```

## 🔒 Segurança

### Validação de Dados

```typescript
export class CreateUrlDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;
}
```

## 📚 Recursos Adicionais

### Documentação da API
- Swagger UI: `http://localhost:3000/api`
- OpenAPI Specification: `http://localhost:3000/api-json`

### Monitoramento
- Métricas Prometheus: `http://localhost:3000/metrics`
- Health Check: `http://localhost:3000/health`

### Desenvolvimento
- Hot Reload: `npm run start:dev`
- Debug Mode: `npm run start:debug`
- Test Coverage: `npm run test:cov`

---

Para mais informações, consulte a [documentação principal](../README.md) ou os [exemplos de uso](./API_EXAMPLES.md). ****