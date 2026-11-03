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
