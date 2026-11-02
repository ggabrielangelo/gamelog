# GameLog

Aplicação web de **backlog de jogos**: usuários autenticados cadastram
jogos que possuem ou pretendem jogar, acompanham progresso (status,
horas, avaliação) e visualizam estatísticas do backlog.

Este repositório é o **objeto de estudo empírico** do TCC *"Testes de
Software: Uma Análise da Eficiência entre Abordagens Manuais e
Automatizadas"* (Gabriel Angelo da Silva Barros — UNIT, Ciência da
Computação). O código serve de base para a comparação entre três
abordagens de teste (manual roteirizado, manual exploratório e
automatizado com Cypress) sobre uma versão limpa (`main`) e uma versão
com 24 defeitos injetados (`buggy`).

> As decisões de stack, modelo de dados, convenções de código, padrão
> `data-cy`, regras de negócio e ordem de implementação estão
> **congeladas** no arquivo [`CLAUDE.md`](./CLAUDE.md). Esse arquivo é
> a fonte de verdade do projeto.

## Stack

- **Monorepo:** npm workspaces (`apps/api`, `apps/web`, `e2e`).
- **Backend:** Node 20 + Express + TypeScript + Prisma (SQLite) + JWT.
- **Frontend:** React 18 + Vite + TypeScript + Tailwind + React Router
  + TanStack Query + React Hook Form + Zod + Axios.
- **Testes E2E:** Cypress 13 com `@cypress/code-coverage`.

## Pré-requisitos

- Node.js **≥ 20**
- npm **≥ 10** (acompanha o Node 20)

## Primeiros passos

```bash
# 1. Instalar dependências de todos os workspaces
npm install

# 2. Copiar as variáveis de ambiente
cp .env.example .env

# 3. Gerar o banco de dados local (SQLite via Prisma)
npm run prisma:migrate

# 4. Popular com dados de teste
npm run seed

# 5. Subir API (porta 3333) e Web (porta 5173) juntos
npm run dev
```

A API responde em <http://localhost:3333/api> e o frontend em
<http://localhost:5173>.

### Usuário de teste (seed)

- **E-mail:** `teste@gamelog.com`
- **Senha:** `Senha123`

## Scripts do monorepo

| Script                     | Descrição                                                           |
|----------------------------|---------------------------------------------------------------------|
| `npm run dev`              | Sobe API e Web em paralelo (via `--workspaces --if-present`)        |
| `npm run dev:api`          | Só o backend                                                        |
| `npm run dev:web`          | Só o frontend                                                       |
| `npm run build`            | Build de produção dos workspaces                                    |
| `npm run seed`             | Popula o banco com usuário de teste e jogos                         |
| `npm run prisma:migrate`   | Aplica/gera migrações do Prisma                                     |
| `npm run prisma:reset`     | **Zera** o banco e reaplica migrações                               |
| `npm run test:e2e`         | Executa a suíte Cypress em modo headless                            |
| `npm run test:e2e:open`    | Abre a Cypress Test Runner                                          |
| `npm run test:e2e:10x`     | Roda a suíte Cypress 10× (cenário C do experimento)                 |

## Estrutura

```
gamelog/
├── apps/
│   ├── api/   # Backend Express + Prisma
│   └── web/   # Frontend React + Vite
├── e2e/       # Suíte Cypress
├── docs/      # Documentação do experimento (CTs, gabarito de bugs)
├── CLAUDE.md  # Briefing permanente do projeto (fonte de verdade)
└── dev-log.md # Registro de horas de desenvolvimento (T_setup etc.)
```

## Branches do experimento

- **`main`** — versão limpa, congelada na tag `v1.0-experimento` ao
  final do Bloco 4b.
- **`buggy`** — bifurcada da `v1.0-experimento` com 24 defeitos
  injetados (B01–B24), perfil 10 baixa / 10 média / 4 alta.

## Licença

Uso acadêmico — TCC UNIT 2026. Sem licença de redistribuição definida.
