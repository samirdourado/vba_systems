# Frontend BaaS - VBA Systems

## Visão geral

Este repositório contém o frontend do projeto BaaS, desenvolvido em React + TypeScript + Vite e voltado para a experiência do lojista e do cliente ao realizar autenticação, consultar saldo, criar saques, acessar o checkout e processar pagamentos via Pix ou cartão de crédito.

A aplicação se comunica com a API backend do projeto e centraliza a experiência de uso do painel administrativo e do fluxo de pagamento.

## Stack

- React 19
- TypeScript
- Vite
- Axios
- React Router DOM
- Lucide React
- QRCode React
- CSS customizado com classes utilitárias e estilos em componentes

## Setup local

### 1) Pré-requisitos

- Node.js 20+
- npm
- Backend em execução localmente na porta 3000

### 2) Instalar dependências

```bash
cd baas_frontend
npm install
```

### 3) Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do frontend com a URL da API backend:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Se a variável não for informada, o sistema usa como padrão:

```text
http://localhost:3000
```

### 4) Executar a aplicação em desenvolvimento

```bash
npm run dev
```

A aplicação fica disponível em:

```text
http://localhost:5173
```

### 5) Compilar e gerar build de produção

```bash
npm run build
```

### 6) Visualizar build localmente

```bash
npm run preview
```

## URL do frontend local

```text
http://localhost:5173
```

## URL da API backend esperada

O frontend espera que o backend esteja acessível em:

```text
http://localhost:3000
```

Se necessário, a variável `VITE_API_BASE_URL` deve apontar para a URL pública ou local correta do backend.

## Estrutura principal

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    checkout/
    dashboard/
  context/
    AuthContext.tsx
  pages/
    Dashboard.tsx
    Login.tsx
    Register.tsx
    RegisterSuccess.tsx
    ForgotPassword.tsx
    checkout/
  services/
    api.ts
    checkoutService.ts
    walletService.ts
    webhookService.ts
  utils/
    formatters.ts
```

## Fluxos principais

### Autenticação

O frontend possui fluxo completo de autenticação e registro de lojistas:

- `LoginPage` — login com documento e senha
- `RegisterPage` — cadastro do usuário/lojista
- `RegisterSuccessPage` — confirmação de cadastro
- `ForgotPasswordPage` — recuperação de senha

A sessão é persistida no navegador por meio do `localStorage` com os dados:

- `@BaaS:token`
- `@BaaS:user`

### Dashboard

Após o login, o usuário entra no painel principal com as seções:

- Carteira e extrato
- Solicitar saque
- Checkout / Pix / Cartão
- Webhooks

### Checkout

A página de checkout permite ao usuário:

- escolher entre Pix ou cartão
- gerar cobrança Pix
- preencher dados do cartão
- selecionar parcela e taxa
- processar pagamento direto com a API do backend

### Webhooks

A interface também expõe o gerenciamento de webhooks, permitindo ao lojista:

- consultar eventos cadastrados
- remover registros existentes

## Fluxo de autenticação no frontend

1. O usuário acessa a tela de login.
2. O frontend envia `POST /auth/login` com documento e senha.
3. A API responde com `access_token` e dados do usuário.
4. O token é salvo no `localStorage`.
5. O cliente passa a ter acesso ao dashboard e aos endpoints protegidos.
6. Todo request autenticado recebe automaticamente o header:

```http
Authorization: Bearer <token>
```

## Serviços do frontend

O arquivo principal de integração com a API está em:

- `src/services/api.ts`

Esse serviço centraliza:

- base URL da API
- autenticação automática com token
- configuração do axios para todas as requisições

### Serviços disponibilizados

- `checkoutService.ts` — checkout, Pix, cartão e consulta de fees
- `walletService.ts` — saldo e extrato
- `webhookService.ts` — listagem e exclusão de webhooks

## Endpoints usados pelo frontend

O frontend consome principalmente os endpoints abaixo do backend:

### Autenticação

- `POST /auth/register` — cadastro de lojista
- `POST /auth/login` — login do usuário
- `POST /auth/reset-password` — recuperação de senha

### Checkout

- `GET /checkout/:id` — consulta de checkout
- `POST /checkout/pix` — geração de cobrança pix
- `POST /checkout/card` — geração de cobrança por cartão
- `GET /fees` — consulta das taxas por bandeira e parcelas

### Carteira

- `GET /wallet/balance` — saldo da carteira
- `GET /wallet/transactions` — histórico financeiro

### Saques

- `POST /withdrawals` — solicitar saque
- `GET /withdrawals` — listar saques

### Webhooks

- `GET /webhooks` — listar webhooks
- `DELETE /webhooks/:id` — remover webhook

## Dados e regras do fluxo de pagamento

### Pix

O fluxo de Pix usa:

- valor da cobrança
- documento do pagador
- descrição opcional
- referência externa do pedido

### Cartão de crédito

O fluxo de cartão usa:

- valor total
- número de parcelas
- taxa `feePercent` conforme tabela do backend
- número do cartão
- nome do titular
- validade
- CVV
- descrição
- referência externa

A lógica de taxa é calculada utilizando a resposta de `/fees`, garantindo que a taxa enviada ao backend seja compatível com a bandeira e a quantidade de parcelas selecionadas.

## Fluxo de execução em desenvolvimento

```bash
cd baas_frontend
npm install
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

## Build e ambiente

```bash
npm run build
```

O build produzido será gerado na pasta `dist/` dentro do frontend.

## Segurança e boas práticas

- Nunca versionar tokens reais ou dados sensíveis do ambiente.
- Guardar o token em `localStorage` apenas para uso do ambiente local de desenvolvimento e sessão do usuário.
- Validar o uso da URL da API correta antes de deploy.
- Em produção, configurar a variável `VITE_API_BASE_URL` para apontar para o backend correto.
- Não expor segredos do gateway no frontend.

## Observações importantes

- O frontend não se comunica diretamente com o gateway; ele consome as rotas expostas pelo backend.
- O fluxo de webhook é tratado no backend e não no browser.
- A arquitetura do projeto foi pensada para manter a apresentação e a regra de negócio separadas.
- O frontend é responsável por interface, autenticação, integração com a API e apresentação do painel do lojista.

## Licença

Este projeto é parte da solução interna da VBA Systems e segue as regras de uso e distribuição do ambiente do cliente.

