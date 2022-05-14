import React from 'react'
import { Descriptions, Badge } from 'antd';

export default function OperationStatus(){
    return(
    <div className='section'>
        <Descriptions title='Operation Status'>

            <Descriptions.Item label="Operation Status" span={3}>
              <Badge status="processing" text="Active" />
            </Descriptions.Item>

        </Descriptions>
    </div>
    )
}