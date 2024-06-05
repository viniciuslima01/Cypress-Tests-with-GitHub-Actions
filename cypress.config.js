const { defineConfig } = require("cypress");
const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  projectId: 'aaen76',
  e2e: {
    setupNodeEvents(on, config) {
      try {
        // Carregar variáveis de ambiente a partir do cypress.env.json
        // const envConfig = require('./cypress.env.json');
        // config.env = { ...config.env, ...envConfig };

        // console.log('Database Config:', config.env.db);
        // // Configurar a função de plugin de banco de dados
        // on('task', {
        //   queryDb: async ({query}) => {
        //     const connection = config.env.db;
        //     const db = pgp(connection);

        //     return db.any(query)
        //       .then(data => data)
        //       .catch(error => {
        //         console.error('ERROR:', error);
        //         throw error;
        //       });
        //   },
        on('task', {
          deleteNumberedFixtures() {
            const fixturesDir = path.join('./cypress/fixtures');
            return new Promise((resolve, reject) => {
                fs.readdir(fixturesDir, (err, files) => {
                    if (err) return reject(err);
                    
                    const numberRegex = /\d/; // Expressão regular para verificar se o nome do arquivo contém um número

                    files.forEach(file => {
                        if (numberRegex.test(file)) {
                            fs.unlink(path.join(fixturesDir, file), err => {
                                if (err) return reject(err);
                            });
                        }
                    });

                    resolve(null);
                });
            });
          },          
        })
      }catch (error) {
        console.error('Setup Node Events Error:', error);
        throw error;
      }
    },
    defaultCommandTimeout: 60000,
    taskTimeout: 120000, 
  },
  env: {
    "apiURL": "https://apiteste.easydots.com.br/humanresources",
    "username": "hv.vinicius",
    "password": "20240524"
  }
});