const urlApi = Cypress.env("apiURL")+'/session?&integrador=true';
const username = Cypress.env("username");
const password = Cypress.env("password");

describe('API Test EasyConnect', () => {
  beforeEach('Realizando login e gerando token', ()=>{
    cy.task('deleteNumberedFixtures');
    cy.loginAPI(urlApi, username, password)
  })

  context('Teste de carga', ()=>{
    it.only('Realizar batida de ponto para o mesmo aparelho', ()=>{
      cy.batePontoApiEvento(0,120);
    })

    it('Realizar batida de ponto em aparelhos diferentes', () =>{
      cy.batePontoApiEvento(1,120);
    });
  })
})