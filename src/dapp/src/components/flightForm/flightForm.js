import React,{useState} from 'react'
import classes from './form.module.css'
import dayjs from 'dayjs'
import web3 from 'web3'

import {Form, Select, Button, Typography } from 'antd';

const { Option } = Select;
const {Title} = Typography;



export default function FlightForm({flights, passengers, title, btnLabel, flightSuretyApp, btnAction}){


  const [selectedFlight, setSelectedFlight] = useState();
  const [selectedPassenger, setSelectedPassenger] =  useState();

  function flightHandler(value) {
    const target = flights.find(flight => flight.flight == value);
    console.log(target);
    setSelectedFlight(target);
  }
  function passengerHandler(value){
    const target = passengers.find(passenger => passenger.name == value);
    console.log(target)
    setSelectedPassenger(target)
    
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
    let result = await flightSuretyApp.methods.buyFlightInsurance(
      payload.flight,
      payload.passengerName,
      payload.passengerAddress,
      payload.timestamp.getTime(),
      payload.airlineAddress
    ).send({from:selectedPassenger.address, value: insuranceAmount})

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

<Title level={4}>{title}</Title>

<div className='section'>

  {/* Passengers selection */}
<Form.Item label='Passengers' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    placeholder={'Select a passenger'}
    // defaultValue={flights[0].flights}
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
    // defaultValue={flights[0].flights}
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
        <Button style={{ width: '100%' }} type="primary" htmlType="submit">
          {btnLabel}
        </Button>
      </Form.Item>
  </div>

  </Form>

)
}

// const flights =['KN20321 (Arik airlines)','KR78392 (Virgin airlines)','MH56473 (Max airlines)','AV3284 (Aero airlines)']