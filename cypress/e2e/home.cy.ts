describe('Job Tracker Application', () => {
  it('should load the homepage and display the hero section', () => {
    // Visit the local development server
    cy.visit('http://localhost:3000')

    // Verify the main heading is visible
    cy.get('h1').contains('A better way to track your job application.')

    // Verify the navigation bar loads
    cy.contains('Job Tracker').should('be.visible')

    // Verify the call to action exists
    cy.contains('Start for free').should('be.visible')
  })
})