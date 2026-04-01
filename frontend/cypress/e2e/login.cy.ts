describe('Login Flow', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = 'testpassword123';

  before(() => {
    // Navigate to register page and create a new test user
    cy.visit('/register', { failOnStatusCode: false });

    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // The register page sets a timeout to navigate to login after 2 seconds
    cy.contains('Registration successful', { timeout: 10000 });
    // Wait for the automatic redirect to login
    cy.url({ timeout: 10000 }).should('include', '/login');
  });

  it('successfully logs in with valid credentials', () => {
    cy.visit('/login', { failOnStatusCode: false });
    // Fill out login form with the newly registered credentials
    cy.get('input[type="email"]').clear().type(uniqueEmail);
    cy.get('input[type="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();

    // Verify successful redirect to the dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('h1', 'Dashboard');
    cy.contains('Welcome to your dashboard!');
  });

  it('fails to log in with invalid password', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('input[type="email"]').clear().type(uniqueEmail);
    cy.get('input[type="password"]').clear().type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Verify error message is shown and URL stays on /login
    cy.contains('Invalid credentials', { matchCase: false }).should('be.visible');
    cy.url().should('include', '/login');
  });

  after(() => {
    // Clean up the user after the test is done
    const dbUser = Cypress.env('DB_USER') || 'refwikiuser';
    const dbPassword = Cypress.env('DB_PASSWORD') || 'refwikipassword';
    const dbName = Cypress.env('DB_NAME') || 'refwikidb';

    // We run the DB command via docker exec to the mysql-db container
    cy.exec(`docker exec mysql-db mysql -u ${dbUser} -p${dbPassword} ${dbName} -e "DELETE FROM users WHERE email='${uniqueEmail}';"`, { failOnNonZeroExit: false });
  });
});
