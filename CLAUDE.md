# CLAUDE.md — GameLog

> Este arquivo é o **briefing permanente** do projeto. O Claude Code lê
> este arquivo automaticamente sempre que é iniciado no diretório do
> repositório e usa seu conteúdo como fonte de verdade para todas as
> decisões técnicas. Trate-o como um contrato: o que estiver aqui deve
> ser seguido sem exceções.
>
> **Fonte de verdade cruzada:** este arquivo está alinhado com os
> Apêndices A (Requisitos Funcionais) e B (Bateria de Casos de Teste)
> do TCC. Qualquer alteração aqui deve ser propagada para esses dois
> apêndices, e vice-versa.

---

## 1. Contexto do projeto

**GameLog** é uma aplicação web de *backlog de jogos*: cada usuário
autenticado pode cadastrar jogos que possui ou pretende jogar,
acompanhar seu progresso (status, horas jogadas, avaliação) e visualizar
estatísticas do seu backlog.

Este projeto é o **objeto de estudo empírico** de um Trabalho de
Conclusão de Curso (TCC) do curso de Ciência da Computação da
Universidade Tiradentes (UNIT), sob orientação do Prof. Sergio Roberto
Santos Santana. O TCC compara **três abordagens de teste** sobre a
mesma aplicação: teste manual roteirizado, teste manual exploratório e
teste automatizado com Cypress — medindo tempo de execução, cobertura,
capacidade de detecção de defeitos, esforço e caracterizando a
complementaridade entre as abordagens.

**Consequências práticas dessa finalidade:**

- Todo elemento interativo do frontend recebe um atributo `data-cy`
  com identificador único e estável (ver Seção 5).
- O código deve ser **realista mas simples**: sem otimizações
  prematuras, sem microserviços, sem abstrações desnecessárias.
- A aplicação será clonada em duas branches (`main` limpa e `buggy`
  com 24 defeitos injetados) para o experimento comparativo.
- Toda horinha dedicada ao Bloco 4 (sweep de `data-cy` + escrita da
  suíte Cypress) deve ser anotada no `dev-log.md` da raiz do
  repositório — esse valor (`T_setup`) entra na Equação do ponto de
  equilíbrio econômico da Seção 4.8 do TCC.

---

## 2. Stack tecnológica (definitiva — não trocar)

### Monorepo
- Gerenciador: **npm workspaces** (nativo, sem instalar nada extra).
- Estrutura: `apps/web` (frontend) e `apps/api` (backend).

### Frontend (`apps/web`)
- **React 18** + **Vite** + **TypeScript**
- **React Router v6** para rotas
- **TanStack Query (React Query)** para estado do servidor
- **React Hook Form** + **Zod** para formulários e validação
- **Tailwind CSS** para estilização
- **Axios** para requisições HTTP
- **vite-plugin-istanbul** para instrumentação de cobertura
  (obrigatório — usado pelos três cenários do experimento)

### Backend (`apps/api`)
- **Node.js 20+** + **Express 4** + **TypeScript**
- **Prisma ORM** com **SQLite** (arquivo local `apps/api/prisma/dev.db`)
- **JWT** (`jsonwebtoken`) para autenticação, validade 24h
- **bcrypt** para hash de senhas
- **Zod** para validação de payloads
- **CORS** habilitado para o frontend em `http://localhost:5173`

### Testes E2E
- **Cypress 13+** na raiz do monorepo (`e2e/`), rodando sobre a
  aplicação web em execução local.
- Instrumentação de cobertura com `@cypress/code-coverage` +
  `istanbul-lib-coverage`.

**NÃO usar:** Next.js, Redux, styled-components, Yarn/pnpm, MongoDB,
Sequelize, Selenium, Playwright, Jest para E2E, MUI, Bootstrap.

---

## 3. Estrutura de diretórios

