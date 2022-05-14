import Web3 from "web3";
import FlightSuretyApp from "./contracts/FlightSuretyApp.json";
import FlightSuretyData from "./contracts/FlightSuretyData.json";

const options = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [FlightSuretyApp, FlightSuretyData],
  events: {
    SimpleStorage: ["StorageSet"],
  },
};

export default options;
