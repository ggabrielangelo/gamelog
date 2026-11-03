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

---

## B09 — Transição para `COMPLETED` não preenche `finishedAt`

- **Severidade:** média
- **Categoria:** estado (regra de negócio Seção 7.8 do CLAUDE.md)
- **Localização:** `apps/api/src/modules/games/games.service.ts`
  (função `updateGame`, bloco que, após B07, continha a atribuição
  `finishedAt = new Date()`)
- **Diff aplicado:**
  ```diff
    // (bloco já reduzido por B07 — agora removido por completo)
  - // Regra 8: finishedAt é automático em transições para/de COMPLETED.
  - let finishedAt: Date | null | undefined = undefined;
  - if (data.status !== undefined && data.status !== current.status && data.status === 'COMPLETED') {
  -   finishedAt = new Date();
  - }

    // Se a transição tirou de COMPLETED, o rating deve ser removido também
    ...

    const updated = await prisma.game.update({
      where: { id: gameId },
      data: {
        title: data.title ?? undefined,
        ...
        notes: data.notes === undefined ? undefined : data.notes,
  -     finishedAt,
      },
    });
  ```
  (A declaração local `let finishedAt` virou código morto depois de
  cortar a atribuição; removi também o campo `finishedAt` do objeto
  `data` do `prisma.game.update` para não quebrar a tipagem.)
- **Cascata com B07:** B07 já havia eliminado a limpeza de
  `finishedAt` ao sair de `COMPLETED`; B09 remove o preenchimento ao
  entrar em `COMPLETED`. Juntos, deixam `finishedAt` **funcionalmente
  desativado** no fluxo de `PATCH /games/:id`: o service passa a
  nunca tocar nesse campo, de modo que seu valor fica congelado em
  qualquer coisa que o `createGame` tenha gravado (que ainda
  preenche `new Date()` quando o jogo nasce `COMPLETED`).
- **Sintoma esperado:** marcar um jogo como "Concluído" via edição
  **não** registra data de conclusão. O detalhe do jogo exibe
  `finishedAt = null` (ou o campo em branco na UI), apesar de o
  status ter mudado para `COMPLETED`. Combinado com B07, o jogo pode
  ter status `COMPLETED` sem data OU manter uma data antiga ao
  retornar para outro status.
- **CT relacionado (Apêndice B):** CT18 (transição para COMPLETED
  preenche `finishedAt` com `now()`), e indiretamente CT19 (ver
  B07).

---

## B10 — Edição aceita plataforma fora da lista fechada

- **Severidade:** média
- **Categoria:** validação (regra de negócio Seção 7.5 do CLAUDE.md:
  plataforma pertence ao enum `PC | PS5 | Switch | Xbox | Mobile |
  Outros`)
- **Localização:** `apps/api/src/modules/games/games.schema.ts:19`
  (campo `platform` dentro de `updateGameSchema`)
- **Diff aplicado:**
  ```diff
   export const updateGameSchema = z
     .object({
       title: z.string().trim().max(120).optional(),
  -    platform: gamePlatformSchema.optional(),
  +    platform: z.string().optional(),
       genre: z.string().trim().max(60).optional().nullable(),
       ...
     })
     .refine((d) => Object.keys(d).length > 0, { message: 'Nenhum campo informado' });
  ```
  (A `import` de `gamePlatformSchema` permanece — ainda é usada em
  `createGameSchema` e `listGamesQuerySchema`. `createGameSchema`
  foi preservado conforme pedido.)
- **Sintoma esperado:** `PATCH /games/:id` aceita qualquer string em
  `platform`, incluindo valores lixo (`"GameBoy"`, `"xbox"` em caixa
  errada, `"PC Master Race"`, `""`). O valor é persistido como veio,
  violando a lista fechada. A criação (`POST /games`) **permanece**
  rígida — só valores do enum são aceitos — de forma que B10 só se
  manifesta em edições. Em algum momento o `GamesListPage` tentará
  renderizar o rótulo de plataforma de um jogo cujo valor não bate
  com nenhuma chave do mapa de rótulos; o comportamento visível
  depende da UI (string crua ou label vazia).
- **CT relacionado (Apêndice B):** CT17 (edição rejeita plataforma
  inválida).

---

## B11 — `GET /games/:id` vaza jogos entre usuários

- **Severidade:** média
- **Categoria:** permissão / autorização (regra de negócio Seção 7.4
  do CLAUDE.md: um usuário só enxerga seus próprios recursos)
- **Localização:** `apps/api/src/modules/games/games.service.ts`
  (função `getGame`)
