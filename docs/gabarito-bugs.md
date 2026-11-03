# Gabarito de Defeitos Injetados — branch `buggy`

Este arquivo documenta cada defeito deliberadamente injetado na branch
`buggy` do GameLog, usado como \emph{oracle} para o experimento
comparativo entre as três abordagens de teste (Cenários A, B e C) do
TCC. A `main` permanece como referência limpa (tag
`v1.0-experimento`).

Para cada defeito registra-se: ID, severidade, categoria, localização
(arquivo:linha), diff aplicado e sintoma esperado observável pelo
testador.

**Perfil-alvo de severidade:** 10 baixa / 10 média / 4 alta (24 ao
todo, B01–B24).

---

## B01 — Senha mínima relaxada de 8 para 1 caractere

- **Severidade:** baixa
- **Categoria:** validação (regra de negócio Seção 7.1 do CLAUDE.md)
- **Localização:** `apps/api/src/modules/auth/auth.schema.ts:6`
- **Diff aplicado:**
  ```diff
  - .min(8, 'Senha deve ter no mínimo 8 caracteres')
  + .min(1, 'Senha deve ter no mínimo 8 caracteres')
  ```
  (A mensagem de erro foi preservada para dificultar a detecção por
  inspeção de código; o comportamento diverge do contrato.)
- **Sintoma esperado:** cadastro aceita senha de qualquer comprimento
  ≥ 1 (ex.: `A1`), inclusive violando o requisito de 8 caracteres do
  Apêndice A. A regra de letra+número ainda é aplicada, mas a senha
  pode ter apenas 2 caracteres.
- **CT relacionado (Apêndice B):** CT03 (senha curta rejeitada no
  cadastro).

---

## B02 — Comprimento mínimo do título do jogo removido

- **Severidade:** baixa
- **Categoria:** validação (regra de negócio Seção 7.5 do CLAUDE.md)
- **Localização:** `apps/api/src/modules/games/games.schema.ts:8` e `:19`
- **Diff aplicado:**
  ```diff
  // createGameSchema (linha ~8)
    title: z
      .string()
      .trim()
  -   .min(1, 'Título é obrigatório')
      .max(120, 'Título deve ter no máximo 120 caracteres'),

  // updateGameSchema (linha ~19)
  -   title: z.string().trim().min(1).max(120).optional(),
  +   title: z.string().trim().max(120).optional(),
  ```
- **Sintoma esperado:** criação e edição de jogo aceitam título vazio
  (`""`) ou composto só por espaços (que o `.trim()` reduz a `""`),
  gerando cards sem título legível na lista. A regra do contrato
  (título obrigatório, 1 a 120 caracteres) é violada.
- **CT relacionado (Apêndice B):** CT14 (criação rejeita título
  vazio) e análogo de edição.

---

## B03 — Intervalo de validação da avaliação (rating) removido

- **Severidade:** baixa
- **Categoria:** validação (regra de negócio Seção 7.9 do CLAUDE.md)
- **Localização:** `apps/api/src/modules/games/games.schema.ts:23`
  (campo `rating` dentro de `updateGameSchema`)
- **Diff aplicado:**
  ```diff
  -   rating: z.number().int().min(1, 'Avaliação mínima: 1').max(10, 'Avaliação máxima: 10').optional().nullable(),
  +   rating: z.number().int().optional().nullable(),
  ```
- **Sintoma esperado:** o endpoint `PATCH /games/:id` aceita qualquer
  inteiro para `rating` (ex.: `0`, `-5`, `11`, `999`), persistindo o
  valor fora do intervalo contratado [1, 10]. A regra adicional de
  que avaliação só pode existir para jogos `COMPLETED` **permanece**
  intacta (está no service, não no schema), de modo que B03 é um bug
  isolado de validação de intervalo.
- **CT relacionado (Apêndice B):** CT23 (rating fora do intervalo
  rejeitado).

