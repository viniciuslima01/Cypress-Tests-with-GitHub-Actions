const moment = require('moment');

let count = Cypress.env('registros');

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
Cypress.Commands.add('batePontoApiEvento', (type, quantidadeFuncionários) => {
  cy.fixture('funcionarios.json').then((funcionarios) => {
    let register = 0;

    funcionarios.forEach(item => {
      cy.fixture("jsonData.json").then((file) => {
        file.dateTime = generateTimestamps(count);
        file.AccessControllerEvent.name = item.nome;
        file.AccessControllerEvent.employeeNoString = item.facial_key;

        if(type === 1){
          cy.fixture("ipsAparelhos.json").then((ip) => {
            file.ipAddress = ip.Aparelhos.ips[register];
            file.macAddress = ip.Aparelhos.macAdress[register];

            const fileName = `jsonData${register}.json`;

            cy.writeFile(`./cypress/fixtures/${fileName}`, file).then(() => {
              cy.task('log', `Wrote file: ${fileName} with timestamp: ${file.dateTime}`);
            });

            // fileReader(fileName);

            register++;
            count++;
          });
        }else{
          const fileName = `jsonData${register}.json`;

          cy.writeFile(`./cypress/fixtures/${fileName}`, file).then(() => {
            cy.task('log', `Wrote file: ${fileName} with timestamp: ${file.dateTime}`);
          });

          // fileReader(fileName);

          register++;
          count++;
        }
      });
    });
    
    funcionarios.forEach((_, index) => {
      const fileName = `jsonData${index}.json`;
      cy.fixture(`jsonData${index}.json`).then((file)=>{
        cy.task('log', `Wrote file: ${fileName} with timestamp: ${file.dateTime}`);
      })
      fileReader(fileName);
    })
  })
});

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
        url: 'https://28f3-2804-fc-8d2c-fb00-557a-929b-512d-635d.ngrok-free.app/evento',
        form: true,
        body: object,
      }).then((response) => {
        expect(response.status).to.not.eq(500);
        expect(response.body.message).to.be.eq("Sincronização automatica concluida")
        expect(response.body).to.have.property('response');
      });
  })
}
function generateTimestamps(count){
  const now = new Date();

  cy.task('log', 'registro: '+count);
  
  const newTimestamp = new Date(now.getTime() + count * 120000);// adiciona 1 minuto para cada registro
  const year = newTimestamp.getFullYear();
  const month = String(newTimestamp.getMonth() + 1).padStart(2, '0');// mês começa do 0
  const day = String(newTimestamp.getDate()).padStart(2, '0');
  const hours = String(newTimestamp.getHours()).padStart(2, '0');
  const minutes = String(newTimestamp.getMinutes()).padStart(2, '0');
  const seconds = String(newTimestamp.getSeconds()).padStart(2, '0');
  
  const formattedTimestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`;

  return formattedTimestamp;
}

