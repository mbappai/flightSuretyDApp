import React,{useState} from 'react'
import classes from './form.module.css'
import dayjs from 'dayjs'

import {Form, Select, Button, Typography } from 'antd';

const { Option } = Select;
const {Title} = Typography;





export default function FlightForm({flights, title, btnLabel, btnAction}){

  const [selectedFlight, setSelectedFlight] = useState('')

  function handleChange(value) {
    console.log(`selected ${value}`);
    setSelectedFlight(value);
  }
  function onFinish(params) {
    // grab state and
    // call btnAction
  }
return(

  <Form
      name="insurance"
      layout='vertical'
      // className="section"
      initialValues={{ remember: true }}
      // onFinish={onFinish}
    >

<Title level={4}>{title}</Title>

<div className='section'>
<Form.Item label='Flights' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    // placeholder={flights[0].flights}
    // defaultValue={flights[0].flights}
    onChange={handleChange}
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