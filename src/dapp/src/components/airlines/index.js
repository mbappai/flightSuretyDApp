import React from 'react'
import {Button, List} from 'antd'

import classes from './styles.module.css'

export default function Airlines ({airlines, flightSuretyApp, owner, firstAirline}){
    
    console.log('firstAirline', firstAirline);

    const registerAirline = async(index)=>{
        const targetAirline = airlines[index];
        // console.log(firstAirline)
        // register airline here
       const response = await flightSuretyApp.methods.registerAirline(targetAirline.address, targetAirline.name).send({from:firstAirline, gas: 4712388, gasPrice: 100000000000});
       console.log(response)
    }
    return(
        <List
        className={classes.list}
        // loading={initLoading}
        itemLayout="horizontal"
        dataSource={airlines}
        renderItem={(airline,index) => (
          <List.Item
            id={index}
            actions={[<Button onClick={()=>registerAirline(index)} type='primary'>Register Airline</Button>]}
          >
            {/* <Skeleton avatar title={false} loading={item.loading} active> */}
              <List.Item.Meta
                title={<a href="https://ant.design">{airline.name}</a>}
                description={`${airline.address.substring(0,7)}............${airline.address.substring(8,13)}.......${airline.address.substring(14,20)}`}
              />
            {/* </Skeleton> */}
          </List.Item>
        )}
      />

    )
}