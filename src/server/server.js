const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Config = require('./config.json');
const Web3 = require('web3');
const express =  require('express');
const fs = require('fs');


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const STATUS_CODES = [
  STATUS_CODE_UNKNOWN,
  STATUS_CODE_ON_TIME,
  STATUS_CODE_LATE_AIRLINE,
  STATUS_CODE_LATE_WEATHER,
  STATUS_CODE_LATE_TECHNICAL,
  STATUS_CODE_LATE_OTHER
]

class Oracle{
    
    constructor(account, indexes){
        this.account = account;
        this.indexes = indexes
    }

    get oracleIndexes(){
        return this.indexes;
    }

    // gets fired if oracle request matches one of it's indexes.
    async fetchFlightStatus(){
        // invoke call back function from contract once complete.
    }
    
}

let registeredOracles = [];

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)
    console.log(event)
    // get index of request.
    let requestIndex = event.returnValues.index; // change it to actual index
    
    // find oracles that contains index of the request - loop through oracles objects and check their indexes.
    registeredOracles.forEach(async(oracle)=>{
        if(oracle.oracleIndexes.contains(requestIndex)){
            
            // let assigned oracle fetch data and invoke callback from contract once complete.
            await oracle.fetchFlightStatus();
        }
    })
});

function init(){
 // fetch oracles from memory
 fs.readFile('oracleData.json',(err, data)=>{
    if(data){
        // hydrate oracles array if present in memory
        registeredOracles = JSON.parse(data);
    }else{
        registerOracles();
    }
});


}

function persistOracles(oracleData){

    const data = JSON.stringify(oracleData);
    fs.write('oracleData.json',data,function(err,data){
        if(err) {
            console.log('Error when persisting file',err);
            return;
        }else{
            console.log("File written successfully!\n");
        }
    })

}

async function registerOracles(){
    
    // fetch accounts created by ganache
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];


    let registrationFee = web3.utils.toWei('1.5','ether');
    // loop over oracles accounts and register each one.
    for (const account of accounts){
       await flightSuretyApp.methods.registerOracle().send({from:account, value:registrationFee, gas:3000000});
       let indexes = await flightSuretyApp.methods.getMyIndexes().call({from:account});

       console.log(indexes)

        // instantiate new oracle objects with address and it's assigned indexes by the contract as constructor params.
       let oracleObject = new Oracle(account,indexes);
       registeredOracles.push(oracleObject);
       console.log(registeredOracles)
    }

    // persist oracles in memory.
    persistOracles(registeredOracles);
    
}

// declare random status code generator.


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

exports.app = app;
exports.init = init;


