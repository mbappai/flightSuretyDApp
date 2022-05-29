const FlightSuretyApp = require('../dapp/src/contracts/FlightSuretyApp');
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


    // gets fired if oracle request matches one of it's indexes
    async fetchFlightStatus (index,airline,flight,timestamp){

        // generate random flight status code.
        // const statusCode = generateRandomStatusCode();
        
        const statusCode = 20  // send the same status code for testing purposes

        // invoke call back function from contract once complete.
        await flightSuretyApp.methods.submitOracleResponse(
            index,
            airline,
            flight,
            timestamp,
            statusCode ).send({from:this.account, gas: 4712388})
    }
    
}

let registeredOracles = [];

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)

    // get request parms.
    let {index,airline,flight,timestamp} = event.returnValues;

    // find oracles that contains index of the request - loop through oracles objects and check their indexes.
    registeredOracles.forEach(async(oracle)=>{

        if(oracle.indexes.includes(index)){
            
            try{
                // let assigned oracle fetch data and invoke callback from contract once complete.
                await oracle.fetchFlightStatus(
                    index,
                    airline,
                    flight,
                    timestamp
                );

            }catch(err){
                console.log(err)
            }
        }
    })
});



function persistOracles(oracleData){

    // stringify oracle data to write to file
    const data = JSON.stringify(oracleData);

    fs.writeFile('./oracleData.json',data,function(err,data){
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

    // setup 20 accounts to be used for oracles
    const oracleAccounts = accounts.slice(0,21);

    web3.eth.defaultAccount = accounts[0];


    let registrationFee = web3.utils.toWei('1.5','ether');
    // loop over oracles accounts and register each one.
    for (const account of oracleAccounts){
        let indexes;
        try{
            await flightSuretyApp.methods.registerOracle().send({from:account, value:registrationFee, gas: 4712388, gasPrice: 200000000});
            indexes = await flightSuretyApp.methods.getMyIndexes().call({from:account});
        }catch(err){
            console.log(err)
        }

        // instantiate new oracle objects with address and it's assigned indexes by the contract as constructor params.
       let oracleObject = new Oracle(account,indexes);

       // store copy of all registered objects in arrays which will be persisted
       registeredOracles.push(oracleObject);
    }

    // persist oracles, by writing oracle objects to file.
    persistOracles(registeredOracles);
    
}

function generateRandomStatusCode(){
    let randomnumber = Math.floor(Math.random() * (STATUS_CODES.length - 0 + 1)) + 0;
    return STATUS_CODES[randomnumber];
}

function init(){
    // fetch oracles from memory
    fs.readFile('./oracleData.json',(err, data)=>{
       if(data){
           console.log('Hydrating oracles objects from storage ...')
           const retrievedOracles = JSON.parse(data);

           // Re-instantiating objects from Oracle class to recover back it's methods.
           console.log('Recreating objects!')
           for(const oracle of retrievedOracles){
               const oracleObject = new Oracle(oracle.account, oracle.indexes);
               registeredOracles.push(oracleObject);
            }

       }else{
           console.log('Registering oracles ...');
           registerOracles();
       }
   });
   
}



const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

exports.app = app;
exports.init = init;


