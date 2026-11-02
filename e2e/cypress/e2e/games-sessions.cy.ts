/// <reference types="cypress" />

describe('Sessões de jogo (CT24-CT26)', () => {
  let primary: { email: string; password: string };
  let token: string;

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
    });
  });

  beforeEach(() => {
    cy.resetDatabase();
    cy.loginApi(primary.email, primary.password).then((t) => {
      token = t;
      cy.window().then((win) => {
        win.localStorage.setItem('gamelog.token', t);
      });
    });
  });

  it('CT24 — registra sessão com horas válidas (0 < h <= 24)', () => {
    cy.createGame(token, { title: 'CT24', platform: 'PC', status: 'PLAYING' }).then((game) => {
      cy.visit(`/games/${game.id}`);
      cy.get('[data-cy="session-form"]').should('be.visible');
      cy.get('[data-cy="session-hours-input"]').type('2.5');
      cy.get('[data-cy="session-submit-button"]').click();
      cy.get('[data-cy="sessions-list"]', { timeout: 10000 })
        .find('[data-cy="session-item"]')
        .should('have.length.at.least', 1);
      cy.get('[data-cy="game-detail-hours-total"]').should('contain', '2.5');
    });
  });

  it('CT25a — rejeita duração = 0', () => {
    cy.createGame(token, { title: 'CT25a', platform: 'PC', status: 'PLAYING' }).then((game) => {
      cy.apiRequest('POST', `/games/${game.id}/sessions`, {
        token,
        body: { hours: 0 },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  it('CT25b — rejeita duração > 24', () => {
    cy.createGame(token, { title: 'CT25b', platform: 'PC', status: 'PLAYING' }).then((game) => {
      cy.apiRequest('POST', `/games/${game.id}/sessions`, {
        token,
        body: { hours: 25 },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  it('CT26a — session-form NÃO existe quando status=BACKLOG', () => {
    cy.createGame(token, { title: 'CT26a', platform: 'PC', status: 'BACKLOG' }).then((game) => {
      cy.visit(`/games/${game.id}`);
      cy.get('[data-cy="game-detail"]').should('be.visible');
      cy.get('[data-cy="session-form"]').should('not.exist');

      cy.apiRequest('POST', `/games/${game.id}/sessions`, {
        token,
        body: { hours: 1 },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  it('CT26b — session-form NÃO existe quando status=ABANDONED', () => {
    cy.createGame(token, { title: 'CT26b', platform: 'PC', status: 'ABANDONED' }).then((game) => {
      cy.visit(`/games/${game.id}`);
      cy.get('[data-cy="game-detail"]').should('be.visible');
      cy.get('[data-cy="session-form"]').should('not.exist');

      cy.apiRequest('POST', `/games/${game.id}/sessions`, {
        token,
        body: { hours: 1 },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });
});
