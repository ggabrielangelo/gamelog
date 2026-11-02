/// <reference types="cypress" />

describe('Games status & rating (CT18-CT23)', () => {
  let primary: { email: string; password: string };

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
    });
  });

  beforeEach(() => {
    cy.resetDatabase();
    cy.login(primary.email, primary.password);
  });

  function createGame(token: string, body: Record<string, unknown>) {
    return cy
      .apiRequest('POST', '/games', { token, body })
      .then((res) => {
        expect([200, 201]).to.include(res.status);
        const id = (res.body?.game?.id ?? res.body?.id) as string;
        return cy.wrap(id);
      });
  }

  it('CT18 — altera status entre quaisquer valores via edição', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT18', platform: 'PC', status: 'BACKLOG' }).then((id) => {
        cy.visit(`/games/${id}/edit`);
        cy.get('[data-cy="game-form-status-select"]').select('ABANDONED');
        cy.get('[data-cy="game-form-submit-button"]').click();
        cy.get('[data-cy="game-detail-status-badge"]', { timeout: 10000 }).should(
          'contain',
          'Abandonado',
        );
      });
    });
  });

  it('CT19 — rejeita status fora da lista fechada via API', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT19', platform: 'PC' }).then((id) => {
        cy.apiRequest('PATCH', `/games/${id}`, {
          token,
          body: { status: 'FINISHED_FOREVER' },
        }).then((res) => {
          expect(res.status).to.eq(400);
        });
      });
    });
  });

  it('CT20 — passar para COMPLETED preenche finishedAt', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT20', platform: 'PC', status: 'PLAYING' }).then((id) => {
        cy.apiRequest('PATCH', `/games/${id}`, {
          token,
          body: { status: 'COMPLETED' },
        }).then((res) => {
          expect(res.status).to.eq(200);
          const game = res.body?.game ?? res.body;
          expect(game.finishedAt).to.not.be.null;
          expect(new Date(game.finishedAt).toString()).to.not.eq('Invalid Date');
        });
      });
    });
  });

  it('CT21 — avalia jogo COMPLETED com nota 1-10 via UI', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT21', platform: 'PC', status: 'COMPLETED' }).then((id) => {
        cy.visit(`/games/${id}`);
        cy.get('[data-cy="game-detail-rate-button"]').click();
        cy.get('[data-cy="game-detail-rate-input"]').clear().type('8');
        cy.get('[data-cy="game-detail-rate-submit"]').click();
        cy.get('[data-cy="game-detail-rating"]', { timeout: 10000 }).should('contain', '8');
      });
    });
  });

  it('CT22 — botão de avaliar NÃO existe quando status != COMPLETED', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT22', platform: 'PC', status: 'BACKLOG' }).then((id) => {
        cy.visit(`/games/${id}`);
        cy.get('[data-cy="game-detail"]').should('be.visible');
        cy.get('[data-cy="game-detail-rate-button"]').should('not.exist');
      });
    });
  });

  it('CT23 — rejeita nota fora do intervalo 1-10', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT23', platform: 'PC', status: 'COMPLETED' }).then((id) => {
        cy.visit(`/games/${id}`);
        cy.get('[data-cy="game-detail-rate-button"]').click();
        cy.get('[data-cy="game-detail-rate-input"]').clear().type('11');
        cy.get('[data-cy="game-detail-rate-submit"]').click();
        cy.get('[data-cy="game-detail-rate-error"]').should('be.visible');

        cy.apiRequest('GET', `/games/${id}`, { token }).then((res) => {
          const game = res.body?.game ?? res.body;
          expect(game.rating).to.be.null;
        });
      });
    });
  });
});
