import React from 'react'
import classes from './form.module.css'

import {Form, Select, Button, Typography } from 'antd';

const { Option } = Select;
const {Title} = Typography;

function handleChange(value) {
  console.log(`selected ${value}`);
}



export default function InsuranceForm(){
return(

  <Form
      name="insurance"
      layout='vertical'
      // className="section"
      initialValues={{ remember: true }}
      // onFinish={onFinish}
    >

<Title level={4}>Insurance</Title>

<div className='section'>
<Form.Item label='Flights' labelAlign='vertical'>
<Select
    style={{ width: '100%' }}
    placeholder="Select flight"
    defaultValue={flights[0]}
    onChange={handleChange}
    optionLabelProp="label"
    
  >
    {flights.map((flight,index)=>{
      return(
        <Option id={index} value={flight} label={flight}>{flight}</Option>
      )
    })}
    
  </Select>
  </Form.Item>

    <Form.Item>
        <Button style={{ width: '100%' }} type="primary" htmlType="submit">
          Buy Insurance
        </Button>
      </Form.Item>
  </div>

  </Form>

)
}

const flights =['KN20321 (Arik airlines)','KR78392 (Virgin airlines)','MH56473 (Max airlines)','AV3284 (Aero airlines)']