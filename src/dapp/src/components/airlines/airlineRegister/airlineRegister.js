import React from 'react'
import { List,Typography, Badge} from 'antd'

import AddressChip from '../../addressChip/addressChip'


import classes from './airlineRegister.module.css'

const {Text,Title} = Typography;

export default function AirlineRegister ({airlines, isLoadingAirlines}){

    return(

      <div>

      <Title level={4}>Airlines registration and funding</Title>
        <List
        className={classes.list}
        loading={isLoadingAirlines}
        dataSource={airlines}
        renderItem={(airline,index) => (
          <List.Item
            key={index}
            extra = {<Badge status='success' text='Active'/>}
          >

              <List.Item.Meta
                title={<Text>{airline.name}</Text>}
                description={ <AddressChip address={airline.address}/> }
              />
          </List.Item>
        )}
      />

  </div>
    )
}