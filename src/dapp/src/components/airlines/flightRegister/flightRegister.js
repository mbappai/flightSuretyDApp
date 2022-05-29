import React,{useState} from 'react'
import {Typography, List, Button} from 'antd'

import classes from './flightRegister.module.css'
import AddressChip from '../../addressChip/addressChip';

const {Text,Title} = Typography;


export default function FlightRegister({flights}){
    
    
 return(
<div>

<Title level={4}>Registered Flights</Title>
        <List
        className={classes.list}
        // loading={initLoading}
        itemLayout="horizontal"
        dataSource={flights}
        renderItem={(flight,index) => (
          <List.Item
            id={index}

          >
              <List.Item.Meta
                title={<Text>{flight.flight}</Text>}
                description={
                 <div>
                  <Text type='secondary'>Arik Airlines </Text>
                  <AddressChip address={flight.airlineAddress}/>
                  </div>
                  }
              />
          </List.Item>
        )}
      />

</div>
   )
}