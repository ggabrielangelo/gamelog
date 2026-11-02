/// <reference types="cypress" />

describe('Games CRUD (CT08-CT17)', () => {
  let primary: { name: string; email: string; password: string };
  let secondary: { name: string; email: string; password: string };
  let gameBasic: Record<string, unknown>;
  let gameMinimal: Record<string, unknown>;

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
      secondary = u.secondary;
    });
    cy.fixture('games').then((g) => {
      gameBasic = g.basic;
      gameMinimal = g.minimal;
    });
  });

  beforeEach(() => {
    cy.resetDatabase();
    cy.login(primary.email, primary.password);
  });

  it('CT08 — cadastra jogo completo via UI', () => {
    cy.visit('/games/new');
    cy.get('[data-cy="game-form-title-input"]').type(String(gameBasic.title));
    cy.get('[data-cy="game-form-platform-select"]').select(String(gameBasic.platform));
    cy.get('[data-cy="game-form-genre-input"]').type(String(gameBasic.genre));
    cy.get('[data-cy="game-form-status-select"]').select(String(gameBasic.status));
    cy.get('[data-cy="game-form-cover-input"]').type(String(gameBasic.coverUrl));
    cy.get('[data-cy="game-form-notes-input"]').type(String(gameBasic.notes));
    cy.get('[data-cy="game-form-submit-button"]').click();

    cy.get('[data-cy="game-detail-title"]', { timeout: 10000 }).should('contain', gameBasic.title);
  });

  it('CT09 — cadastra jogo só com campos obrigatórios', () => {
    cy.visit('/games/new');
    cy.get('[data-cy="game-form-title-input"]').type(String(gameMinimal.title));
    cy.get('[data-cy="game-form-platform-select"]').select(String(gameMinimal.platform));
    cy.get('[data-cy="game-form-submit-button"]').click();

    cy.get('[data-cy="game-detail-title"]', { timeout: 10000 }).should('contain', gameMinimal.title);
  });

  it('CT10 — rejeita título vazio', () => {
    cy.visit('/games/new');
    cy.get('[data-cy="game-form-platform-select"]').select('PC');
    cy.get('[data-cy="game-form-submit-button"]').click();

    cy.location('pathname').should('contain', '/games/new');
    cy.get('[data-cy="game-form-title-input"]').should('be.visible');
  });

  it('CT11 — rejeita plataforma fora da lista fechada via API', () => {
    cy.login(primary.email, primary.password).then((token) => {
      cy.apiRequest('POST', '/games', {
        token,
        body: { title: 'Teste CT11', platform: 'PlayStation6' },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  it('CT12 — rejeita título > 120 caracteres', () => {
    const longTitle = 'A'.repeat(121);
    cy.visit('/games/new');
    cy.get('[data-cy="game-form-title-input"]').type(longTitle, { delay: 0 });
    cy.get('[data-cy="game-form-platform-select"]').select('PC');
    cy.get('[data-cy="game-form-submit-button"]').click();

    cy.location('pathname').should('contain', '/games/new');
  });

  it('CT13 — edita título e plataforma de um jogo próprio', () => {
    cy.visit('/games');
    cy.get('[data-cy="game-card-title"]').first().click();
    cy.get('[data-cy="game-detail-edit-button"]').click();

    cy.get('[data-cy="game-form-title-input"]').clear().type('Editado CT13');
    cy.get('[data-cy="game-form-platform-select"]').select('PS5');
    cy.get('[data-cy="game-form-submit-button"]').click();

    cy.get('[data-cy="game-detail-title"]', { timeout: 10000 }).should('contain', 'Editado CT13');
  });

  it('CT14 — rejeita edição com título vazio', () => {
    cy.visit('/games');
    cy.get('[data-cy="game-card-title"]').first().click();
    cy.get('[data-cy="game-detail-edit-button"]').click();
    cy.get('[data-cy="game-form-title-input"]').clear();
    cy.get('[data-cy="game-form-submit-button"]').click();

    cy.get('[data-cy="game-form"]').should('be.visible');
  });

  it('CT15 — rejeita edição de jogo de outro usuário via API (403)', () => {
    cy.apiRequest('POST', '/auth/register', {
      body: {
        name: secondary.name,
        email: secondary.email,
        password: secondary.password,
      },
    }).then((regRes) => {
      expect([200, 201]).to.include(regRes.status);
      const tokenB = (regRes.body?.token ?? regRes.body?.data?.token) as string;

      cy.apiRequest('POST', '/games', {
        token: tokenB,
        body: { title: 'Jogo do B', platform: 'PC' },
      }).then((createRes) => {
        expect([200, 201]).to.include(createRes.status);
        const gameId = createRes.body?.game?.id ?? createRes.body?.id;

        cy.login(primary.email, primary.password).then((tokenA) => {
          cy.apiRequest('PATCH', `/games/${gameId}`, {
            token: tokenA,
            body: { title: 'Invasão' },
          }).then((res) => {
            expect(res.status).to.be.oneOf([403, 404]);
          });
        });
      });
    });
  });

  it('CT16 — remove jogo com confirmação explícita (modal)', () => {
    cy.visit('/games');
    cy.get('[data-cy="game-card-title"]').first().click();
    cy.get('[data-cy="game-detail-title"]').invoke('text').then((titleText) => {
      cy.get('[data-cy="game-detail-delete-button"]').click();
      cy.get('[data-cy="game-detail-delete-confirm"]').should('be.visible').click();

      cy.location('pathname', { timeout: 10000 }).should('eq', '/games');
      cy.contains(titleText.trim()).should('not.exist');
    });
  });

  it('CT17 — remoção faz cascata nas sessões (verificação via API)', () => {
    cy.login(primary.email, primary.password).then((token) => {
      cy.apiRequest('POST', '/games', {
        token,
        body: { title: 'CT17 Cascata', platform: 'PC', status: 'PLAYING' },
      }).then((cRes) => {
        const gameId = cRes.body?.game?.id ?? cRes.body?.id;
        cy.apiRequest('POST', `/games/${gameId}/sessions`, {
          token,
          body: { hours: 2 },
        }).then((sRes) => {
          expect([200, 201]).to.include(sRes.status);

          cy.apiRequest('DELETE', `/games/${gameId}`, { token }).then((dRes) => {
            expect([200, 204]).to.include(dRes.status);

            cy.apiRequest('GET', `/games/${gameId}/sessions`, { token }).then((lRes) => {
              expect(lRes.status).to.eq(404);
            });
          });
        });
      });
    });
  });
});
