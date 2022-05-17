import React,{useEffect,useState} from "react";
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";
import drizzleOptions from "./drizzleOptions";
// import MyComponent from "./MyComponent";
import Web3 from 'web3';
import "./App.css";


// components
import {Typography,notification,message} from 'antd';
import FlightForm from "./components/flightForm/flightForm.js";
import OperationStatus from "./components/operationStatus/index";
import FlightReport from './components/flightReport/index'

// config
import Config from './config.json'
import FlightSuretyApp from './contracts/FlightSuretyApp'
import FlightSuretyData from './contracts/FlightSuretyData'
import data from './data.json'

const { Title } = Typography;


const drizzle = new Drizzle(drizzleOptions);



const App = () => {

  let flightSuretyApp;
  let flightSuretyData;

  const [passengers, setPassengers] = useState([])
  const [airlines, setAirlines] = useState([])
  const [flights, setFlights] = useState([])

  const [operationStatus, setOperationStatus] = useState(false);

  const setupPassengers = (accounts) =>{
    
    let passengerData = [];
    for(let i=0; i<accounts.length; i++){
      passengerData.push({
        name:data['passengers'][i],
        address:accounts[i]
      })
    }
    setPassengers(passengerData);
  }

  const setupAirlines = (accounts) =>{
    
    setAirlines(accounts);
  }

  const setupFlights = (accounts) =>{

    let flightsData = [];
    for(let i=0; i<accounts.length; i++){
      
     let flight = data['flights'][i].flight;
     let timestamp = data['flights'][i].timestamp;
      
      flightsData.push({
        flight:flight,
        timestamp:timestamp,
        // airline:  add later if there is need to.
      });

    }
    setFlights(flightsData);
  }

  const connectToContract = async()=>{
    const config = Config['localhost'];
    const web3 = new Web3(new Web3.providers.HttpProvider(config.url));

    // connect to data and app contract
    flightSuretyApp =  new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
    flightSuretyData =  new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

    // fetch all accounts created by ganache
    const accounts = await web3.eth.getAccounts(); 
    
    const airlineAccounts = accounts.slice(0,4);
    const passengerAccounts = accounts.slice(11,17);
    const flightAccounts = accounts.slice(0,3);

    setupAirlines(airlineAccounts);
    setupPassengers(passengerAccounts);
    setupFlights(flightAccounts);

  }

  // register contract here
  // fetch account from ganache
  const connectWalletHandler = async()=>{
    const {ethereum} = window;
    if(!ethereum){
      notification['warning']({
        message:'Install metamask',
        description:'Please make sure you have metamask installed before you continue'
      })
    }

    try{
      const accounts = await ethereum.request({method:'eth_requestAccounts'});
      message.success('Account connected');
    } catch(err){

    }
    
  }

  useEffect(() => {
    console.log('Initializing contract ...')
    connectToContract()
    return () => {
    };
  }, [])
  

  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {drizzleContext => {
          // const { drizzle, drizzleState, initialized } = drizzleContext;

          // if (!initialized) {
          //   return "Loading..."
          // }

          return (
            // <MyComponent drizzle={drizzle} drizzleState={drizzleState} />
            <div className="layout">
              <Title>Flyora</Title>
              <OperationStatus/>

              <FlightForm
               title={'Insurance'}
               flights={flights}
               btnLabel={'Buy Insurance'}
               />

              <FlightForm
                title={'FlightStatus'}
                flights={flights}
                btnLabel={'Check Flight Status'}
               />
              <FlightReport/>
            </div>
          )
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
