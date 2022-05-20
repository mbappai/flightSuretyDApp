import React from 'react'
import {Segmented, Switch, Typography} from 'antd';

import styles from './header.module.css'

const {Title, Text} = Typography

export default function Header(){
    return (
        <div className={styles.container}>
            <Title>Flyora</Title>
            <Segmented size='large' options={['Airlines','Insurance','Flight status']}/>
            <div className={styles.control}>
                <Text style={{marginRight:'5px'}}>Operation control</Text>
            <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
            </div>
        </div>
    )
}