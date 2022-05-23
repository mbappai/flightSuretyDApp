import React,{useEffect,useState} from "react";
import Web3 from 'web3';
import "./App.css";


// components
import {Typography,notification,message} from 'antd';
import FlightForm from "./components/flightForm/flightForm.js";
import OperationStatus from "./components/operationStatus/index";
import FlightReport from './components/flightReport/index'
import Airlines from './components/airlines/index'
import Header from './components/header/header'

// config
import Config from './config.json'
import FlightSuretyApp from './contracts/FlightSuretyApp'
import FlightSuretyData from './contracts/FlightSuretyData'
import data from './data.json'
import { register, unregister } from "./serviceWorker";
import SkeletonAvatar from "antd/lib/skeleton/Avatar";

const { Title } = Typography;

  let flightSuretyApp;
  let flightSuretyData;
  
  const App = () => {
    

  // const [flightSuretyApp, setFlightSuretyApp] = useState({});
  const [passengers, setPassengers] = useState([])
  const [airlines, setAirlines] = useState([])
  const [flights, setFlights] = useState([])
  const [owner, setOwner] = useState('')
  const [firstAirline, setFirstAirline] = useState();

  const [operationalStatus, setOperationalStatus] = useState(false);

  const setupPassengers = (accounts) =>{
    
    let passengerData = [];
    const passengerNames = data['passengers'];
    for(let i=0; i<accounts.length; i++){
      passengerData.push({
        name:passengerNames[i],
        address:accounts[i]
      })
    }
    setPassengers(passengerData);
  }

  const setupAirlines = async(accounts) =>{

    const localData = JSON.parse(localStorage.getItem('registered'));
    if(localData){
      console.log('post-storage:',localData)
      setAirlines(localData)
      return;
    }

    const airlineNames = data['airlines'];
    const firstAirlineAddress = accounts[0];
    let inactiveAirlines=[];
    let registeredAirlines = [];
    
    for(let i = 0; i <= airlineNames.length-1; i++){
      inactiveAirlines.push({
        // set the first airline to be registered and funded
        address: accounts[i+1], // account[0] is the first airline, hence no need to re-register
        name: airlineNames[i],
      }) 
    }

    for(let airline of inactiveAirlines){
      
      const response = await flightSuretyApp.methods.registerAirline(airline.address, airline.name).send({from:firstAirlineAddress, gas: 4712388, gasPrice: 100000000})
      // const paid = await flightSuretyApp.methods.fundAirline().send({from:airline, value: Web3.utils.toWei('10', 'ether')});

      registeredAirlines.push({address: airline.address, name: airline.name})

      console.log('registered',response)
      // console.log('funded',paid)
    }
   
    console.log('pre-storage:',registeredAirlines)
    localStorage.setItem('registered',JSON.stringify(registeredAirlines));
    setAirlines(registeredAirlines);
  }

  const fundAirline = async(airline) => {

    let fee = Web3.utils.toWei("10", "ether");

    let alreadyFunded = await flightSuretyApp.methods.isAirlineFunded(airline).call();
    console.log(alreadyFunded)
    if (alreadyFunded === false) {
        flightSuretyApp.methods
        .fundAirline()
        .send({ from: airline, value: fee }, 
            (error, result) => {
                if (error){
                    console.log(error)
                    return false;
                  }
                else {
                  console.log(result);
                  return true;
                }
            });
    }
}


  const setupFlights = async(accounts,firstAirline) =>{

    // set state from local if it exist, then return
    const localFlights = JSON.parse(localStorage.getItem('flights'));
    if(localFlights){
      console.log('post-storage',localFlights)
      setFlights(localFlights)
      return
    }

    const unRegisteredFlights = [];
    const registeredFlights = [];
    
    const flights = data['flights'];

    // setup flights array
    for(let i=0; i<flights.length; i++){
      
      unRegisteredFlights.push({
        flight:flights[i].flight,
        timestamp:new Date(flights[i].timestamp).getTime(),
        airlineAddress:  accounts[i]
      });
    }

    // register flights in contract
    for(let flight of unRegisteredFlights){
      console.log(flight)
      try{
        const result = await flightSuretyApp.methods.registerFlight(flight.timestamp,flight.flight).send({from:firstAirline, gas: 4712388, gasPrice: 100000000000 });
        registeredFlights.push({flight:flight.flight, timestamp: flight.timestamp, airlineAddress: firstAirline})
        console.log('registered flight', registeredFlights);
        console.log(result);
      }catch(err){
        console.log(err)
        return;
      }
    }

    console.log('pre-storage',registeredFlights)
    localStorage.setItem('flights', JSON.stringify(registeredFlights))
    setFlights(registeredFlights);
  }

  const setupOwner = (account) =>{
    setOwner(account);
  }

  const setupFirstAirline = (address) =>{
    setFirstAirline(address);
  }

  const fetchOperationalStatus = async()=>{
    let operationalStatus = await flightSuretyApp.methods.isOperational().call({gas: 4712388, gasPrice: 100000000});
    setOperationalStatus(operationalStatus);
   }


  const connectToContract = async()=>{

    // start context here

    // connect to ganache blockchain
    const config = Config['localhost'];
    const web3 = new Web3(new Web3.providers.HttpProvider(config.url));

    // data and app contract instances.
    flightSuretyApp =  new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
    flightSuretyData =  new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

    // end context here
    
    // fetch all accounts created by ganache
    const accounts = await web3.eth.getAccounts(); 
    
    const firstAirline = accounts[0];


    const airlineAccounts = accounts.slice(0,4);
    const passengerAccounts = accounts.slice(11,17);
    const flightAccounts = accounts.slice(0,4);

    // Both the owner and the first airline uses the same address
    // which is the first account generated by ganache
    setupFirstAirline(firstAirline);
    setupOwner(firstAirline);

    // only required during airline registration.
    // setupAirlines(airlineAccounts);

    setupPassengers(passengerAccounts);
    setupFlights(flightAccounts, firstAirline);

  }



  useEffect(() => {
    console.log('Initializing contract ...')
    connectToContract()
    fetchOperationalStatus()
    return () => {
    };
  }, [])
  

        return (
          <div className="app">
            <div className="layout">

              <Header/>
              <OperationStatus
                status = {operationalStatus}
                />

              <FlightForm
               title={'Insurance'}
               flights={flights}
               passengers = {passengers}
               btnLabel={'Buy Insurance 1ETH'}
               flightSuretyApp = {flightSuretyApp}
               />

              <FlightForm
                title={'FlightStatus'}
                flights={flights}
                passengers = {passengers}
                flightSuretyApp = {flightSuretyApp}
                btnLabel={'Check Flight Status'}
                />
              {/* <FlightReport/> */}
              <Airlines
               airlines={airlines}
               flights = {flights}
               />
            </div>
          </div>
          )
          }


export default App;
