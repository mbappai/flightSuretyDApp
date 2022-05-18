import React from 'react'
import {Button, List} from 'antd'

import classes from './styles.module.css'

export default function Airlines ({airlines}){
    return(
        <List
        className={classes.list}
        // loading={initLoading}
        itemLayout="horizontal"
        dataSource={airlines}
        renderItem={airline => (
          <List.Item
            actions={[<Button type='primary'>Register Airline</Button>]}
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