---

## B04 — Validação de horas de sessão aceita zero

- **Severidade:** baixa
- **Categoria:** validação (regra de negócio Seção 7.10 do CLAUDE.md)
- **Localização:** `apps/api/src/modules/games/games.schema.ts:36-40`
  (schema `createSessionSchema`, campo `hours`)
- **Diff aplicado:**
  ```diff
    hours: z
      .number({ invalid_type_error: 'Horas deve ser numérico' })
  -   .positive('Horas deve ser maior que 0')
  +   .gte(0, 'Horas deve ser maior ou igual a 0')
      .max(24, 'Horas deve ser no máximo 24'),
  ```
  (`.positive(...)` em Zod é equivalente a `.gt(0, ...)`.)
- **Sintoma esperado:** `POST /games/:id/sessions` com `hours: 0`
  passa a ser aceito, criando uma sessão de duração nula. Horas
  negativas continuam rejeitadas (`.gte(0)` barra `< 0`) e horas
  > 24 também (via `.max(24)`). O impacto é que o total de horas do
  jogo pode acumular registros fantasmas de 0 h, inflando a contagem
  de sessões no histórico sem alterar o total.
- **CT relacionado (Apêndice B):** CT25 (sessão rejeita `hours = 0`).

---

## B05 — Dashboard perde precisão decimal no total de horas

- **Severidade:** baixa
- **Categoria:** interface (fidelidade de apresentação)
- **Localização:** `apps/web/src/pages/DashboardPage.tsx:63`
  (stat `dashboard-stat-total-hours`)
- **Diff aplicado:**
  ```diff
          <div data-cy="dashboard-stat-total-hours">
  -         <StatCard label="Horas" value={stats.totalHours.toFixed(1)} />
  +         <StatCard label="Horas" value={stats.totalHours.toFixed(0)} />
          </div>
  ```
- **Sintoma esperado:** o card "Horas" do Dashboard mostra total
  truncado como inteiro (ex.: 4.5h vira "5", 2.4h vira "2"), em vez
  da 1 casa decimal esperada. A média de avaliação ao lado continua
  com 1 casa decimal (`stats.avgRating.toFixed(1)` preservado), de
  modo que B05 é um defeito isolado de formatação do total de horas.
- **CT relacionado (Apêndice B):** CT32 (soma total de horas na
  home com 1 decimal).

---

## B06 — Login case-sensitive no e-mail

- **Severidade:** baixa
- **Categoria:** lógica (regra de negócio Seção 7.1 do CLAUDE.md:
  e-mail é único case-insensitive, logo login deve ser também)
- **Localização:** `apps/api/src/modules/auth/auth.schema.ts`
  (schema `loginSchema`, campo `email`)
- **Diff aplicado:**
  ```diff
   export const loginSchema = z.object({
  -  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  +  email: z.string().trim().email('E-mail inválido'),
     password: z.string().min(1, 'Senha é obrigatória'),
   });
  ```
  **Nota de localização:** o enunciado desta injeção pedia a mudança
  em `apps/api/src/modules/auth/auth.service.ts` (remover
  `.toLowerCase()` antes de `prisma.user.findUnique`), mas na
  implementação da `main` a normalização é feita no schema Zod
  (`loginSchema` chama `.toLowerCase()` no transform), de modo que
  o service recebe o e-mail já em caixa baixa e nunca precisou
  rechamar `.toLowerCase()`. A injeção foi aplicada no local
  funcionalmente equivalente — o schema de login — preservando o
  schema de cadastro (`registerSchema` mantém `.toLowerCase()`).
- **Sintoma esperado:** usuário cadastrado com e-mail
  `teste@gamelog.com` consegue logar escrevendo exatamente dessa
  forma, mas falha com `401 Credenciais inválidas` ao tentar
  `Teste@Gamelog.com` ou `TESTE@GAMELOG.COM`. Como o `register`
  continua normalizando para caixa baixa, a assimetria é observável
  em qualquer teste que valide "cadastrou e logou com case
  diferente".
