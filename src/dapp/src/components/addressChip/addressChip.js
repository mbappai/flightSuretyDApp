import React from 'react'
import {Typography} from 'antd'

import styles from './styles.module.css'

const {Text} = Typography;


export default function AddressChip({address, size}){

    return(
        <Text className={styles.address}>{`${address.substring(0,7)}............${address.substring(8,20)}.......${address.substring(21)}`}</Text>
    )
}