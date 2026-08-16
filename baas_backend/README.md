# Backend BaaS - VBA Systems

## Visão geral

Este repositório contém a API backend do projeto BaaS, desenvolvida em NestJS e integrada ao gateway Lera Box para cadastro de lojistas, autenticação, gestão de carteira, checkout, webhooks e saques.

A aplicação expõe a documentação interativa via Swagger para facilitar testes e integração.

## Stack

- Node.js
- NestJS
- TypeScript
- MySQL
- TypeORM
- JWT
- Swagger
- Docker Compose

## Setup local

### 1) Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose
- MySQL 8 (subido via Docker no projeto)

### 2) Instalar dependências

```bash
cd baas_backend
npm install
```

### 3) Subir o banco MySQL com Docker

No diretório raiz do workspace:

```bash
docker compose up -d mysql
```

Isso cria o container com:

- banco: `baas_db`
- usuário: `samirdourado`
- senha: `baas_password`
- porta: `3306`

### 4) Configurar variáveis de ambiente

O projeto inclui um arquivo de ambiente `.env` para desenvolvimento local; ele é lido automaticamente pelo NestJS e contém as variáveis principais:

```env
PORT=3000

DB_HOST='localhost'
DB_PORT='3306'
DB_USERNAME='samirdourado'
DB_PASSWORD='baas_password'
DB_DATABASE='baas_db'

GATEWAY_BASE_URL='https://api.branchpay.com.br/api'
APP_BASE_URL='https://api.seudominio.com'
WEBHOOK_SECRET='DLhxy@4oW%'
JWT_SECRET='8Acp8f@bWT'
```

> Caso queira rodar em outro ambiente, ajuste essas variáveis antes de iniciar a API.

### 5) Compilar e executar a aplicação

```bash
# desenvolvimento
npm run start

# watch mode
npm run start:dev

# produção
npm run start:prod
```

### 6) Verificar a aplicação

A API inicia na porta 3000 por padrão.

- API local: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## URL do Swagger da aplicação baas

A documentação OpenAPI/Swagger está disponível em:

```text
http://localhost:3000/api/docs
```

Essa rota é o ponto principal para consultar endpoints, autenticar tokens Bearer e testar os fluxos de cadastro, login, carteira, checkout e webhook.

## URL pública e/ou Docker disponível

No estado atual do projeto, não há uma URL pública de produção configurada e nem um container da API no `docker-compose.yml`.

Ambiente disponível atualmente:

- Banco em Docker: `docker compose up -d mysql`
- API local: `http://localhost:3000`
- Swagger local: `http://localhost:3000/api/docs`

Se a aplicação for implantada em um ambiente externo, o valor de `APP_BASE_URL` deve apontar para a URL pública da API e as rotas de webhook devem refletir esse domínio.

## Credenciais de demonstração

Para fins de documentação e testes locais, o login do BaaS usa o documento cadastrado do lojista e a senha configurada no cadastro.

- Documento de exemplo: `340xxxxx801`
- Endpoint: `POST /auth/login`
- Tipo de autenticação: `document` + `password`

Importante:

- Não compartilhe a senha do e-mail usado no gateway.
- Não exponha o e-mail do gateway em documentação pública.
- O e-mail do cadastro deve ser tratado como dado sensível do ambiente de uso autorizado.

Exemplo de payload para login:

```json
{
  "document": "340xxxxx801",
  "password": "SuaSenhaCadastrada"
}
```

> O valor acima deve ser usado apenas como referência mascarada do CPF e não como dado real compartilhável em ambiente público.

## Endpoints principais

### Autenticação

- `POST /auth/register` — cadastro de usuário/lojista
- `POST /auth/login` — login público com documento e senha
- `GET /auth/me` — dados do usuário autenticado
- `POST /auth/reset-password` — reset de senha

### Checkout

- `POST /checkout/pix` — geração de cobrança pix
- `POST /checkout/card` — geração de cobrança por cartão
- `GET /checkout/:id` — consulta de checkout

### Carteira

- `GET /wallet/balance` — saldo da carteira
- `GET /wallet/transactions` — histórico de transações

### Saques

- `POST /withdrawals` — solicitar saque
- `GET /withdrawals` — listar saques

### Webhooks

- `POST /webhook` — recebimento de eventos do gateway
- `GET /webhook` — listar eventos
- `DELETE /webhook/:id` — remover evento

## Fluxo de autenticação

1. O lojista realiza cadastro em `POST /auth/register`.
2. O backend registra o usuário localmente e integra com o gateway Lera Box.
3. O login é feito em `POST /auth/login` com CPF/CNPJ e senha.
4. A resposta retorna um `access_token` JWT em formato Bearer.
5. Os endpoints protegidos usam o cabeçalho:

```http
Authorization: Bearer <token>
```

## Run tests

```bash
# testes unitários
npm run test

# testes e2e
npm run test:e2e

# cobertura
npm run test:cov
```

## Hints

```bash
# criar módulo
npx nest g module modules/module-name

# criar controller
npx nest g controller modules/controller-name

# criar service
npx nest g service modules/service-name
```

## Observações importantes

- A API usa validação global com `ValidationPipe`.
- O CORS está habilitado.
- O Swagger é montado em `/api/docs`.
- O backend depende do gateway Lera Box para autenticação e processamento financeiro.
- Para produção, é necessário revisar segredo JWT, webhook secret e URLs públicas antes do deploy.

## Segurança

- Nunca versionar senhas reais nem tokens de produção.
- Não compartilhar credenciais do gateway em issues, PRs ou documentos públicos.
- Usar ambiente com variáveis sensíveis protegidas.

## Licença

Este projeto é parte da solução interna da VBA Systems e segue as regras de uso e distribuição do ambiente do cliente.
