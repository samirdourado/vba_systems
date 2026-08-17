# BaaS - Full Stack Project

## Visão geral

Este repositório reúne a solução full stack do projeto BaaS (Banking as a Service), desenvolvida para simular uma plataforma financeira com autenticação de lojistas, gestão de carteira, checkout de pagamentos e integrações com um gateway externo de pagamentos.

A aplicação foi estruturada em duas partes principais:

- `baas_backend`: API em NestJS responsável por autenticação, regras de negócio, integração com o gateway Lera Box e processamento de transações.
- `baas_frontend`: interface web em React + Vite + TypeScript para uso do lojista e do cliente durante o fluxo de login, dashboard, checkout e gestão de pagamentos.

A solução foi desenvolvida por Samir Dourado.

## Objetivo do projeto

O objetivo principal foi criar uma base funcional de uma plataforma de pagamentos e carteira digital, contemplando:

- cadastro e autenticação de lojistas
- dashboard com saldo e extrato
- emissão de cobranças Pix
- processamento de pagamentos por cartão de crédito
- consulta de taxas por bandeira e parcelas
- gestão de saques e webhooks
- integração com gateway externo para execução de operações financeiras

A implementação foi pensada para seguir o modelo de um BaaS, em que o backend centraliza a regra de negócio e o frontend oferece a experiência visual e interativa para o usuário final.

## Stack tecnológica

### Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT
- Swagger
- Docker Compose
- Axios

### Frontend

- React 19
- TypeScript
- Vite
- Axios
- React Router DOM
- Lucide React
- QRCode React
- CSS customizado

## Arquitetura da solução

A solução foi organizada em duas camadas principais:

### 1) Backend (`baas_backend`)

O backend é responsável por:

- cadastrar e autenticar lojistas
- gerenciar usuários e perfis
- integrar com a API do gateway Lera Box
- expor rotas de checkout, carteira e saques
- validar regras de negócio e payloads de pagamento
- processar webhooks e atualizar estados das operações
- fornecer documentação via Swagger

Principais módulos:

- `auth`: autenticação, cadastro e recuperação de senha
- `checkout`: criação e consulta de pagamentos Pix e cartão
- `wallet`: consulta de saldo e extrato
- `withdrawals`: solicitação de saques
- `fees`: consulta de taxas por bandeira e parcelas
- `webhook`: gerenciamento dos eventos recebidos do gateway
- `entities`: modelagem das entidades principais do sistema

### 2) Frontend (`baas_frontend`)

O frontend é responsável por:

- renderizar a interface do painel do lojista
- autenticar usuários no sistema
- exibir saldo, transações e extrato
- permitir a criação de saques
- apresentar checkout para Pix e cartão
- consumir os endpoints expostos pelo backend
- enviar a taxa correta conforme a tabela do gateway

Principais áreas:

- autenticação e cadastro
- dashboard financeiro
- checkout de cobrança
- painel de webhooks
- integração com API do backend mediante Axios

## Funcionalidades implementadas

### Autenticação e cadastro

- cadastro de lojista com dados pessoais e empresariais
- login por documento e senha
- proteção de rotas autenticadas via token JWT
- recuperação de senha
- persistência de sessão no frontend

### Gestão de carteira

- consulta de saldo disponível
- histórico de transações financeiras
- acompanhamento do movimento da carteira do lojista

### Pagamentos Pix

- geração de cobrança Pix
- envio de dados de valor, descrição e referência externa
- geração de QR Code e payload de cópia e cola
- retorno da intenção de cobrança para o frontend

### Pagamentos com cartão

- coleta dos dados do cartão
- identificação da bandeira do cartão
- consulta da tabela de taxas do gateway
- seleção da parcela e do `feePercent` correto
- envio do payload para processamento do gateway
- resposta com status e retorno da transação

### Saques

- criação de solicitações de saque
- consulta de movimentações e status
- integração com a carteira do lojista

### Webhooks

- recebimento de eventos de pagamento do gateway
- registro e consulta de webhooks
- exclusão dos eventos registrados
- atualização de estado do sistema conforme o retorno do gateway

## Requisitos atendidos pelo projeto

A solução foi desenvolvida considerando os requisitos de um teste de projeto full stack para BaaS, em linha com as exigências de:

- arquitetura backend/frontend separada
- autenticação segura com token
- integração financeira com gateway externo
- regras de validação para cartão e taxa
- uso de `feePercent` alinhado à tabela do gateway
- uso de URLs públicas para webhooks e callbacks
- não exposição de segredos e dados sensivos no frontend
- documentação clara dos fluxos de uso e integração

## Estrutura do repositório

```text
vba_systems/
├── baas_backend/
│   ├── src/
│   ├── test/
│   ├── package.json
│   ├── README.md
│   └── ...
├── baas_frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── README.md
│   └── ...
├── docker-compose.yml
├── README.md
└── ...
```

## Setup local

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose
- Banco MySQL disponível via Docker

### Backend

```bash
cd baas_backend
npm install
```

Subir o banco:

```bash
docker compose up -d mysql
```

Executar em modo de desenvolvimento:

```bash
npm run start:dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

Swagger em:

```text
http://localhost:3000/api/docs
```

### Frontend

```bash
cd baas_frontend
npm install
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Variáveis de ambiente

### Backend

Exemplo de variáveis principais:

```env
PORT=3000
DB_HOST='localhost'
DB_PORT='3306'
DB_USERNAME='samirdourado'
DB_PASSWORD='baas_password'
DB_DATABASE='baas_db'
GATEWAY_BASE_URL='https://api.branchpay.com.br/api'
APP_BASE_URL='https://api.seudominio.com'
WEBHOOK_SECRET='seu_secret'
JWT_SECRET='seu_jwt_secret'
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Fluxo principal de uso

1. O lojista acessa o frontend e realiza cadastro/login.
2. O backend valida as credenciais e retorna token JWT.
3. O lojista entra no dashboard e visualiza saldo, extrato e ações disponíveis.
4. O usuário pode criar cobrança Pix ou Cartão.
5. O frontend envia os dados ao backend.
6. O backend valida regras, consulta taxas e integra com o gateway.
7. O resultado da transação é retornado ao frontend.
8. O sistema registra e processa eventos por meio de webhooks.

## Observações importantes

- O frontend não comunica diretamente com o gateway; ele consome o backend.
- O backend centraliza regras financeiras e validações sensíveis.
- A lógica de taxa do cartão é calculada conforme a tabela do gateway e a bandeira do cartão.
- A URL pública do backend deve ser considerada para webhooks e callbacks em produção.
- Dados sensíveis e segredos não devem ser expostos no frontend.

## Segurança

- nunca versionar segredos reais
- manter tokens e senhas fora do repositório
- configurar variáveis de ambiente adequadamente
- evitar expor detalhes sensíveis da infraestrutura do gateway

## Licença

Este projeto é parte da solução interna da VBA Systems e segue as regras de uso e distribuição do ambiente do cliente.

## Autor

Desenvolvido por Samir Dourado.
