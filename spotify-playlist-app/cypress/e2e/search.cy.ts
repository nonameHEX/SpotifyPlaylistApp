/// <reference types="cypress" />

describe('Search Songs', () => {

  beforeEach(() => {
    cy.visit('localhost:3000')
    cy.wait(500)
    cy.get('#search-page').click()
    cy.wait(500)
  })

  it("Search songs - search elements exists", () => {
    cy.get('[data-cy="search-submit"]').should('contain', 'Hledej')
    cy.get('[data-cy="search-field"]').should('have.value', '');
    cy.get('[data-cy="search-field"]').should('contain', 'Autor / Název / Text na vyhledání')
  })

  it("Search songs - search query", () => {
    cy.intercept('https://api.spotify.com/v1/search*').as('spotifySearch')
    cy.get('[data-cy="search-submit"]').click()
    cy.wait('@spotifySearch').then((interception) => {
      assert.equal(interception.request.method, 'GET')
      assert.equal(interception.request.query['q'], '')
      assert.equal(interception.request.query['type'], 'track,artist,album')
    })
  })

  it("Search songs - spotify search fail", () => {
    // status code value does not matter as long as it is error code
    cy.intercept('https://api.spotify.com/v1/search*', { statusCode: 404, body: {} }).as('spotifySearch')
    cy.get('[data-cy="search-submit"]').click()
    cy.wait('@spotifySearch')
    cy.get('[data-cy="search-page"]').should('not.contain', '[data-cy="search-result-filter"]')
    cy.get('[data-cy="search-page"]').should('not.contain', '[data-cy="search-result-list"]')
  })

  it("Search songs - spotify search single result", () => {
    cy.intercept('https://api.spotify.com/v1/search*', { fixture: 'spotify_search_single.json' }).as('spotifySearch')
    cy.get('[data-cy="search-field"]').type('forever')
    cy.get('[data-cy="search-submit"]').click()
    cy.wait('@spotifySearch')
    cy.get('[data-cy="search-result-filter"]').should('have.value', '')
    cy.get('[data-cy="search-result-list"]').find('[data-cy="search-result-list-item"]').should('have.length', 1)
  })

  it("Search songs - spotify search multiple results", () => {
    cy.intercept('https://api.spotify.com/v1/search*', { fixture: 'spotify_search_multiple.json' }).as('spotifySearch')
    cy.get('[data-cy="search-field"]').type('forever')
    cy.get('[data-cy="search-submit"]').click()
    cy.wait('@spotifySearch')
    cy.get('[data-cy="search-result-filter"]').should('have.value', '')
    cy.get('[data-cy="search-result-list"]').find('[data-cy="search-result-list-item"]').should('have.length', 20)
  })

  it("Search songs record - record content", () => {
    cy.intercept('https://api.spotify.com/v1/search*', { fixture: 'spotify_search_single.json' }).as('spotifySearch')
    cy.get('[data-cy="search-field"]').type('forever')
    cy.get('[data-cy="search-submit"]').click()
    cy.wait('@spotifySearch')
    cy.get('[data-cy="search-result-list"]')
      .find('[data-cy="search-result-list-item"]')
      .should('have.length', 1)
      .get('[data-cy="record-name"]')
      .contains('Lost - Frank Ocean')
    cy.get('[data-cy="search-result-list"]')
      .find('[data-cy="search-result-list-item"]')
      .should('have.length', 1)
      .get('[data-cy="add-to-playlist"]')
      .contains('Přidat do playlistu')
      .click()
  })

})
