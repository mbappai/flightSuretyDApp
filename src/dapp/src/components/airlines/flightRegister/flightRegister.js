import React,{useState} from 'react'
import {Typography, List, Button} from 'antd'

import classes from './flightRegister.module.css'

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
                description={`${flight.airlineAddress.substring(0,7)}............${flight.airlineAddress.substring(8,13)}.......${flight.airlineAddress.substring(14,20)}`}
              />
          </List.Item>
        )}
      />

</div>
   )
}