/// <reference types="cypress" />

describe('Games status & rating (CT18-CT23)', () => {
  let primary: { email: string; password: string };
  let token: string;

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
    });
  });

  beforeEach(() => {
    cy.resetDatabase();
    cy.login(primary.email, primary.password).then((t) => {
      token = t;
    });
  });

  it('CT18 — altera status entre quaisquer valores via edição', () => {
    cy.createGame(token, { title: 'CT18', platform: 'PC', status: 'BACKLOG' }).then((game) => {
      cy.visit(`/games/${game.id}/edit`);
      cy.get('[data-cy="game-form-status-select"]').select('ABANDONED');
      cy.get('[data-cy="game-form-submit-button"]').click();
      cy.get('[data-cy="game-detail-status-badge"]', { timeout: 10000 }).should(
        'contain',
        'Abandonado',
      );
    });
  });

  it('CT19 — rejeita status fora da lista fechada via API', () => {
    cy.createGame(token, { title: 'CT19', platform: 'PC' }).then((game) => {
      cy.apiRequest('PATCH', `/games/${game.id}`, {
        token,
        body: { status: 'FINISHED_FOREVER' },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  it('CT20 — passar para COMPLETED preenche finishedAt', () => {
    cy.createGame(token, { title: 'CT20', platform: 'PC', status: 'PLAYING' }).then((game) => {
      cy.setGameStatus(token, game.id, 'COMPLETED').then((updated) => {
        expect(updated.finishedAt).to.not.be.null;
        expect(new Date(updated.finishedAt!).toString()).to.not.eq('Invalid Date');
      });
    });
  });

  it('CT21 — avalia jogo COMPLETED com nota 1-10 via UI', () => {
    cy.createGame(token, { title: 'CT21', platform: 'PC', status: 'COMPLETED' }).then((game) => {
      cy.visit(`/games/${game.id}`);
      cy.get('[data-cy="game-detail-rate-button"]').click();
      cy.get('[data-cy="game-detail-rate-input"]').clear().type('8');
      cy.get('[data-cy="game-detail-rate-submit"]').click();
      cy.get('[data-cy="game-detail-rating"]', { timeout: 10000 }).should('contain', '8');
    });
  });

  it('CT22 — botão de avaliar NÃO existe quando status != COMPLETED', () => {
    cy.createGame(token, { title: 'CT22', platform: 'PC', status: 'BACKLOG' }).then((game) => {
      cy.visit(`/games/${game.id}`);
      cy.get('[data-cy="game-detail"]').should('be.visible');
      cy.get('[data-cy="game-detail-rate-button"]').should('not.exist');
    });
  });

  it('CT23 — rejeita nota fora do intervalo 1-10', () => {
    cy.createGame(token, { title: 'CT23', platform: 'PC', status: 'COMPLETED' }).then((game) => {
      cy.visit(`/games/${game.id}`);
      cy.get('[data-cy="game-detail-rate-button"]').click();
      cy.get('[data-cy="game-detail-rate-input"]')
        .invoke('removeAttr', 'max')
        .clear()
        .type('11');
      cy.get('[data-cy="game-detail-rate-submit"]').click();
      cy.get('[data-cy="game-detail-rate-error"]').should('be.visible');

      cy.apiRequest('GET', `/games/${game.id}`, { token }).then((res) => {
        const g = res.body?.game ?? res.body;
        expect(g.rating).to.be.null;
      });
    });
  });
});
