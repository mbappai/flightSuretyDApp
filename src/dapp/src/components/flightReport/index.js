import React from 'react';
import {Typography, Button} from 'antd'
import classes from './styles.module.css'

const {Title, Paragraph} = Typography;

export default function FlightReport(){
    // take in flight status as input

    return(
        <div className={classes.section}>
            <Title level={5}>Flight has been delayed</Title>
            <Paragraph style={{textAlign:'center'}}>You are eligible to claim 1.5x the amount of insurance you paid for the flight</Paragraph>
            <Title style={{margin:'10px 0'}} level={2}>1.5 ETH</Title>
            <Button>Claim Insurance</Button>
        </div>
    )
}