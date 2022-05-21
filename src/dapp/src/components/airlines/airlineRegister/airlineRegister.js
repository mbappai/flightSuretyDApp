import React,{useState} from 'react'
import { List,Typography, Badge} from 'antd'
import web3 from 'web3'

import classes from './airlineRegister.module.css'

const {Text,Title} = Typography;

export default function AirlineRegister ({airlines, flightSuretyApp, firstAirline, updateRegistrationStatus,updateFundedStatus}){
    
    return(
      <div>

      <Title level={4}>Airlines registration and funding</Title>
        <List
        className={classes.list}
        // loading={initLoading}
        itemLayout="horizontal"
        dataSource={airlines}
        renderItem={(airline,index) => (
          <List.Item
            id={index}

          >
            {/* <Skeleton avatar title={false} loading={item.loading} active> */}
              <List.Item.Meta
                title={<Badge status={airline.registered?'processing':'danger'} dot><Text>{airline.name}</Text> </Badge> }
                description={`${airline.address.substring(0,7)}............${airline.address.substring(8,13)}.......${airline.address.substring(14,20)}`}
              />
            {/* </Skeleton> */}
          </List.Item>
        )}
      />

  </div>
    )
}