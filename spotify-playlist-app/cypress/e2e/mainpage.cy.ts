/// <reference types="cypress" />

describe('Main page', () => {

  beforeEach(() => {
    cy.visit('localhost:3000')
    cy.wait(500)
    cy.get('#search-page').click()
    cy.wait(500)
    cy.intercept('https://api.spotify.com/v1/search*', { fixture: 'spotify_search_single.json' }).as('spotifySearch')
    cy.get('[data-cy="search-field"]').type('forever')
    cy.get('[data-cy="search-submit"]').click()
    cy.wait('@spotifySearch')
    cy.get('[data-cy="search-result-list"]')
      .get('[data-cy="search-result-list-item"]')
      .find('[data-cy="add-to-playlist"]')
      .click()
    cy.get('#main-page').click()
  })

  it("Main page - basic elements", () => {
    cy.get('[data-cy="main-page-header"]').contains("Seznam playlistů")
    cy.get('[data-cy="import-playlist-button"]').contains("Import Playlistu")
    cy.get('[data-cy="playlists-search-field"]').contains("Vyhledat playlist")
    cy.get('[data-cy="playlists-search-button"]').contains("Neseřazovat")
  })

  it("Main page - playlists search options values", () => {
    cy.get('[data-cy="playlists-search-button"]').click()
    cy.get('[data-cy="playlists-search-options"]')
      .find('[data-cy="playlists-search-option"]')
      .should('have.length', 3)
      .then((items) => {
        cy.wrap(items[0]).contains('Neseřazovat')
        cy.wrap(items[1]).contains('Počet písní (vzestupně)')
        cy.wrap(items[2]).contains('Počet písní (sestupně)')
      })
  })

  it("Main page - playlists", () => {
    cy.get('[data-cy="playlists"]')
      .find('[data-cy="playlist"]')
      .should('have.length', 1)
      .then((items) => { cy.wrap(items[0]).contains('playlist') })
  })

  it("Main page - playlist card", () => {
    cy.get('[data-cy="playlists"]')
      .find('[data-cy="playlist"]')
      .then((items) => {
        const card = cy.wrap(items[0])
        card.get('[data-cy="playlist-open-button"]').contains('Otevřít playlist')
        card.get('[data-cy="playlist-delete-button"]').contains('Smazat')
      })
  })

  it("Main page - import playlist", () => {
    cy.get('[data-cy="import-playlist-button"]').click()
    cy.get('[data-cy="import-playlist-input"]')
      .should('not.be.visible')
      .selectFile('cypress/fixtures/exported_playlist.json', {force: true})
    cy.wait(400)
    cy.get('[data-cy="playlists"]')
      .find('[data-cy="playlist"]')
      .should('have.length', 2)
      .then((items) => {
        cy.wrap(items[0]).contains('playlist')
        cy.wrap(items[1]).contains('exported playlist')
      })
  })

  it("Main page - playlists ordering", () => {
    cy.get('[data-cy="import-playlist-button"]').click()
    cy.get('[data-cy="import-playlist-input"]').selectFile('cypress/fixtures/exported_playlist.json', {force: true})
    cy.wait(400)
    cy.get('[data-cy="playlists"]')
      .find('[data-cy="playlist"]')
      .then((items) => {
        cy.wrap(items[0]).contains('playlist')
        cy.wrap(items[1]).contains('exported playlist')
      })
    cy.get('[data-cy="playlists-search-button"]').click()
    cy.get('[data-cy="playlists-search-options"]')
      .find('[data-cy="playlists-search-option"]')
      .then((items) => {
        cy.wrap(items[2]).click()
      })
    cy.get('[data-cy="playlists"]')
      .find('[data-cy="playlist"]')
      .then((items) => {
        cy.wrap(items[0]).contains('exported playlist')
        cy.wrap(items[1]).contains('playlist')
      })
  })

})