```
gamelog/
├── apps/
│   ├── api/                          # Backend
│   │   ├── src/
│   │   │   ├── config/               # env, prisma, jwt
│   │   │   ├── middlewares/          # auth, error handler
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # login, register
│   │   │   │   ├── users/            # perfil do usuário logado
│   │   │   │   ├── games/            # CRUD de jogos
│   │   │   │   └── stats/            # estatísticas do backlog
│   │   │   ├── routes.ts             # agregador de rotas
│   │   │   └── server.ts             # bootstrap do Express
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                          # Frontend
│       ├── src/
│       │   ├── components/           # componentes reutilizáveis
│       │   ├── pages/                # páginas de rota
│       │   │   ├── LoginPage.tsx
│       │   │   ├── RegisterPage.tsx
│       │   │   ├── GamesListPage.tsx
│       │   │   ├── GameDetailPage.tsx
│       │   │   ├── GameFormPage.tsx
│       │   │   └── DashboardPage.tsx
│       │   ├── hooks/                # custom hooks (useAuth, useGames)
│       │   ├── services/             # camada de acesso à API (axios)
│       │   ├── contexts/             # AuthContext
│       │   ├── types/                # tipos compartilhados
│       │   ├── utils/                # helpers puros
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts            # com vite-plugin-istanbul
│       └── tailwind.config.ts
├── e2e/                              # Testes Cypress
│   ├── cypress/
│   │   ├── e2e/                      # arquivos .cy.ts
│   │   ├── fixtures/
│   │   ├── support/
│   │   │   ├── commands.ts
│   │   │   └── e2e.ts
│   │   └── downloads/
│   ├── cypress.config.ts
│   └── package.json
├── docs/                             # documentação do experimento
│   ├── casos-de-teste.md             # bateria manual (= Apêndice B)
│   └── gabarito-bugs.md              # 24 defeitos injetados
├── dev-log.md                        # registro de horas de desenvolvimento
├── package.json                      # workspaces + scripts globais
├── tsconfig.base.json
├── .gitignore
├── .env.example
└── README.md
```

---

## 4. Modelo de dados

Definido em `apps/api/prisma/schema.prisma`. Não alterar sem justificativa
e sem atualizar os Apêndices A e B do TCC.

```prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  games        Game[]
  sessions     PlaySession[]
}

model Game {
  id          String        @id @default(uuid())
  userId      String
  title       String
  platform    String        // "PC", "PS5", "Switch", "Xbox", "Mobile", "Outros"
  genre       String?       // "RPG", "FPS", "Estratégia", "Indie", etc.
  status      GameStatus    @default(BACKLOG)
  rating      Int?          // 1 a 10, nullable até avaliar
  coverUrl    String?
  notes       String?
  addedAt     DateTime      @default(now())
  finishedAt  DateTime?
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions    PlaySession[]
}

enum GameStatus {
  BACKLOG      // ainda não começou
  PLAYING      // jogando atualmente
  COMPLETED    // finalizado
  ABANDONED    // desistiu
}

model PlaySession {
  id          String   @id @default(uuid())
  userId      String
  gameId      String
  hours       Float    // horas jogadas nesta sessão (ex.: 1.5)
  playedAt    DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
}
```

### Rótulos de UI para `GameStatus`

O enum fica em inglês no banco e na API (padrão de código), mas a
**interface mostra sempre em português** com os seguintes rótulos
fixos (sem alternância):

| Enum        | Rótulo na UI  |
|-------------|---------------|
| `BACKLOG`   | A jogar       |
| `PLAYING`   | Jogando       |
| `COMPLETED` | Concluído     |
| `ABANDONED` | Abandonado    |

Todo componente que mostra ou lista status deve ler esse mapeamento
de `apps/web/src/utils/game-status-labels.ts`.

---

## 5. Convenção de seletores `data-cy` (CRÍTICO)

Este é o padrão mais importante do projeto. **Todo elemento interativo
ou com estado observável** deve receber um atributo `data-cy` com
identificador estável.

### Quando inserir os `data-cy`

> **IMPORTANTE:** os atributos `data-cy` **NÃO** devem ser adicionados
> durante os Blocos 1--3 (bootstrap, backend e frontend). Eles entram
> apenas no **Bloco 4a** (Seção 10) como uma passagem dedicada de
> testabilidade sobre o \emph{frontend} já completo.
>
> Motivo: a medição do `T_setup` da Seção 4.8 do TCC exige que o
> esforço de tornar a aplicação testável seja contabilizado
> integralmente como custo de adoção da automação, isolado do
> esforço de desenvolver as funcionalidades. Misturar as duas
> coisas invalida o número que vai pra equação do ponto de
> equilíbrio.
>
> Portanto, enquanto estiver no Bloco 3, construa os componentes
> React normalmente, **sem nenhum atributo** `data-cy`. Quando chegar
> no Bloco 4a, você fará um \emph{sweep} componente por componente
> adicionando os atributos conforme a convenção abaixo.

