/// <reference types="cypress" />

describe('Dashboard (CT30, CT32)', () => {
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

  it('CT30 — contagem por status reflete os jogos criados', () => {
    // Distribuição conhecida: 2 BACKLOG, 1 PLAYING, 3 COMPLETED, 1 ABANDONED = 7 total.
    const toCreate: Array<{ title: string; status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'ABANDONED' }> = [
      { title: 'CT30 Backlog A', status: 'BACKLOG' },
      { title: 'CT30 Backlog B', status: 'BACKLOG' },
      { title: 'CT30 Playing', status: 'PLAYING' },
      { title: 'CT30 Completed A', status: 'COMPLETED' },
      { title: 'CT30 Completed B', status: 'COMPLETED' },
      { title: 'CT30 Completed C', status: 'COMPLETED' },
      { title: 'CT30 Abandoned', status: 'ABANDONED' },
    ];
    cy.wrap(toCreate).each((g: { title: string; status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'ABANDONED' }) => {
      cy.createGame(token, { title: g.title, platform: 'PC', status: g.status });
    });

    cy.visit('/');
    cy.get('[data-cy="dashboard-stat-total-games"]').should('contain', '7');
    cy.get('[data-cy="dashboard-stat-backlog"]').should('contain', '2');
    cy.get('[data-cy="dashboard-stat-playing"]').should('contain', '1');
    cy.get('[data-cy="dashboard-stat-completed"]').should('contain', '3');
    cy.get('[data-cy="dashboard-stat-abandoned"]').should('contain', '1');
  });

  it('CT32 — soma total de horas reflete as sessões criadas', () => {
    // Sessões conhecidas: 1.5 + 2 + 0.5 = 4.0 h.
    cy.createGame(token, { title: 'CT32 Jogo', platform: 'PC', status: 'PLAYING' }).then(
      (game) => {
        cy.createSession(token, game.id, { hours: 1.5 });
        cy.createSession(token, game.id, { hours: 2 });
        cy.createSession(token, game.id, { hours: 0.5 }).then(() => {
          cy.visit('/');
          cy.get('[data-cy="dashboard-stat-total-hours"]').should('contain', '4.0');
        });
      },
    );
  });
});
