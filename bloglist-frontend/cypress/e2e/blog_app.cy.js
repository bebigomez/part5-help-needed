describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')

    const user = {
      name: 'Bebi Tester',
      username: 'bebi_tester',
      password: 'salainen',
    }

    cy.request('POST', 'http://localhost:3003/api/users', user)

    cy.visit('http://localhost:5173')
  })

  it('Login form is shown', function () {
    cy.contains('log in to application')
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.get('#username').type('bebi_tester')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('Bebi Tester logged in')
    })

    it('fails with wrong credentials', function () {
      cy.get('#username').type('bebi_tester')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('.error')
        .should('contain', 'Wrong credentials')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
      cy.login({ username: 'bebi_tester', password: 'salainen' })
      cy.createBlog({
        title: 'This is a new blog for testing',
        author: 'bebi tester',
        url: 'testing.com',
        likes: 100,
      })
    })

    it('a new blog can be created', function () {
      cy.contains('This is a new blog for testing bebi tester')
    })

    it.only('user can like a blog', function () {
      cy.contains('This is a new blog for testing bebi tester')
        .contains('show')
        .click()

      cy.contains('Likes: 100').contains('like').click()

      cy.contains('Likes: 101')
    })

    it.only('user can delete his own blog', function () {
      cy.contains('This is a new blog for testing bebi tester')
        .contains('show')
        .click()

      
      cy.get('#delete-button').click()
      
      cy.get('.html').should('not.contain', 'This is a new blog for testing bebi tester')

      cy.contains('Likes: 101')
    })
  })
})
