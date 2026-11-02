# dev-log.md — GameLog

Registro cronológico das sessões de desenvolvimento. Serve de insumo
para a Seção 3.2 e para a **Equação 3 da Seção 4.8** do TCC (ponto de
equilíbrio econômico da automação).

> **Regra de contagem:**
>
> - Horas dos **Blocos 1, 2 e 3** contextualizam o porte da aplicação
>   mas **não** entram no `T_setup`.
> - Horas dos **Blocos 4a (sweep de `data-cy`) e 4b (Cypress)** compõem
>   integralmente o `T_setup`.
> - `T_setup = Σ(horas Bloco 4a) + Σ(horas Bloco 4b)`.

## Formato de cada entrada

```
### YYYY-MM-DD — Bloco X · <subtítulo opcional>
- Início: HH:MM
- Fim: HH:MM
- Duração: Xh YYmin
- Atividades:
  - ...
- Observações:
  - ...
```

---

## Sessões

### 2026-10-29 — Bloco 1 · Bootstrap do monorepo
- Início: _preencher_
- Fim: _preencher_
- Duração: _preencher_
- Atividades:
  - Criação do `package.json` raiz com `npm workspaces`
    (`apps/*`, `e2e`).
  - `tsconfig.base.json` estrito compartilhado.
  - `.gitignore` cobrindo node, build, Prisma, Cypress, env, editores.
  - `.env.example` com variáveis de API e Web.
  - `README.md` inicial com onboarding, scripts e estrutura.
  - Estrutura mínima de diretórios (`apps/api`, `apps/web`, `e2e`,
    `docs`).
  - Esboço do `dev-log.md` (este arquivo).
- Observações:
  - Nenhum `data-cy` foi adicionado — ainda estamos no Bloco 1.
  - Dependências ainda não instaladas; `npm install` será
    executado quando os `package.json` dos workspaces existirem
    (Blocos 2 e 3).

---

### 2026-11-01 — Bloco 4a · Testability (sweep de `data-cy`)
- Início: 23:42
- Fim: 00:19 (2026-11-02)
- Duração: 0h 37min
- Atividades:
  - Sweep concluído de 6 arquivos: LoginPage (consolidado em 914a9b8),
    RegisterPage, AuthenticatedLayout, GamesListPage, GameFormPage,
    GameDetailPage, DashboardPage.

### 2026-11-02 — Bloco 4b · Cypress config + .cy.ts suites
- Início: 00:22
- Fim: 00:48
- Duração: 0h 26min
- Atividades:
  - Bootstrap do workspace `e2e/` com Cypress 14 (upgrade de 13 por
    bug de smoke-test no Windows 11 build 26200) e `@cypress/code-coverage`.
  - Custom commands `cy.login`, `cy.resetDatabase` e `cy.apiRequest`.
  - Fixtures `users.json` e `games.json`.
  - 6 suítes `.cy.ts` cobrindo os 30 CTs automatizáveis do Apêndice B.
  - Execução inicial da suíte: 25/32 testes aprovados (ver
    RELATORIO_BLOCO_4B.md para detalhamento das 7 falhas).

### 2026-11-02 — Bloco 4 · Refatoração para isolamento por teste
- Início: 01:21
- Fim: 01:26
- Duração: 0h 05min
- Atividades:
  - Seed mínimo (`apps/api/prisma/seed-minimal.ts`) e scripts
    `reset:test` / `prisma:reset-test` — commit `4fb9d30`.
  - `cy.resetDatabase()` passa a usar o reset mínimo — commit `5b8034c`.
  - 6 novos custom commands de API para criação de dados
    (`cy.registerUser`, `cy.loginApi`, `cy.createGame`,
    `cy.createSession`, `cy.setGameStatus`, `cy.setGameRating`) +
    `cy.login` agora delega a `cy.loginApi` — commit `68813d1`.
  - 6 refactors (um por suíte): `a87d37b`, `3763290`, `c702323`,
    `b6a0204`, `c8b97bc`, `5db2e1f`.
  - Resultado: suíte agora é determinística e cada CT é independente
    dos demais. Pode rodar em qualquer ordem.

### 2026-11-02 — Bloco 4 · Fix de testes (correção das 4 falhas do RELATORIO)
- Início: 01:11
- Fim: 01:13
- Duração: 0h 02min
- Atividades:
  - 4 fixes aplicados em commits isolados sobre as suítes Cypress:
    - F1 `fix(e2e): use localStorage.getItem for token key with dot (CT01, CT04, CT07)` — `0473aac`.
    - F2 `fix(e2e): add passwordConfirmation to secondary user register (CT15, CT29)` — `cf10e47`.
    - F3 `fix(e2e): bypass HTML5 clamp to test Zod rating validation (CT23)` — `7e24968`.
    - F4 `fix(e2e): avoid DOM detachment by materializing cards (CT28)` — `5cfd907`.
  - Execução ficou pendente do terminal nativo do Gabriel (bug
    `ELECTRON_RUN_AS_NODE` impede rodar Cypress a partir do Claude Code).

---

## Consolidado (preencher ao final)

| Bloco           | Descrição                              | Horas |
|-----------------|----------------------------------------|-------|
| 1               | Bootstrap do monorepo                  |  —    |
| 2               | Backend                                |  —    |
| 3               | Frontend (sem `data-cy`)               |  —    |
| **4a**          | **Sweep de `data-cy`**                 |  —    |
| **4b**          | **Configuração e escrita Cypress**     |  —    |
| 5               | Documentação (`docs/`)                 |  —    |
| **T_setup**     | **= 4a + 4b**                          |  —    |
