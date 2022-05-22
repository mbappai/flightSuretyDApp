const path = require("path");

const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = 'pulse copy reflect invest clutch display evolve able airport harvest rabbit picnic';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  // contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    development: {
      // Removed to get Truffle Test to pass for Oracles 
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      host: "127.0.0.1",
      port: 8545,
      network_id: '*',
      gas: 6721975 // 9999999
    }
  },
    develop: { // default with truffle unbox is 7545, but we can use develop to test changes, ex. truffle migrate --network develop
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
,
  compilers: {
    solc: {
      version: "^0.8.13"
    }
  },

  contracts_build_directory: path.join(__dirname, "src/dapp/src/contracts")

};
