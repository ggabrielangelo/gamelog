/// <reference types="cypress" />

describe('Lista e filtros (CT27-CT29)', () => {
  let primary: { email: string; password: string };
  let secondary: { name: string; email: string; password: string };
  let token: string;

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
      secondary = u.secondary;
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

  it('CT27 — lista os jogos do usuário com cards visíveis', () => {
    // Cria 3 jogos controlados para o usuário primário.
    cy.createGame(token, { title: 'CT27 Alpha', platform: 'PC' });
    cy.createGame(token, { title: 'CT27 Beta', platform: 'PS5' });
    cy.createGame(token, { title: 'CT27 Gamma', platform: 'Switch' }).then(() => {
      cy.visit('/games');
      cy.get('[data-cy="games-list"]').should('be.visible');
      cy.get('[data-cy="game-card"]').should('have.length', 3);
      cy.get('[data-cy="game-card-title"]').then(($titles) => {
        const texts = Array.from($titles).map((n) => n.textContent?.trim() ?? '');
        expect(texts).to.include.members(['CT27 Alpha', 'CT27 Beta', 'CT27 Gamma']);
      });
    });
  });

  it('CT28 — filtra por combinação status + plataforma', () => {
    // Único jogo que deve passar no filtro Switch + BACKLOG.
    cy.createGame(token, { title: 'CT28 Match', platform: 'Switch', status: 'BACKLOG' });
    // Mesma plataforma mas status diferente — não deve passar.
    cy.createGame(token, { title: 'CT28 Switch Playing', platform: 'Switch', status: 'PLAYING' });
    // Mesmo status mas plataforma diferente — não deve passar.
    cy.createGame(token, { title: 'CT28 PC Backlog', platform: 'PC', status: 'BACKLOG' });
    // Nem a plataforma nem o status batem — não deve passar.
    cy.createGame(token, {
      title: 'CT28 Xbox Completed',
      platform: 'Xbox',
      status: 'COMPLETED',
    }).then(() => {
      cy.visit('/games');
      cy.get('[data-cy="games-filter-status"]').select('BACKLOG');
      cy.get('[data-cy="games-list"]').should('be.visible');
      cy.get('[data-cy="games-filter-platform"]').select('Switch');
      cy.get('[data-cy="games-list"]').should('be.visible');

      cy.get('[data-cy="game-card"]', { timeout: 10000 }).then(($cards) => {
        expect($cards.length, 'exatamente 1 card após filtro Switch+BACKLOG').to.eq(1);
        const row = {
          title: Cypress.$($cards[0]).find('[data-cy="game-card-title"]').text().trim(),
          platform: Cypress.$($cards[0]).find('[data-cy="game-card-platform"]').text().trim(),
          status: Cypress.$($cards[0]).find('[data-cy="game-card-status"]').text().trim(),
        };
        expect(row.title).to.eq('CT28 Match');
        expect(row.platform).to.contain('Switch');
        expect(row.status).to.contain('A jogar');
      });
    });
  });

  it('CT29 — isolamento entre usuários (jogos de outro user não aparecem)', () => {
    const uniqueTitle = `JOGO-DO-USUARIO-B-${Date.now()}`;
    cy.registerUser(secondary).then(({ token: tokenB }) => {
      cy.createGame(tokenB, { title: uniqueTitle, platform: 'PC' }).then(() => {
        cy.visit('/games');
        cy.get('[data-cy="games-search-input"]').type(uniqueTitle);
        cy.get('[data-cy="games-list-empty"]', { timeout: 10000 }).should('be.visible');
      });
    });
  });
});