- **Diff aplicado:**
  ```diff
  - export async function getGame(userId: string, gameId: string) {
  -   const game = await findOwnedGame(userId, gameId);
  -   const hoursTotal = await totalHours(gameId);
  -   return { ...game, hoursTotal };
  - }
  + export async function getGame(_userId: string, gameId: string) {
  +   const game = await prisma.game.findUnique({ where: { id: gameId } });
  +   if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Jogo não encontrado');
  +   const hoursTotal = await totalHours(gameId);
  +   return { ...game, hoursTotal };
  + }
  ```
  **Nota de localização:** o enunciado pedia "remover o `userId` da
  cláusula `where` e deixar só `where: { id }`". Na implementação da
  `main`, o filtro de propriedade acontecia dentro do helper
  `findOwnedGame(userId, gameId)`, que faz `findUnique({ where:
  { id: gameId } })` seguido de uma checagem `game.userId !== userId
  → 403`. A injeção bypassa esse helper só em `getGame`, fazendo o
  `findUnique` direto por `id`. `updateGame`, `deleteGame`,
  `createSession` e `listSessions` continuam chamando `findOwnedGame`
  — a autorização dessas rotas segue íntegra.
- **Sintoma esperado:** `GET /api/games/:id` passa a devolver **200
  + payload do jogo** mesmo quando o jogo pertence a outro usuário,
  desde que o chamador esteja autenticado (middleware JWT segue
  ativo). O frontend que acessa `/games/:id` com um id de jogo
  alheio renderiza o detalhe completo (título, plataforma, status,
  sessões e horas totais). Edição e exclusão continuam bloqueadas
  com `403` — a brecha é só de leitura.
- **CT relacionado (Apêndice B):** CT12 (acesso a `/games/:id` de
  outro usuário retorna 403/404), equivalente ao CT29 (isolamento
  entre usuários na lista).

---

## B12 — Confirmação de senha não é validada contra a senha

- **Severidade:** média
- **Categoria:** lógica (regra de negócio Seção 7.1 do CLAUDE.md:
  "Confirmação de senha obrigatória e igual à senha")
- **Localização:** `apps/api/src/modules/auth/auth.schema.ts`
  (schema `registerSchema`, bloco `.refine(...)` que comparava
  `password === passwordConfirmation`)
- **Diff aplicado:**
  ```diff
  - export const registerSchema = z
  -   .object({
  -     name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  -     email: z.string().trim().toLowerCase().email('E-mail inválido'),
  -     password: strongPassword,
  -     passwordConfirmation: z.string(),
  -   })
  -   .refine((d) => d.password === d.passwordConfirmation, {
  -     path: ['passwordConfirmation'],
  -     message: 'Confirmação de senha não confere',
  -   });
  + export const registerSchema = z.object({
  +   name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  +   email: z.string().trim().toLowerCase().email('E-mail inválido'),
  +   password: strongPassword,
  +   passwordConfirmation: z.string(),
  + });
  ```
  (O campo `passwordConfirmation` continua obrigatório como `z.string()`,
  apenas a comparação com `password` foi removida.)
- **Sintoma esperado:** `POST /auth/register` com
  `password = "Senha123"` e `passwordConfirmation = "qualquer-outra"`
  (ou até `passwordConfirmation = ""`) **cria o usuário** com
  `201 Created`. O campo de confirmação é cosmético — a API deixa
  de proteger contra erro de digitação da senha. No frontend, a
  tela de cadastro continua pedindo a confirmação, mas ela nunca
  bloqueia a submissão quando divergente (a validação do React
  Hook Form reaproveita o schema Zod via resolver).
- **CT relacionado (Apêndice B):** CT04 (cadastro rejeita confirmação
  de senha divergente).

---

## B13 — Logout limpa `localStorage` mas não reseta estado do AuthContext

