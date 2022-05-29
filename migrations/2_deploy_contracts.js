const FlightSuretyApp = artifacts.require("flightSuretyApp");
const FlightSuretyData = artifacts.require("flightSuretyData");
const fs = require('fs');

module.exports = function(deployer,network, accounts) {

  let firstAirline = accounts[0];
  //let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'; // use this for testing purposes
  deployer.deploy(FlightSuretyData, firstAirline)
  .then(() => deployer.deploy(FlightSuretyApp,FlightSuretyData.address)
              .then(() => {
                  let config = {
                      localhost: {
                          url: 'http://localhost:8545',
                          dataAddress: FlightSuretyData.address,
                          appAddress: FlightSuretyApp.address
                      }
                  }
                   fs.writeFileSync(__dirname + '/../src/dapp/src/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                  // fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
              })
  );
}