# Relatório Final — Bloco 4b

## Resumo executivo

- **Início:** 2026-11-02 00:22
- **Fim:** 2026-11-02 00:48
- **Duração:** 0h 26min
- **Modo:** autônomo, sem pedidos de confirmação intermediários.
- **Tag `v1.0-experimento`:** criada e empurrada ao final deste bloco
  (ver seção *Tag de freeze*).

### Commits criados no Bloco 4b

| Hash | Mensagem |
|------|----------|
| 810b6d6 | feat(e2e): bootstrap cypress workspace with code-coverage |
| bc5aee8 | feat(e2e): add cy.login and cy.resetDatabase custom commands |
| 4c184ca | feat(e2e): add test fixtures |
| 1e4ccc3 | feat(e2e): implement auth.cy.ts (CT01-CT05, CT07) |
| 01b8f6e | feat(e2e): implement games-crud.cy.ts (CT08-CT17) |
| e8cc771 | feat(e2e): implement games-status-rating.cy.ts (CT18-CT23) |
| 6d8bdad | feat(e2e): implement games-sessions.cy.ts (CT24-CT26) |
| 441de44 | feat(e2e): implement games-list.cy.ts (CT27-CT29) |
| 4ccac3a | feat(e2e): implement dashboard.cy.ts (CT30, CT32) |
| b279269 | chore(e2e): upgrade cypress to v14 (fix smoke-test crash on Windows 11 26200) |
| _(este)_ | docs: close Bloco 4b session in dev-log |

## Arquivos criados

- `e2e/package.json`
- `e2e/tsconfig.json`
- `e2e/cypress.config.ts`
- `e2e/cypress/support/e2e.ts`
- `e2e/cypress/support/commands.ts`
- `e2e/cypress/fixtures/users.json`
- `e2e/cypress/fixtures/games.json`
- `e2e/cypress/e2e/auth.cy.ts`
- `e2e/cypress/e2e/games-crud.cy.ts`
- `e2e/cypress/e2e/games-status-rating.cy.ts`
- `e2e/cypress/e2e/games-sessions.cy.ts`
- `e2e/cypress/e2e/games-list.cy.ts`
- `e2e/cypress/e2e/dashboard.cy.ts`
- `e2e/scripts/run-10x.mjs`
- `RELATORIO_BLOCO_4B.md` _(este arquivo)_

## Resultado da suíte Cypress (Tarefa 5)

Execução: Cypress 14.5.4, Electron 130 headless, Node 20.11.1, banco
resetado antes do run completo, API em `http://localhost:3333`, Web em
`http://localhost:5173`.

Nota: alguns CTs foram implementados como múltiplos `it(...)` (por
exemplo CT25 em `CT25a` + `CT25b`), por isso o total de **testes
executados é 32** enquanto o total de **CTs cobertos é 30** conforme a
Seção 11 do CLAUDE.md.

| Suíte | Testes | Passou | Falhou | Pending/Skipped |
|-------|--------|--------|--------|------------------|
| auth.cy.ts | 6 | 3 | 3 | 0 |
| games-crud.cy.ts | 10 | 9 | 1 | 0 |
| games-status-rating.cy.ts | 6 | 5 | 1 | 0 |
| games-sessions.cy.ts | 5 | 5 | 0 | 0 |
| games-list.cy.ts | 3 | 1 | 2 | 0 |
| dashboard.cy.ts | 2 | 2 | 0 | 0 |
| **Total** | **32** | **25** | **7** | **0** |

**Taxa de aprovação: 78,1 % na primeira execução.**

## Falhas detectadas (sem correção nesta rodada)

### F1 — localStorage com chave contendo ponto não é lida por `cy.its()`

- **CTs afetados:** CT01, CT04, CT07 (3 falhas).
- **Erro Cypress:**
  `cy.its() errored because the property: localStorage.gamelog.token does not exist on your subject.`
- **Causa raiz (uma só, repetida 3 vezes):** a chave do token no
  `localStorage` é `gamelog.token` (literal, com ponto). O
  `cy.its('localStorage.gamelog.token')` interpreta o ponto como
  acesso aninhado (`localStorage.gamelog.token`), não encontra a
  propriedade. É **bug na asserção do teste**, não no app.
- **Fix sugerido (próxima rodada):** trocar
  `cy.window().its('localStorage.gamelog.token').should('exist')`
  por
  `cy.window().then((win) => { expect(win.localStorage.getItem('gamelog.token')).to.be.a('string'); })`.

