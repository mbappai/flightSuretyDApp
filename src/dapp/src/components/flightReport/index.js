import React from 'react';
import {Typography, Button} from 'antd'
import classes from './styles.module.css'

const {Title, Paragraph, Text} = Typography;

export default function FlightReport({creditBalance, claimInsurance, isClaimingInsurance, insuranceClaimed}){
    // take in flight status as input
    let result;

    if(creditBalance == 0){
        result = <>
            <Title level={5}>Your flight is on time!</Title>
            <Paragraph style={{textAlign:'center'}}>You are not eligible for any insurance</Paragraph>
            <Title style={{margin:'10px 0'}} level={2}>{`${creditBalance} ETH`}</Title>
        </>
    }else{
        result = <>
        <Title level={5}>Flight has been delayed</Title>
            <Paragraph style={{textAlign:'center'}}>You are eligible to claim 1.5x the amount of insurance you paid for the flight</Paragraph>
            <Title style={{margin:'10px 0'}} level={2}>{`${creditBalance} ETH`}</Title>
            <Button loading={isClaimingInsurance} type='primary' onClick={claimInsurance} size='large'>Claim It!</Button>
        </>
    }

    return(
        <div className={classes.section}>
            { insuranceClaimed? <Title level={3}>Insurance Claimed!</Title> : result}
        </div>
    )
}