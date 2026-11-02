/// <reference types="cypress" />

const TOKEN_STORAGE_KEY = 'gamelog.token';

describe('Autenticação (CT01-CT05, CT07)', () => {
  let primary: { name: string; email: string; password: string };
  let newUser: { name: string; email: string; password: string };

  before(() => {
    cy.fixture('users').then((u) => {
      primary = u.primary;
      newUser = u.newUser;
    });
  });

  beforeEach(() => {
    cy.resetDatabase();
  });

  it('CT01 — cadastra usuário com dados válidos e autentica', () => {
    cy.visit('/register');
    cy.get('[data-cy="register-name-input"]').type(newUser.name);
    cy.get('[data-cy="register-email-input"]').type(newUser.email);
    cy.get('[data-cy="register-password-input"]').type(newUser.password);
    cy.get('[data-cy="register-password-confirm-input"]').type(newUser.password);
    cy.get('[data-cy="register-submit-button"]').click();

    cy.location('pathname', { timeout: 10000 }).should('not.eq', '/register');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(TOKEN_STORAGE_KEY)).to.be.a('string');
    });
  });

  it('CT02 — rejeita cadastro com e-mail duplicado', () => {
    // Isolamento: o seed mínimo não cria o `newUser`. Garantimos o conflito
    // pré-registrando-o via API antes de tentar duplicar pela UI.
    cy.registerUser(newUser);

    cy.visit('/register');
    cy.get('[data-cy="register-name-input"]').type('Qualquer Nome');
    cy.get('[data-cy="register-email-input"]').type(newUser.email);
    cy.get('[data-cy="register-password-input"]').type('OutraSenha123');
    cy.get('[data-cy="register-password-confirm-input"]').type('OutraSenha123');
    cy.get('[data-cy="register-submit-button"]').click();

    cy.get('[data-cy="register-error-message"]').should('be.visible');
    cy.location('pathname').should('eq', '/register');
  });

  it('CT03 — rejeita senha com menos de 8 caracteres', () => {
    cy.visit('/register');
    cy.get('[data-cy="register-name-input"]').type(newUser.name);
    cy.get('[data-cy="register-email-input"]').type('curta@gamelog.com');
    cy.get('[data-cy="register-password-input"]').type('Abc1');
    cy.get('[data-cy="register-password-confirm-input"]').type('Abc1');
    cy.get('[data-cy="register-submit-button"]').click();

    cy.location('pathname').should('eq', '/register');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(TOKEN_STORAGE_KEY)).to.be.null;
    });
  });

  it('CT04 — autentica usuário válido e recebe JWT', () => {
    // Usuário primário já vem no seed mínimo.
    cy.visit('/login');
    cy.get('[data-cy="login-email-input"]').type(primary.email);
    cy.get('[data-cy="login-password-input"]').type(primary.password);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.location('pathname', { timeout: 10000 }).should('not.eq', '/login');
    cy.window().then((win) => {
      const token = win.localStorage.getItem(TOKEN_STORAGE_KEY);
      expect(token).to.be.a('string');
      expect(token!.length).to.be.greaterThan(20);
    });
  });

  it('CT05 — rejeita login com senha incorreta', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-email-input"]').type(primary.email);
    cy.get('[data-cy="login-password-input"]').type('SenhaErrada999');
    cy.get('[data-cy="login-submit-button"]').click();

    cy.get('[data-cy="login-error-message"]').should('be.visible');
    cy.location('pathname').should('eq', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(TOKEN_STORAGE_KEY)).to.be.null;
    });
  });

  it('CT07 — encerra sessão limpando JWT do localStorage', () => {
    cy.login(primary.email, primary.password);
    cy.visit('/');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(TOKEN_STORAGE_KEY)).to.be.a('string');
    });

    cy.get('[data-cy="header-user-menu"]').click();
    cy.get('[data-cy="header-logout-button"]').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(TOKEN_STORAGE_KEY)).to.be.null;
    });
  });
});