### Regras

1. Formato: `kebab-case`, começando pelo contexto e depois pelo elemento.
   - Exemplos: `login-email-input`, `login-submit-button`,
     `games-list-item`, `game-card-title`, `game-status-badge`.
2. **Nunca** basear seletores Cypress em classes CSS ou textos —
   sempre em `data-cy`.
3. Listas repetidas usam o mesmo `data-cy` no wrapper e sufixos
   contextuais nos filhos:
   - `data-cy="game-card"` no card
   - `data-cy="game-card-title"` no título dentro do card
   - `data-cy="game-card-status"` no badge de status
4. Estados (loading, error, empty) recebem seletores próprios:
   - `data-cy="games-list-loading"`
   - `data-cy="games-list-empty"`
   - `data-cy="games-list-error"`
5. Toasts/mensagens de feedback:
   - `data-cy="toast-success"` / `data-cy="toast-error"`

### Inventário mínimo de `data-cy` (o Claude Code deve garantir)

**Autenticação:**
- `login-email-input`, `login-password-input`, `login-submit-button`
- `login-error-message`, `login-register-link`
- `register-name-input`, `register-email-input`,
  `register-password-input`, `register-password-confirm-input`
- `register-submit-button`, `register-error-message`
- `header-user-menu`, `header-logout-button`

**Lista de jogos:**
- `games-list`, `games-list-empty`, `games-list-loading`
- `games-add-button`
- `games-filter-status`, `games-filter-platform`, `games-search-input`
- `game-card`, `game-card-title`, `game-card-platform`,
  `game-card-status`, `game-card-rating`

**Formulário de jogo:**
- `game-form`, `game-form-title-input`, `game-form-platform-select`
- `game-form-genre-input`, `game-form-status-select`
- `game-form-cover-input`, `game-form-notes-input`
- `game-form-submit-button`, `game-form-cancel-button`
- `game-form-error-message`

**Detalhe do jogo:**
- `game-detail`, `game-detail-title`, `game-detail-status-badge`
- `game-detail-rating`, `game-detail-hours-total`
- `game-detail-edit-button`, `game-detail-delete-button`
- `game-detail-delete-confirm`, `game-detail-delete-cancel`
- `game-detail-add-session-button`
- `game-detail-rate-button` (visível apenas se `status = COMPLETED`)
- `session-form`, `session-hours-input`, `session-submit-button`
- `sessions-list`, `session-item`

**Dashboard:**
- `dashboard-stat-total-games`, `dashboard-stat-completed`
- `dashboard-stat-playing`, `dashboard-stat-backlog`,
  `dashboard-stat-abandoned`
- `dashboard-stat-total-hours`, `dashboard-stat-avg-rating`
- `dashboard-recent-sessions`, `dashboard-top-rated`

---

## 6. Endpoints da API (contrato)

Prefixo: `/api`. Autenticação: Bearer JWT no header `Authorization`
(exceto `/auth/*`).

| Método | Rota                        | Descrição                            |
|--------|-----------------------------|--------------------------------------|
| POST   | /auth/register              | Cria usuário                         |
| POST   | /auth/login                 | Autentica, retorna JWT (24h)         |
| GET    | /users/me                   | Retorna usuário logado               |
| GET    | /games                      | Lista jogos do usuário (com filtros) |
| POST   | /games                      | Cria jogo                            |
| GET    | /games/:id                  | Detalha jogo                         |
| PATCH  | /games/:id                  | Atualiza jogo (inclui rating)        |
| DELETE | /games/:id                  | Remove jogo                          |
| POST   | /games/:id/sessions         | Registra sessão de jogo              |
| GET    | /games/:id/sessions         | Lista sessões do jogo                |
| GET    | /stats                      | Estatísticas do backlog do usuário   |

**Filtros suportados em `GET /games`:** `?status=`, `?platform=`,
`?search=` (busca por título).

