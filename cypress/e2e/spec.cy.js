
const urlApi = Cypress.env("apiURL")+'/session?&integrador=true';
const username = Cypress.env("username");
const password = Cypress.env("password");

describe('API Test EasyConnect', () => {

  before('Realizando login e gerando token', ()=>{
    cy.loginAPI(urlApi, username, password)
  })

  afterEach('Deletar jsons after test', ()=>{  
    cy.task('deleteNumberedFixtures');
  });
  
  context('Teste de carga', ()=>{
    it('Realizar batida de ponto para o mesmo aparelho', ()=>{
      //Converte o JSON do Body que utiliza o form-data
      //A conversão ocorre porque o cypress não lida com json form-data, por isso é necessário a função de conversão.
      cy.batePontoApiEvento(0,120);
    })

    it('Realizar batida de ponto em aparelhos diferentes', () =>{
      cy.addIps();
      cy.batePontoApiEvento(1,120);
    });
  })
})

function generateRandomTime(){
  const randomHour = Math.floor(Math.random() * 18); // Hora aleatória (0-23)
  const randomMinute = Math.floor(Math.random() * 60); // Minuto aleatório (0-59)
  const randomSecond = Math.floor(Math.random() * 60); // Segundo aleatório (0-59)

  // Crie um objeto Moment.js com a hora aleatória
  const randomTime = moment().set({
    'hour': randomHour,
    'minute': randomMinute,
    'second': randomSecond
  });

  return randomTime.format('YYYY-MM-DDTHH:mm:ss'); //Formato datetime: 'YYYY-MM-DD HH:mm:ss'
}
