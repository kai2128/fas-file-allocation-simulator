describe('Integration testing, format disk', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('open webpage', () => {
    cy.url().should('eq', 'http://localhost:3333/')
    cy.contains('Input').should('exist')
    cy.contains('Files').should('exist')
    cy.contains('File Allocation Table').should('exist')
    cy.contains('Volume Blocks').should('exist')
    cy.contains('Action').should('exist')
    cy.contains('Log').should('exist')
    cy.contains('Disk Info').should('exist')
  })

  it('select file system and set disk size', () => {
    cy.get('[data-test="fs-select-input"]')
      .select('FAT')
      .should('have.value', 'FAT')

    cy.get('[data-test="disk-size-input"]')
      .type('100')
      .should('have.value', '100')
  })

  it('format FAT', () => {
    cy.format('FAT', 20)

    cy.get('#disk-blocks').find('>div').should('have.length', 20)
    cy.get('[data-test="fat-table"]').find('>tr').should('have.length', 16)
    cy.get('#fat-0').should('contain.text', 'Reserved')
    cy.get('#fat-1').should('contain.text', 'Reserved')
    cy.get('#fat-2').should('contain.text', 'END')
  })

  it('format ext4', () => {
    cy.format('ext4', 20)

    cy.get('#disk-blocks').find('>div').should('have.length', 20)
    cy.get('[data-test="block-bitmap"]').find('>tr').should('have.length', 20)
    cy.get('[data-test="inode-bitmap"]').find('>tr').should('have.length', 20)
    cy.get('[data-test="inode"]').should('contain.text', 1)
    cy.get('[data-test="inode"]').should('contain.text', 'Root Directory')
    cy.get('[data-test="extents"]').find('>tr').should('contain.text', '0 - 0')
  })
})
