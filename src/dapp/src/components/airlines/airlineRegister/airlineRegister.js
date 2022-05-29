import React,{useState} from 'react'
import { List,Typography,Button} from 'antd'
import web3 from 'web3'

import AddressChip from '../../addressChip/addressChip'


import classes from './airlineRegister.module.css'

const {Text,Title} = Typography;

export default function AirlineRegister ({airlines, flightSuretyApp, firstAirline}){

  const [isFunding, setIsFunding] = useState(false);
  const [isFunded, setIsFunded] = useState(false);
    
async function fundAirline (targetIndex){
  const targetAirline = airlines.find((airline,index)=> targetIndex === index)
  const fee = web3.utils.toWei('10', 'ether');
  try{
    setIsFunding(true)

    let result  = await flightSuretyApp.methods.fundAirline().send({from:targetAirline.address, value: fee});
    setIsFunding(false)
    console.log(result)
  }catch(err){
    setIsFunding(false)
    console.log(err)
  }

  }


    return(

      <div>

      <Title level={4}>Airlines registration and funding</Title>
        <List
        className={classes.list}
        // loading={initLoading}
        // itemLayout="vertical"
        dataSource={airlines}
        renderItem={(airline,index) => (
          <List.Item
            key={index}
            extra = {<Button onClick={()=>fundAirline(index)} loading={isFunding} shape='round' type='primary'> Fund Airline </Button>}
          >
            {/* <Skeleton avatar title={false} loading={item.loading} active> */}
              <List.Item.Meta
                title={<Text>{airline.name}</Text>}
                description={ <AddressChip address={airline.address}/> }
              />
            {/* </Skeleton> */}
          </List.Item>
        )}
      />

  </div>
    )
}