**Códigos de resposta padronizados:**
- 200/201 sucesso; 400 validação; 401 sem token ou token inválido;
  403 token de outro usuário tentando acessar recurso; 404 não
  encontrado; 500 erro interno com JSON
  `{ error: { code, message } }`.

**Logout:** não há endpoint. O logout é **puramente cliente**:
remove-se o JWT do `localStorage` e redireciona para `/login`. O
token continua tecnicamente válido no backend até expirar (24h); a
decisão é consciente por simplicidade do escopo do TCC.

---

## 7. Regras de negócio (não confundir com bugs)

Estas são as regras **corretas** que a branch `main` deve implementar.
Qualquer desvio destas na branch `main` é um bug real.

1. **Cadastro de usuário:**
   - Email deve ser único (case-insensitive).
   - Senha mínimo 8 caracteres, deve conter letra e número.
   - Confirmação de senha obrigatória e igual à senha.
2. **Login:** retorna JWT com validade de 24h. Mensagem de erro
   genérica em caso de credencial inválida (não distingue email
   inexistente de senha incorreta).
3. **Logout:** limpa JWT do `localStorage` do navegador e redireciona
   para `/login`.
4. **Autorização:** um usuário só enxerga e altera seus próprios jogos
   e sessões. Tentativa de acesso cruzado retorna 403 (ou 404 por
   ocultação, decisão deixada ao desenvolvedor — mas consistente).
5. **Criação de jogo:**
   - Título obrigatório (1 a 120 caracteres).
   - Plataforma obrigatória (enum: PC, PS5, Switch, Xbox, Mobile, Outros).
   - Gênero opcional.
   - Status padrão: `BACKLOG`.
   - Capa (`coverUrl`) opcional.
6. **Edição de jogo:**
   - Mesmas regras de validação da criação.
   - Não permite editar jogo que não seja do próprio usuário.
7. **Remoção de jogo:**
   - Exige confirmação explícita (modal) no frontend.
   - Remove em cascata as `PlaySession` associadas (via Prisma).
8. **Transição de status:**
   - É livre entre quaisquer dois status (não há máquina de estados
     restritiva).
   - Ao passar para `COMPLETED`, `finishedAt` é preenchido
     automaticamente com `now()`.
   - Ao mudar para qualquer outro status, `finishedAt` é limpo
     (`null`).
9. **Avaliação (rating):**
   - **Só permitida se `status = COMPLETED`.** Qualquer outro status
     recebe 400 com mensagem clara.
   - Valor inteiro de 1 a 10.
   - Pode ser alterado quantas vezes o usuário quiser (desde que o
     status permaneça COMPLETED).
10. **Sessão de jogo:**
    - `hours` deve ser `> 0` e `<= 24` (número decimal permitido,
      ex.: 1.5).
    - **Só pode ser registrada em jogos com status `PLAYING` ou
      `COMPLETED`.** Jogos em `BACKLOG` ou `ABANDONED` rejeitam o
      registro.
    - Só pode ser registrada em jogos do próprio usuário.
11. **Total de horas:** soma agregada das `PlaySession.hours` do jogo.
12. **Estatísticas (`GET /stats`):**
    - `totalGames`: contagem total.
    - `completed`, `playing`, `backlog`, `abandoned`: contagem por
      status.
    - `totalHours`: soma de todas as `PlaySession.hours` do usuário.
    - `avgRating`: média das avaliações não nulas (apenas de jogos
      `COMPLETED` com rating preenchido), com 1 casa decimal. Se
      não houver nenhum jogo avaliado, retorna `null`.

---

## 8. Scripts do monorepo

Na raiz (`package.json`):

```jsonc
{
  "scripts": {
    "dev":        "npm run dev --workspaces --if-present",
    "dev:web":    "npm run dev --workspace apps/web",
    "dev:api":    "npm run dev --workspace apps/api",
    "build":      "npm run build --workspaces --if-present",
    "test:e2e":   "npm run test --workspace e2e",
    "test:e2e:open": "npm run open --workspace e2e",
    "test:e2e:10x": "npm run test:10x --workspace e2e",
    "seed":       "npm run seed --workspace apps/api",
    "prisma:migrate": "npm run migrate --workspace apps/api",
    "prisma:reset": "npm run reset --workspace apps/api"
  }
}
```

O backend roda em `http://localhost:3333` e o frontend em
`http://localhost:5173` (padrão do Vite).

