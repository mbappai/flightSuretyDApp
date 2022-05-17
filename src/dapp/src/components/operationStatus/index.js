import React from 'react'
import { Descriptions, Badge } from 'antd';

export default function OperationStatus({status}){
    return(
    <div className='section'>
        <Descriptions title='Operation Status'>

            <Descriptions.Item label="Operation Status" span={3}>
            <Badge status={`${status?'success':'error'}`} text={`${status?"Active":"Inactive"}`} />
            </Descriptions.Item>

        </Descriptions>
    </div>
    )
}