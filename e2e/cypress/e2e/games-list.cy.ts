/// <reference types="cypress" />

describe('Lista e filtros (CT27-CT29)', () => {
  let primary: { email: string; password: string };
  let secondary: { name: string; email: string; password: string };

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
      secondary = u.secondary;
    });
  });

  beforeEach(() => {
    cy.resetDatabase();
  });

  it('CT27 — lista backlog e exibe os cards do seed', () => {
    cy.login(primary.email, primary.password);
    cy.visit('/games');
    cy.get('[data-cy="games-list"]').should('be.visible');
    cy.get('[data-cy="game-card"]').its('length').should('be.gte', 1);
    cy.get('[data-cy="game-card-title"]').first().should('not.be.empty');
  });

  it('CT28 — filtra por combinação status + plataforma', () => {
    cy.login(primary.email, primary.password);
    cy.visit('/games');

    cy.get('[data-cy="games-filter-status"]').select('BACKLOG');
    cy.get('[data-cy="games-list"]').should('be.visible');
    cy.get('[data-cy="games-filter-platform"]').select('Switch');
    cy.get('[data-cy="games-list"]').should('be.visible');

    cy.get('[data-cy="game-card"]', { timeout: 10000 }).then(($cards) => {
      expect($cards.length, 'pelo menos um card após filtro combinado').to.be.gte(1);
      const rows = Array.from($cards).map((card) => ({
        platform: Cypress.$(card).find('[data-cy="game-card-platform"]').text().trim(),
        status: Cypress.$(card).find('[data-cy="game-card-status"]').text().trim(),
      }));
      rows.forEach((row) => {
        expect(row.platform, 'plataforma do card').to.contain('Switch');
        expect(row.status, 'status do card').to.contain('A jogar');
      });
    });
  });

  it('CT29 — isolamento entre usuários (jogos de outro user não aparecem)', () => {
    cy.apiRequest('POST', '/auth/register', {
      body: {
        name: secondary.name,
        email: secondary.email,
        password: secondary.password,
        passwordConfirmation: secondary.password,
      },
    }).then((regRes) => {
      expect([200, 201]).to.include(regRes.status);
      const tokenB = (regRes.body?.token ?? regRes.body?.data?.token) as string;

      const uniqueTitle = `JOGO-DO-USUARIO-B-${Date.now()}`;
      cy.apiRequest('POST', '/games', {
        token: tokenB,
        body: { title: uniqueTitle, platform: 'PC' },
      }).then((createRes) => {
        expect([200, 201]).to.include(createRes.status);

        cy.login(primary.email, primary.password);
        cy.visit('/games');
        cy.get('[data-cy="games-search-input"]').type(uniqueTitle);
        cy.get('[data-cy="games-list-empty"]', { timeout: 10000 }).should('be.visible');
      });
    });
  });
});
