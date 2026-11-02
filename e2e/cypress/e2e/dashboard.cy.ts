/// <reference types="cypress" />

describe('Dashboard (CT30, CT32)', () => {
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

  it('CT30 — contagem por status bate com o backend', () => {
    cy.login(primary.email, primary.password).then((token) => {
      cy.apiRequest('GET', '/stats', { token }).then((res) => {
        expect(res.status).to.eq(200);
        const stats = res.body?.stats ?? res.body;

        cy.visit('/');
        cy.get('[data-cy="dashboard-stat-total-games"]').should('contain', String(stats.totalGames));
        cy.get('[data-cy="dashboard-stat-completed"]').should('contain', String(stats.completed));
        cy.get('[data-cy="dashboard-stat-playing"]').should('contain', String(stats.playing));
        cy.get('[data-cy="dashboard-stat-backlog"]').should('contain', String(stats.backlog));
        cy.get('[data-cy="dashboard-stat-abandoned"]').should('contain', String(stats.abandoned));
      });
    });
  });

  it('CT32 — soma total de horas bate com o backend', () => {
    cy.login(primary.email, primary.password).then((token) => {
      cy.apiRequest('GET', '/stats', { token }).then((res) => {
        expect(res.status).to.eq(200);
        const stats = res.body?.stats ?? res.body;
        const expected = Number(stats.totalHours).toFixed(1);

        cy.visit('/');
        cy.get('[data-cy="dashboard-stat-total-hours"]').should('contain', expected);
      });
    });
  });
});
