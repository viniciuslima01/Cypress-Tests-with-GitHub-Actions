const moment = require('moment');

Cypress.Commands.add('loginAPI', (urlApi,username, password)=>{
    cy.api({
        method: 'POST',
        url: urlApi,
        body:{
          "usuario":username,
          "senha": password
        }
      }).then((response)=>{
        expect(response.body.dados.token).not.be.null;
        expect(response.body.mensagem).to.be.eq('Usuário autorizado');
        const authToken = response.body.dados.token;
        const resultado = authToken != null || authToken != undefined ? true : false;
        if(resultado){
          Cypress.env('authToken', authToken);
        }
    })
})

Cypress.Commands.add('batePontoApiEvento', (type, quantidadeFuncionários)=>{
  cy.task('queryDb', {query:' SELECT facial_key, nome'+ 
                            ' FROM rh.tb_funcionario'+
                            ` ORDER BY id DESC LIMIT ${quantidadeFuncionários}`}).then((result) =>{
          expect(result).to.have.length.above(1);
        
          if(type == 1){
            let count = 0;
            result.forEach(item => {
              cy.fixture("ipsAparelhos.json").then((ip)=>{
                cy.fixture("jsonData.json")
                  .then((file) => {

                    file.dateTime = generateRandomTime()+'-3:00';
                    file.AccessControllerEvent.name = item.nome;
                    file.AccessControllerEvent.employeeNoString = item.facial_key;
                    file.ipAddress = ip.Aparelhos.ips[count];
                    file.macAddress = ip.Aparelhos.macAdress[count];

                    if(count == 0){
                      cy.writeFile(`./cypress/fixtures/jsonData.json`, file);
                    }else{
                      cy.writeFile(`./cypress/fixtures/jsonData${count}.json`, file);
                    }
                    count++;
                })
              })
            });
          }else{
            let count = 0;
            result.forEach(item => {
              cy.fixture("jsonData.json")
              .then((file) => {
                file.dateTime = generateRandomTime()+'-3:00';
                file.AccessControllerEvent.name = item.nome;
                file.AccessControllerEvent.employeeNoString = item.facial_key;                              

                if(count == 0){
                  cy.writeFile(`./cypress/fixtures/jsonData.json`, file);
                }else{
                  console.log('contagem: '+count);
                  cy.writeFile(`./cypress/fixtures/jsonData${count}.json`, file);
                }
                count++;
              })
            });
          }
          
          let incrementJson = 0;
          result.forEach(() => {
            if(incrementJson == 0){
              fileReader(`jsonData.json`);
            }else{
              fileReader(`jsonData${incrementJson}.json`)
            }
            incrementJson++;
          })
        })      
})

Cypress.Commands.add('addIps', ()=>{
  const ips = [];
  for(let i = 0; i < 255; i++){
    ips.push(`192.168.100.${i}`);
  }

  cy.fixture('ipsAparelhos.json').then((file) => {
    file.Aparelhos.ips = ips;
    return cy.writeFile(`./cypress/fixtures/ipsAparelhos.json`, file);
  });
})

function fileReader(file){
  cy.fixture(file)
    .then((jsonData)=>{
      const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' })

      var formDataObject = new FormData();
      formDataObject.append('event_log', blob, { type: 'application/json' });

      const object = {};
      formDataObject.forEach((value, key) => {
        if (value instanceof Blob) {
          // Convert Blob to text if it's a JSON Blob
          const reader = new FileReader();
          reader.onload = () => {
            object[key] = reader.result;
          };
          reader.readAsText(value);
        } else {
          object[key] = value;
        }
      });

      cy.wait(300);
      
      cy.api({
        method: 'POST',
        url: 'http://192.168.100.10:3002/evento',
        form: true,
        body: object,
      }).then((response) => {
        expect(response.status).to.not.eq(500);
        expect(response.body.message).to.be.eq("Sincronização automatica concluida")
        expect(response.body).to.have.property('response');
      });
  })
}


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