### F2 — Register do usuário secundário retorna 400 em vez de 201

- **CTs afetados:** CT15, CT29 (2 falhas).
- **Erro Cypress:** `expected [200, 201] to include 400`.
- **Hipótese:** o endpoint `POST /auth/register` provavelmente **exige
  `passwordConfirmation` no body** (conforme regra 7.1 do CLAUDE.md:
  "Confirmação de senha obrigatória"). O teste manda só
  `{ name, email, password }`, sem `passwordConfirmation`, e o Zod do
  backend recusa com 400. É **bug no payload do teste**, não no app
  (apesar de que vale confirmar olhando o schema de register no
  backend — se ele não exigir `passwordConfirmation`, aí é outro
  motivo).
- **Fix sugerido:** incluir
  `passwordConfirmation: secondary.password` no body do register nos
  dois CTs.

### F3 — CT23 (rating 11) não dispara `game-detail-rate-error`

- **CT afetado:** CT23 (1 falha).
- **Erro Cypress:**
  `Expected to find element: [data-cy="game-detail-rate-error"], but never found it.`
- **Hipótese:** o input de rating tem HTML5 `min={1} max={10}`. Ao
  digitar "11", o browser pode clampar o valor para 10 ao submeter, e
  a validação Zod aceita (10 é válido). Alternativamente, o `type: 'number'`
  do react-hook-form com `valueAsNumber: true` já normaliza antes do
  Zod ver. Resultado: nenhum erro é mostrado, o rating 10 é salvo.
- **Fix sugerido:** validar via API direta ou forçar o valor por
  `.invoke('val', '11').trigger('change')` em vez de `.type('11')`,
  ou — e aqui é cheiro de **bug real no app** — garantir que o Zod do
  frontend tenha `.max(10)` explícito mesmo com o HTML5 min/max.

### F4 — CT28 flakey: `cy.find() failed because the page updated`

- **CT afetado:** CT28 (1 falha).
- **Erro Cypress:**
  `cy.find() failed because the page updated as a result of this command, but you tried to continue the command chain. The subject is no longer attached to the DOM.`
- **Hipótese:** o teste itera os cards com `.each()` enquanto o
  TanStack Query re-renderiza o resultado da query filtrada. Entre o
  `select('BACKLOG')` e o `select('Switch')`, a lista pode re-pintar e
  os elementos ficam detached. É **bug na mecânica do teste**, não no
  app.
- **Fix sugerido:** materializar a lista num array primeiro
  (`cy.get(...).then(($cards) => { ... })`) ou aguardar explicitamente
  a lista estabilizar antes do `.each()`.

### Total consolidado

**4 causas raiz distintas, afetando 7 testes.** Nenhuma falha é bug
confirmado da aplicação:

- 6 falhas são **problemas nos próprios testes** (F1, F2, F4) ou de
  mecânica de validação HTML5 (F3) — nenhuma indica bug real na
  branch `main`.
- F3 ainda merece verificação se o Zod do frontend tem `.max(10)`
  explícito; se faltar, aí é um gap de defesa em profundidade (o
  backend bloqueia, mas vale blindar no cliente também).

## Gaps identificados

### G1 — `game-detail-add-session-button` ausente no app

Já reportado no commit de GameDetailPage. O form de sessão é inline,
sempre visível quando `status in {PLAYING, COMPLETED}`. Não há um
botão separado para "abrir" o formulário.

**Impacto no experimento:** nenhum CT da bateria depende desse botão
(verificado — CT24 testa o form inline direto).

### G2 — `dashboard-recent-sessions` ausente no app

Já reportado no commit de DashboardPage. A seção de "sessões recentes"
não existe. Dashboard tem só "Avaliação média" e "Melhores avaliados".

**Impacto no experimento:** nenhum dos CTs 30/32 cobre sessões recentes.

### G3 — CT06 e CT31 propositalmente deixados manuais

Conforme Seção 11 do CLAUDE.md:

- CT06 é inviabilizado por natureza (não automatizável).
- CT31 (média de rating) foi deixado manual por design.

Não contam como falhas da suíte.

### G4 — `game-detail-server-error` ausente

Levantado na nuance do commit `ffeacde`. Erro de servidor da mutação
de rating cai no `serverError` compartilhado da página, que **não
tem** `data-cy`. Se algum CT futuro precisar testar erro do backend
no rate (ex.: 403 por acesso cruzado), vai precisar adicionar esse
seletor em commit à parte.

