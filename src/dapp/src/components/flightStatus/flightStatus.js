import React,{useState,useEffect} from 'react'
import classes from './styles.module.css'
import dayjs from 'dayjs'
import Web3 from 'web3'


import {Form, Select, Button, Typography, notification } from 'antd';
import FlightReport from '../flightReport/index'

const { Option } = Select;
const {Title} = Typography;



export default function FlightStatus({
  flights,
   passengers, 
   flightSuretyApp, 
   firstAirline
   }){

  const [selectedFlight, setSelectedFlight] = useState();
  const [selectedPassenger, setSelectedPassenger] =  useState();
  const [isFetching, setIsFetching] = useState(false);
  const [isClaimingInsurance, setIsClaimingInsurance] = useState(false);
  const [insuranceClaimed, setInsuranceClaimed] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);



  function flightHandler(value) {
    const target = flights.find(flight => flight.flight == value);
    console.log(target);
    setSelectedFlight(target);
  }
  function passengerHandler(value){
    const target = passengers.find(passenger => passenger.name == value);
    console.log(target);
    setSelectedPassenger(target);  
  }

  async function onFinish() {

    const payload = {
      flight: selectedFlight.flight,
      timestamp: new Date(selectedFlight.timestamp),
      airlineAddress: selectedFlight.airlineAddress
    }

    try {   
      // call contract here
      setIsFetching(true);
      let result = await flightSuretyApp.methods.fetchFlightStatus(
        payload.airlineAddress,
        payload.flight,
        payload.timestamp.getTime()
      ).send({from:selectedPassenger.address});

      // fetch flight status code.
      let statusCode =  await flightSuretyApp.methods.getFlightStatus(
        payload.airlineAddress,
        payload.flight,
        payload.timestamp.getTime()
      ).call({from:selectedPassenger.address})

      // get passengers current credit score
      let passengerCredit = await flightSuretyApp.methods.getPassengerCredit(selectedPassenger.address).call()
      console.log('passengerCredit:', Web3.utils.fromWei(passengerCredit, 'ether'));
      setCreditBalance(Web3.utils.fromWei(passengerCredit, 'ether'));
      setShowReport(true);
      setIsFetching(false);
      console.log(result)
      console.log(statusCode);

    } catch (error) {
      console.log(error)
      setIsFetching(false)
    }
  }

  async function claimInsuranceHandler(){
    console.log(firstAirline)
    try{
      setIsClaimingInsurance(true);
      const result = await flightSuretyApp.methods.withdrawCredit(selectedPassenger.address).send({from: firstAirline, gas: 4712388});
      console.log(result)
      setInsuranceClaimed(true);
      setIsClaimingInsurance(false);
    }catch(err){
      console.log('Error claiming insurance',err)
      setIsClaimingInsurance(false);
    }
  }



return(
<>
  <Form
      name="insurance"
      layout='vertical'
      read
      // className="section"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      >

<Title level={4}>Flight Status</Title>

<div className='section'>

  {/* Passengers selection */}
<Form.Item label='Passengers' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    placeholder={'Select a passenger'}
    size='large'
    onChange={passengerHandler}
    optionLabelProp="label"
    
    >
      {passengers.map((passenger,index)=>{
        return(
          <Option id={index} value={`${passenger.name}`} label={passenger.name}>{passenger.name} — {`${passenger.address.substring(0,7)}............${passenger.address.substring(13,20)}`} </Option>
          )
        })}
    
  </Select>
  </Form.Item>

  {/* Flight selection */}
<Form.Item label='Flights' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    placeholder={'Select a flight'}
    size ={'large'}
    onChange={flightHandler}
    optionLabelProp="label"
    
    >
    {flights.map((flight,index)=>{
      return(
        <Option id={index} value={`${flight.flight}`} label={flight.flight}>{flight.flight} — {dayjs(flight.timestamp).format('DD/MM/YYYY')} </Option>
        )
      })}
    
  </Select>
  </Form.Item>

    <Form.Item>
        <Button style={{ width: '100%' }} disabled={showReport} loading={isFetching} size='large' type="primary" htmlType="submit">
        Check Flight Status
        </Button>
      </Form.Item>
  </div>

  </Form>
  
 {showReport&&<FlightReport
  creditBalance = {creditBalance}
  claimInsurance = {claimInsuranceHandler}
  isClaimingInsurance = {isClaimingInsurance}
  insuranceClaimed = {insuranceClaimed}
  />}
  </>

)
}
