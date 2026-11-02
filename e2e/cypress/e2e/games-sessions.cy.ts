/// <reference types="cypress" />

describe('Sessões de jogo (CT24-CT26)', () => {
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
    return cy.apiRequest('POST', '/games', { token, body }).then((res) => {
      expect([200, 201]).to.include(res.status);
      return cy.wrap((res.body?.game?.id ?? res.body?.id) as string);
    });
  }

  it('CT24 — registra sessão com horas válidas (0 < h <= 24)', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT24', platform: 'PC', status: 'PLAYING' }).then((id) => {
        cy.visit(`/games/${id}`);
        cy.get('[data-cy="session-form"]').should('be.visible');
        cy.get('[data-cy="session-hours-input"]').type('2.5');
        cy.get('[data-cy="session-submit-button"]').click();
        cy.get('[data-cy="sessions-list"]', { timeout: 10000 })
          .find('[data-cy="session-item"]')
          .should('have.length.at.least', 1);
        cy.get('[data-cy="game-detail-hours-total"]').should('contain', '2.5');
      });
    });
  });

  it('CT25a — rejeita duração = 0', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT25a', platform: 'PC', status: 'PLAYING' }).then((id) => {
        cy.apiRequest('POST', `/games/${id}/sessions`, {
          token,
          body: { hours: 0 },
        }).then((res) => {
          expect(res.status).to.eq(400);
        });
      });
    });
  });

  it('CT25b — rejeita duração > 24', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT25b', platform: 'PC', status: 'PLAYING' }).then((id) => {
        cy.apiRequest('POST', `/games/${id}/sessions`, {
          token,
          body: { hours: 25 },
        }).then((res) => {
          expect(res.status).to.eq(400);
        });
      });
    });
  });

  it('CT26a — session-form NÃO existe quando status=BACKLOG', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT26a', platform: 'PC', status: 'BACKLOG' }).then((id) => {
        cy.visit(`/games/${id}`);
        cy.get('[data-cy="game-detail"]').should('be.visible');
        cy.get('[data-cy="session-form"]').should('not.exist');

        cy.apiRequest('POST', `/games/${id}/sessions`, {
          token,
          body: { hours: 1 },
        }).then((res) => {
          expect(res.status).to.eq(400);
        });
      });
    });
  });

  it('CT26b — session-form NÃO existe quando status=ABANDONED', () => {
    cy.login(primary.email, primary.password).then((token) => {
      createGame(token, { title: 'CT26b', platform: 'PC', status: 'ABANDONED' }).then((id) => {
        cy.visit(`/games/${id}`);
        cy.get('[data-cy="game-detail"]').should('be.visible');
        cy.get('[data-cy="session-form"]').should('not.exist');

        cy.apiRequest('POST', `/games/${id}/sessions`, {
          token,
          body: { hours: 1 },
        }).then((res) => {
          expect(res.status).to.eq(400);
        });
      });
    });
  });
});
