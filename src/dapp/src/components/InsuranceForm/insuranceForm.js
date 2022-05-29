import React,{useState} from 'react'
import classes from './form.module.css'
import dayjs from 'dayjs'
import web3 from 'web3'

import {Form, Select, Button, Typography } from 'antd';

const { Option } = Select;
const {Title} = Typography;



export default function InsuranceForm({flights, passengers, flightSuretyApp, btnAction}){


  const [selectedFlight, setSelectedFlight] = useState();
  const [selectedPassenger, setSelectedPassenger] =  useState();
  const [isBuying, setIsBuying] = useState(false);

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
    console.log(flightSuretyApp)
    const insuranceAmount = web3.utils.toWei('1','ether')
    const payload = {
      flight: selectedFlight.flight,
      passengerName: selectedPassenger.name,
      passengerAddress: selectedPassenger.address,
      timestamp: new Date(selectedFlight.timestamp),
      airlineAddress: selectedFlight.airlineAddress
    }
    // console.log(payload.timestamp.getTime())
    // call contract here
    setIsBuying(true)
    let result = await flightSuretyApp.methods.buyFlightInsurance(
      payload.flight,
      payload.passengerName,
      payload.passengerAddress,
      payload.timestamp.getTime(),
      payload.airlineAddress
    ).send({from:selectedPassenger.address, value: insuranceAmount, gas: 4712388, gasPrice: 100000000000})
      setIsBuying(false)
    console.log(result)
  }

return(

  <Form
      name="insurance"
      layout='vertical'
      // className="section"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >

<Title level={4}>Flight Insurance</Title>

<div className='section'>

  {/* Passengers selection */}
<Form.Item label='Passengers' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    placeholder={'Select a passenger'}
    size='large'
    // defaultValue={flights[0].flights}
    onChange={passengerHandler}
    optionLabelProp="label"
    
  >
    {passengers.map((passenger,index)=>{
      return(
        <Option key={index} value={`${passenger.name}`} label={passenger.name}>{passenger.name} — {`${passenger.address.substring(0,7)}............${passenger.address.substring(13,20)}`} </Option>
      )
    })}
    
  </Select>
  </Form.Item>

  {/* Flight selection */}
<Form.Item label='Flights' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    placeholder={'Select a flight'}
    size='large'
    // defaultValue={flights[0].flights}
    onChange={flightHandler}
    optionLabelProp="label"
    
  >
    {flights.map((flight,index)=>{
      return(
        <Option key={index} value={`${flight.flight}`} label={flight.flight}>{flight.flight} — {dayjs(flight.timestamp).format('DD/MM/YYYY')} </Option>
      )
    })}
    
  </Select>
  </Form.Item>

    <Form.Item>
        <Button shape='round' style={{ width: '100%' }} loading={isBuying} size='large' type="primary" htmlType="submit">
        Buy Insurance 1ETH
        </Button>
      </Form.Item>
  </div>

  </Form>

)
}
