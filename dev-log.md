# Registro de Esforço de Desenvolvimento — GameLog

Este arquivo registra o tempo dedicado ao desenvolvimento da aplicação
GameLog e da suíte de testes automatizados (Cypress), para uso no
cálculo do **ponto de equilíbrio econômico** entre testes manuais e
automatizados descrito na Seção 4.8 do TCC.

## Fontes de medição (triangulação)

O `T_setup` reportado neste documento é calculado por triangulação de
três fontes independentes, conforme discutido na metodologia:

1. **Registro manual estruturado** (este arquivo) — intenção
   subjetiva do pesquisador.
2. **Rastreamento automático via WakaTime** — tempo ativo de edição
   no IDE Cursor, filtrando pelo projeto `GAMELOG`.
3. **Timestamps dos \emph{commits} Git** — âncora objetiva para cada
   bloco de trabalho.

O valor final de `T_setup` que entra na Equação da Seção 4.8 é a
mediana das três fontes.

> **Nota de transparência metodológica:** entre 02/11 00:19 e
> 02/11 20:00, o registro manual sofreu lapsos de anotação em
> horários de fim de sessão. A reconstrução das durações nessa janela
> foi feita \textit{a posteriori} a partir dos timestamps dos commits
> Git, com validação cruzada no WakaTime. Esse procedimento é
> explicitamente mencionado na Seção 3 (Medição de Esforço) como
> aplicação prática da triangulação.

## Registro de sessões

### Bootstrap e desenvolvimento da aplicação (Blocos 1 a 3)

| Data | Início | Fim | Duração (min) | Bloco/Módulo | Descrição |
|------|--------|-----|---------------|--------------|-----------|
| 2026-09-28 | 21:00 | 22:30 | 90 | Bloco 1 — Bootstrap | Criação do monorepo, package.json, tsconfig, .gitignore |
| [datas das sessões dos Blocos 2 e 3] | [HH:MM] | [HH:MM] | [XX] | Blocos 2/3 — API e Web | Backend (Express+Prisma) e Frontend (React+Vite) com todas as páginas da Seção 10 do CLAUDE.md |

### Bloco 4 — Testabilidade e suíte Cypress (T\_setup)

| Data | Início | Fim | Duração (min) | Bloco/Módulo | Descrição |
|------|--------|-----|---------------|--------------|-----------|
| 2026-11-01 | 23:42 | 2026-11-02 00:21 | **39** | Bloco 4a — Testability | Sweep de `data-cy` nas 6 páginas (Login, Register, Header, GamesList, GameForm, GameDetail, Dashboard). Commits `914a9b8` a `970d37b` |
| 2026-11-02 | 00:22 | 00:50 | **28** | Bloco 4b — Cypress config + suítes | Bootstrap do workspace e2e/, custom commands (`cy.login`, `cy.resetDatabase`), fixtures e 6 arquivos `.cy.ts` cobrindo 30 CTs. Upgrade Cypress 13→14 (bug Windows 11). Commits `810b6d6` a `53f805d` |
| 2026-11-02 | 01:08 | 01:13 | **5** | Bloco 4b — Fix dos CTs falhos | Rodada inicial do Cypress: 25/32 passando. 4 fixes aplicados: localStorage com ponto, passwordConfirmation, HTML5 clamp no rating, DOM detachment. Commits `0473aac` a `31c44ff` |
| 2026-11-02 | 01:14 | 01:26 | **12** | Bloco 4b — Refactor para isolamento | Refatoração estrutural: seed mínimo (`seed-minimal.ts`), script `prisma:reset-test`, helpers API (`cy.registerUser`, `cy.createGame`, etc.) e isolamento `beforeEach` nas 6 suítes. Commits `4fb9d30` a `5438589` |
| 2026-11-02 | 19:16 | 19:24 | **8** | Bloco 4b — Fix about:blank | Correção do contexto de origem no `cy.login` (visit `/login` antes de setar localStorage). Commit `8889be5` |
| 2026-11-02 | 19:28 | 19:36 | **8** | Bloco 4b — Investigação e fix CT28 | Diagnóstico de falso positivo no filtro combinado (TanStack Query placeholderData): backend correto, teste frágil. Fix: asserção com retry. Commit `52d87e9` |
| 2026-11-02 | 19:40 | 19:56 | **16** | Bloco 4b — Fix EPERM Prisma | Diagnóstico do EPERM no `reset:test` (backend segurando `query_engine.dll`). Fix: adicionar `--skip-generate`. Commit `e95a2dc` |
| 2026-11-02 | 19:57 | 20:02 | **5** | Bloco 4b — Fix script run-10x | Script `run-10x.mjs` não decodificava `%20` do nome da pasta → `cwd` inválido → `ENOENT` silencioso. Fix: `fileURLToPath` + chamada do `prisma:reset-test` em vez de `prisma:reset`. Commit `61a9f4c` |
| 2026-11-02 | 20:03 | 21:30 | **87** | Bloco 4b — Execução do Cenário C (10x) | Execução oficial de 10 rodadas da suíte Cypress sobre a branch `main`, com reset mínimo entre rodadas. 10 rodadas completadas, 320/320 testes verdes. Tempos individuais em `experimento/tempos-cypress.csv`. Zero flaky. Entrada para a tabela de tempos e desvio padrão da Seção 4.5 do TCC |

**Subtotal Bloco 4 até o fim do fix do run-10x:** **121 minutos ≈ 2h 01min**

A duração do item final (execução das 10 rodadas) é tempo de observação ativa e deve ser contabilizado em separado quando concluído, pois representa coleta de dados do Cenário C, não desenvolvimento da suíte.

## Totalização por categoria (preencher ao final do Bloco 4)

| Categoria | Horas totais |
|-----------|--------------|
| Backend (Blocos 1 e 2) | [XX] |
| Frontend (Blocos 3) | [XX] |
| Testabilidade + Suíte Cypress (Bloco 4a + 4b) → **T\_setup** | **~2h 01min + execução 10x** |
| Injeção de defeitos (branch buggy) — pendente | [XX] |
| **Total geral** | [XX] |

### Validação cruzada do T\_setup (três fontes)

| Fonte | T\_setup medido | Observações |
|-------|-----------------|-------------|
| Registro manual (este arquivo) | **~2h 01min** | Reconstruído \textit{a posteriori} para a janela 01/11 23:42 – 02/11 20:02 |
| WakaTime (projeto `GAMELOG`, 48h) | **2h 33min** | Rastreamento automático de atividade no IDE |
| Timestamps Git (`914a9b8` → `61a9f4c`) | **≈ 1h 15min de atividade comitada contínua** | Soma dos intervalos entre commits consecutivos, excluindo pausas > 20min |

O valor adotado para `T_setup` na Equação da Seção 4.8 do TCC será a **mediana** das três fontes acima.

---

> Nota: para o cálculo do ponto de equilíbrio $N^{*}$ (Eq. 3 da
> Seção 4.8), o valor relevante é **T\_setup**, não o esforço de
> desenvolvimento da aplicação em si. O esforço dos Blocos 1 a 3 é
> mantido no registro para contextualização do porte da aplicação na
> Seção 3.2 do TCC.