**`test:e2e:10x`** executa a suíte Cypress em modo headless dez vezes
consecutivas, resetando o banco entre rodadas, e consolida tempos e
cobertura num único relatório — esse é o script que o Cenário C do
experimento utiliza.

---

## 9. Padrões de código

- **TypeScript estrito:** `strict: true`, sem `any` implícito —
  usar `unknown` + narrow ou tipos explícitos.
- **Nomes:** arquivos `.tsx` para componentes React, `.ts` para lógica
  pura. Componentes em `PascalCase`, hooks em `camelCase` começando
  com `use`.
- **Validação:** todo payload de entrada da API é validado com Zod
  no controller antes de chegar ao service.
- **Erros:** `throw new HttpError(status, code, message)` (classe
  utilitária). Um middleware global converte em JSON de resposta.
- **Comentários:** só quando necessários; código autoexplicativo é
  preferido.
- **Nenhum uso de `console.log` em código de produção** — use um
  logger simples (`pino` ou o próprio `console` isolado em
  `config/logger.ts`).

---

## 10. Ordem sugerida de implementação

O Claude Code deve construir o projeto **nesta ordem**, confirmando
cada bloco antes de passar ao próximo:

1. **Bootstrap do monorepo:** `package.json` raiz com workspaces,
   `tsconfig.base.json`, `.gitignore`, `.env.example`, `README.md`
   inicial.
2. **Backend (`apps/api`):**
   - Estrutura de pastas + `server.ts` + `prisma/schema.prisma`.
   - Rodar `prisma migrate dev` para gerar o banco.
   - Módulo `auth` (register, login, middleware JWT).
   - Módulo `users` (`/users/me`).
   - Módulo `games` (CRUD completo com autorização, incluindo as
     regras 8, 9 e 10 da Seção 7 — rating só COMPLETED,
     finishedAt automático, sessão só em PLAYING/COMPLETED).
   - Módulo `sessions` embutido em `games`.
   - Módulo `stats`.
   - `seed.ts` com um usuário de teste (`teste@gamelog.com` / `Senha123`)
     e ~10 jogos variados cobrindo os 4 status.
3. **Frontend (`apps/web`):**
   - Bootstrap Vite + Tailwind + `vite-plugin-istanbul`.
   - `AuthContext` + `services/api.ts` (axios com interceptor de token).
   - `utils/game-status-labels.ts` (mapeamento enum → PT da Seção 4).
   - Páginas de login e cadastro.
   - Layout autenticado + header com logout.
   - Dashboard.
   - Lista de jogos com filtros e busca.
   - Formulário de criação/edição.
   - Detalhe do jogo com sessões e botão de avaliar (só se
     `status = COMPLETED`).
   - **NENHUM** atributo `data-cy` neste bloco (serão adicionados
     no Bloco 4a). Veja a nota em destaque na Seção 5.
4. **Cypress (`e2e/`) — dividido em dois sub-blocos:**

   **4a. Sweep de testabilidade (`data-cy`):**
   - Página por página do \emph{frontend}, adicionar os atributos
     `data-cy` em todos os elementos interativos conforme o inventário
     da Seção 5.
   - Garantir estados observáveis (`loading`, `empty`, `error`) com
     seletores próprios.
   - Nenhuma lógica de negócio deve ser alterada neste sub-bloco:
     cada \emph{commit} adiciona apenas atributos ao JSX, sem mudar
     comportamento.
   - **Todo o tempo deste sub-bloco é contabilizado como `T_setup`
     no `dev-log.md`.**

   **4b. Configuração e escrita dos testes Cypress:**
   - Configuração do Cypress (`cypress.config.ts`,
     `support/e2e.ts`).
   - `support/commands.ts` com `cy.login()` (via API, sem passar
     pela tela) e `cy.resetDatabase()`.
   - `fixtures/` com massa de dados.
   - Os seis arquivos `.cy.ts` descritos na Seção 11, cobrindo os
     30 CTs automatizáveis do Apêndice B do TCC.
   - **Todo o tempo deste sub-bloco também é contabilizado como
     `T_setup`.**

   **Ao final do Bloco 4b** (não antes), congelar a `main` com a
   \emph{tag} `v1.0-experimento`. Essa é a linha de base dos três
   cenários do experimento.