- **Severidade:** média
- **Categoria:** estado (regra de negócio Seção 7.3 do CLAUDE.md:
  "Logout limpa JWT do `localStorage` do navegador e redireciona para
  `/login`" — implicitamente também limpa o usuário em memória)
- **Localização:** `apps/web/src/contexts/AuthContext.tsx:54-57`
  (função `logout` dentro do `AuthProvider`)
- **Diff aplicado:**
  ```diff
    const logout = useCallback(() => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
  -   setUser(null);
    }, []);
  ```
- **Sintoma esperado:** ao clicar no botão de logout (
  `header-logout-button`), o token é removido do `localStorage` mas
  o estado React `user` do `AuthProvider` permanece com os dados do
  usuário anterior. Como a rota raiz testa `user` (não o token) para
  decidir se redireciona para `/login`, o usuário aparentemente
  continua logado — o header ainda mostra o nome do usuário e as
  páginas protegidas ainda renderizam, até o primeiro refresh completo
  (quando `useEffect` roda `fetchMe` sem token e deixa `user = null`).
  A inconsistência entre `localStorage` vazio e `AuthContext` povoado
  gera também requisições à API sem Bearer token, que retornam `401`
  e podem disparar toasts de erro aleatórios.
- **CT relacionado (Apêndice B):** CT07 (logout redireciona para
  `/login` e invalida sessão).

---

## B14 — Toast de erro do formulário usa paleta de sucesso

- **Severidade:** média
- **Categoria:** interface (semântica de cor em feedback)
- **Localização:** `apps/web/src/pages/GameFormPage.tsx:175`
  (bloco condicional de renderização de `game-form-error-message`)
- **Diff aplicado:**
  ```diff
          {serverError && (
  -         <div data-cy="game-form-error-message" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
  +         <div data-cy="game-form-error-message" className="rounded-md bg-green-50 p-3 text-sm text-green-700">{serverError}</div>
          )}
  ```
  (A mensagem, o `data-cy` e a lógica de visibilidade estão intactos
  — só o esquema de cores mudou.)
- **Sintoma esperado:** quando o backend recusa um `POST /games` ou
  `PATCH /games/:id` (ex.: título vazio, URL de capa inválida), o
  bloco de erro aparece com fundo verde-claro e texto verde-escuro
  — visualmente idêntico a um toast de sucesso. O usuário pode
  interpretar que a operação deu certo e navegar embora, embora o
  jogo não tenha sido salvo. Toasts de erro **em outras páginas**
  (ex.: `login-error-message`, `register-error-message`) permanecem
  vermelhos — a inconsistência de cor dentro do próprio produto é o
  sinal mais detectável.
- **CT relacionado (Apêndice B):** CT14 e CT15 (criação/edição com
  dados inválidos exibem mensagem de erro).

---

## B15 — Lista de sessões sem ordenação por data

- **Severidade:** média
- **Categoria:** lógica (apresentação consistente de histórico)
- **Localização:** `apps/api/src/modules/games/sessions.service.ts`
  (função `listSessions`)
- **Diff aplicado:**
  ```diff
   export async function listSessions(userId: string, gameId: string) {
     await findOwnedGame(userId, gameId);
     const sessions = await prisma.playSession.findMany({
       where: { gameId },
  -    orderBy: { playedAt: 'desc' },
     });
     return sessions;
   }
  ```
  **Nota de localização:** o enunciado considerou a hipótese de a
  função viver em `games.service.ts` ou em `GameDetailPage.tsx`. A
  implementação da `main` isola a listagem em
  `sessions.service.ts::listSessions` e **não** reordena no
  frontend (`GameDetailPage.tsx` não tem `.sort(...)`), portanto a
  única mudança necessária foi remover o `orderBy` do backend.
- **Sintoma esperado:** o `GET /games/:id/sessions` retorna as
  sessões na ordem natural do SQLite (ordem de inserção, por `id`
  gerado via UUID — ou seja, ordem imprevisível e sem relação com a
  data). A lista `sessions-list` do detalhe do jogo exibe entradas
  "fora de ordem" — uma sessão de ontem pode aparecer depois de uma
  de semana passada. O total de horas no cabeçalho (
  `game-detail-hours-total`) permanece correto, porque é agregado
  por `_sum`, independente de ordenação.
- **CT relacionado (Apêndice B):** CT26 (lista de sessões ordenada
  por data desc).

---

## B16 — Edição de jogo zera `notes` quando o campo é omitido

- **Severidade:** média
- **Categoria:** lógica (preservação de campos opcionais em PATCH
  parcial — regra implícita de API REST idiomática)
- **Localização:** `apps/api/src/modules/games/games.service.ts`
  (função `updateGame`, campo `notes` dentro de `prisma.game.update`)
- **Diff aplicado:**
  ```diff
      const updated = await prisma.game.update({
        where: { id: gameId },
        data: {
          title: data.title ?? undefined,
          platform: data.platform ?? undefined,
          genre: data.genre === undefined ? undefined : data.genre,
          status: data.status ?? undefined,
          rating: ratingUpdate,
          coverUrl: data.coverUrl === undefined ? undefined : data.coverUrl,
  -       notes: data.notes === undefined ? undefined : data.notes,
  +       notes: data.notes ?? null,
        },
      });
  ```
- **Sintoma esperado:** `PATCH /games/:id` com um payload que **não**
  inclui o campo `notes` (ex.: só mudando o status, só mudando o
  rating, só mudando a plataforma) agora apaga as notas existentes
  no banco — porque `undefined ?? null` resolve para `null` e o
  Prisma persiste `null`. O frontend, que envia todos os campos
  juntos quando o usuário salva pelo `GameFormPage`, **não**
  dispara o sintoma; o bug aparece em qualquer caminho que faça
  PATCH parcial (um "Marcar como concluído" direto na lista, por
  exemplo, ou em testes de API). Os campos irmãos (`genre`,
  `coverUrl`) continuam preservando o valor com `=== undefined ?
  undefined : data.notes` — a assimetria entre `notes` e os demais
  campos opcionais é o sinal mais direto para o testador.
- **CT relacionado (Apêndice B):** CT16 (edição parcial preserva
  campos não enviados).