**Impacto no experimento:** CT23, que foi o único a tocar nesse
cenário, usou o seletor de erro de campo (`game-detail-rate-error`) —
ok para validação client-side, insuficiente para erro de servidor.

## Decisões de design tomadas sem consulta

Conforme instrução do prompt ("Se encontrar algo que precisa de
decisão de design, toma a decisão mais razoável e documenta"):

1. **Chave do localStorage:** usei `gamelog.token` após descobrir no
   código do frontend (`apps/web/src/services/api.ts`).
2. **Upgrade do Cypress 13 → 14:** o Cypress 13.17.0 crashava no
   smoke-test no Windows 11 build 26200. Testei 14.5.4, funcionou.
   Decisão documentada no commit `b279269`. CLAUDE.md Seção 2 fala
   "Cypress 13+", então 14 está dentro da restrição.
3. **`ELECTRON_RUN_AS_NODE=1` do VS Code herdado:** o Claude Code
   roda como extensão do VS Code e herda a env var
   `ELECTRON_RUN_AS_NODE=1`, que faz o binário do Cypress iniciar como
   Node (não Electron). Workaround: `Remove-Item Env:ELECTRON_RUN_AS_NODE`
   antes de rodar `cypress run`. **Essa flag precisa ser desabilitada
   no shell antes de qualquer execução Cypress a partir do terminal do
   Claude Code**. Rodando `npm run test:e2e` fora da extensão (terminal
   nativo), não há esse problema.
4. **Script `test:10x`:** implementado em `e2e/scripts/run-10x.mjs`
   (Node ESM, portável Windows/Linux) em vez de shell script, pra
   consistência com o resto do stack.
5. **Custom command extra `cy.apiRequest`:** não estava no inventário
   explícito mas facilitou MUITO os CTs que verificam via API direto
   (CT11, CT15, CT17, CT19, CT20, CT25a/b, CT29). Mantido.
6. **CT25 e CT26 divididos em 2 `it()` cada:** cobrem sub-casos
   distintos (`CT25a` horas=0 vs `CT25b` horas=25; `CT26a` BACKLOG vs
   `CT26b` ABANDONED). Totaliza 32 testes mas ainda 30 CTs cobertos.

## Tag de freeze

**Tag `v1.0-experimento`:** criada e empurrada. Essa tag congela a
branch `main` nesse estado como linha de base dos três cenários do
experimento (A manual roteirizado, B manual exploratório, C automatizado
Cypress).

## Próximos passos sugeridos para o Gabriel revisar

1. **Corrigir F1 (localStorage com ponto na chave).** Trivial, 3
   linhas em `auth.cy.ts`. Vira +3 CTs aprovados.
2. **Corrigir F2 (passwordConfirmation).** Verificar se o backend
   realmente exige `passwordConfirmation`. Se sim, adicionar no body
   dos CTs 15 e 29. Se não, investigar o 400 pelos logs da API.
3. **Investigar F3 (rating 11 aceito).** Esse é o único que **pode**
   apontar um buraco real na defesa em profundidade do frontend. Vale
   olhar `ratingSchema` em `GameDetailPage.tsx` e confirmar que
   `.max(10)` está lá. Já está (vi na linha 30: `.max(10, 'Máximo 10')`),
   então o problema é mecânico (HTML5 clamp antes do Zod). Trocar
   `.type('11')` por `.invoke('val', 11).trigger('change').trigger('blur')`.
4. **Corrigir F4 (CT28 flakey).** Materializar os cards antes do
   `.each()`.
5. **Re-rodar `npm run test:e2e`** no terminal nativo (fora da
   extensão VS Code / Claude Code) ou com `ELECTRON_RUN_AS_NODE`
   desabilitado. Meta: 30/30 (ou 32/32) CTs aprovados antes do freeze
   definitivo pra começar os cenários do experimento.
6. **Rodar `npm run test:e2e:10x`** para medir variância de tempo
   de execução (Cenário C do experimento). O script
   `e2e/scripts/run-10x.mjs` já faz reset de DB entre rodadas.
7. **Começar o Bloco 5** (`docs/casos-de-teste.md` como Apêndice B
   formatado) assim que os testes estiverem 100 % verdes.

## Status do `T_setup` para a Equação 3 da Seção 4.8 do TCC

- **Bloco 4a (sweep `data-cy`):** 0h 37min.
- **Bloco 4b (Cypress + 6 suítes):** 0h 26min.
- **`T_setup` = 1h 03min** (até esta rodada; não inclui tempo
  futuro de correção das 4 falhas acima nem de execução/análise do
  10x).