5. **Documentação (`docs/`):**
   - `casos-de-teste.md`: bateria manual completa (= Apêndice B
     do TCC).
   - `gabarito-bugs.md`: será preenchido depois, na branch `buggy`.
6. **`dev-log.md`:** manter atualizado a cada sessão de trabalho.
   O valor de `T_setup` que entra na Equação 3 da Seção 4.8 do TCC é
   calculado como:
   \begin{center}
     `T_setup = Σ(horas Bloco 4a) + Σ(horas Bloco 4b)`
   \end{center}
   Os Blocos 1--3 **não** compõem `T_setup`, mas devem ser registrados
   mesmo assim para contextualização do porte da aplicação na
   Seção 3.2 do TCC.

**Não implementar tudo em uma tacada só.** Ao final de cada bloco, o
Claude Code deve:
- Rodar `npm run build` e garantir que compila.
- Rodar `npm run dev` e mostrar que sobe sem erros.
- Aguardar validação antes de seguir.

---

## 11. Escopo mínimo da suíte Cypress

A suíte deve cobrir os **30 casos de teste automatizáveis** da bateria
do Apêndice B do TCC (os 32 CTs menos CT06 e CT29, que são
inviabilizados por natureza). Organização em 6 arquivos:

1. `auth.cy.ts` — CT01 a CT05 e CT07 (cadastro, login válido, login
   inválido, logout).
2. `games-crud.cy.ts` — CT08 a CT15 e CT30 a CT31 (criar jogo, editar
   jogo, excluir jogo, validações de formulário).
3. `games-status-rating.cy.ts` — CT16 a CT20 e CT32 (transição de
   status, finishedAt automático, avaliar apenas se COMPLETED,
   rating no intervalo válido).
4. `games-sessions.cy.ts` — CT21 a CT23 (sessão com horas válidas,
   rejeitar fora do intervalo, rejeitar em jogo com status
   BACKLOG ou ABANDONED).
5. `games-list.cy.ts` — CT24 a CT26 (listar, filtrar, buscar,
   isolamento entre usuários).
6. `dashboard.cy.ts` — CT27 a CT28 (contagens por status, soma de
   horas; a CT29 referente à média de rating foi deixada manual).

Cada arquivo `.cy.ts` deve usar apenas seletores `data-cy` e um custom
command `cy.login(email, password)` que faz login via API e injeta o
token no `localStorage`.

---

## 12. O que NÃO fazer

- **Não** adicionar dependências fora da stack da Seção 2 sem confirmar.
- **Não** criar arquivos README dentro de subpastas (o README raiz
  basta).
- **Não** implementar features fora do escopo (chat, comentários,
  amigos, upload de arquivos, i18n, visão pública de backlog, lista
  de desejos separada).
- **Não** usar seletores CSS ou textos em testes Cypress.
- **Não** commitar `.env`, `node_modules/`, `dev.db`, `dist/`, `build/`.
- **Não** injetar bugs propositais na branch `main` — essa branch é
  a **referência** limpa.
- **Não** criar endpoint de logout no backend — o logout é cliente-side
  (Seção 6).

---

## 13. Contexto do TCC (para lembrar propósito)

- **Autor:** Gabriel Angelo da Silva Barros
- **Orientador:** Prof. Sergio Roberto Santos Santana
- **Curso:** Ciência da Computação — UNIT
- **Título:** Testes de Software: Uma Análise da Eficiência entre
  Abordagens Manuais e Automatizadas
- **Uso do código:**
  - Branch `main` = versão limpa (referência), congelada numa tag
    `v1.0-experimento`.
  - Branch `buggy` = versão com **24 defeitos injetados** (B01–B24),
    criada depois do congelamento da `main`, com perfil de severidade
    10 baixa / 10 média / 4 alta.
  - Três QAs externos testarão a branch `buggy`: primeiro em
    sessão exploratória de 60 min (Cenário B), depois na bateria
    roteirizada do Apêndice B (Cenário A).
  - A suíte Cypress testará a mesma branch automaticamente
    (Cenário C), executada 10 vezes em modo headless.
  - Métricas coletadas: tempo, defeitos detectados, falsos positivos,
    defeitos nativos, cobertura, esforço, complementaridade entre
    abordagens.