- **CT relacionado (Apêndice B):** CT05 (login válido com variações
  de case no e-mail).

---

## B07 — `finishedAt` não é limpo ao sair do status COMPLETED

- **Severidade:** baixa
- **Categoria:** estado (regra de negócio Seção 7.8 do CLAUDE.md)
- **Localização:** `apps/api/src/modules/games/games.service.ts:80-83`
  (função `updateGame`, bloco de transição de `finishedAt`)
- **Diff aplicado:**
  ```diff
    // Regra 8: finishedAt é automático em transições para/de COMPLETED.
    let finishedAt: Date | null | undefined = undefined;
  - if (data.status !== undefined && data.status !== current.status) {
  -   finishedAt = data.status === 'COMPLETED' ? new Date() : null;
  - }
  + if (data.status !== undefined && data.status !== current.status && data.status === 'COMPLETED') {
  +   finishedAt = new Date();
  + }
  ```
  (Preserva o preenchimento automático de `finishedAt = new Date()`
  na transição para `COMPLETED`; remove a limpeza para `null`
  quando o jogo sai de `COMPLETED`.)
- **Sintoma esperado:** ao mover um jogo de `COMPLETED` para
  `PLAYING`, `BACKLOG` ou `ABANDONED`, o campo `finishedAt` **mantém
  a data antiga** no banco, violando a Seção 7.8 que determina
  "`finishedAt` é limpo (`null`) ao mudar para qualquer outro
  status". A limpeza paralela de `rating` (feita logo abaixo neste
  mesmo service) **permanece** intacta, de forma que B07 é um bug
  isolado — o jogo pode exibir "concluído em dd/mm/aaaa" mesmo
  estando com status "Jogando".
- **CT relacionado (Apêndice B):** CT19 (transição COMPLETED → outro
  status limpa `finishedAt`).

---

## B08 — Badge de status exibe enum cru em vez do rótulo em PT

- **Severidade:** baixa
- **Categoria:** interface (regra de i18n fixa Seção 4 do CLAUDE.md:
  tabela de rótulos PT para `GameStatus`)
- **Localização:** `apps/web/src/components/StatusBadge.tsx:20`
  (texto renderizado dentro do `<span>` do badge)
- **Diff aplicado:**
  ```diff
   export function StatusBadge({ status }: { status: GameStatus }): JSX.Element {
     return (
       <span
         className={clsx(
           'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
           STATUS_STYLES[status],
         )}
       >
  -      {statusLabel(status)}
  +      {status}
       </span>
     );
   }
  ```
  (A import de `statusLabel` é deixada intacta, embora não seja mais
  usada — remover a import tornaria o bug detectável por linter
  antes mesmo de o teste rodar.)
- **Sintoma esperado:** todos os pontos da UI que usam `<StatusBadge />`
  (cards da lista de jogos — `game-card-status`, detalhe do jogo —
  `game-detail-status-badge`, bloco "Melhores avaliados" do
  Dashboard) passam a mostrar os identificadores de enum em inglês
  (`BACKLOG`, `PLAYING`, `COMPLETED`, `ABANDONED`) em vez dos
  rótulos em PT (`A jogar`, `Jogando`, `Concluído`, `Abandonado`).
  O estilo visual do badge (cores) permanece correto, porque
  `STATUS_STYLES[status]` continua funcional. As legendas dos cards
  do Dashboard (`statusLabel('BACKLOG')` etc. em `DashboardPage.tsx`)
  **não** são afetadas — essas chamam `statusLabel` diretamente.
- **CTs relacionados (Apêndice B):** CT24 (card da lista mostra
  status em PT), CT20 (detalhe mostra badge de status em PT) e o
  CT28 (filtro combinado + rótulo PT no card remanescente).
