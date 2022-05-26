import React from 'react'
import {Segmented, Switch, Typography} from 'antd';
import { useNavigate, useLocation } from "react-router-dom";
import {Badge} from 'antd'



import styles from './header.module.css'

const {Title, Text} = Typography

export default function Header({operationalStatus}){

  let navigate = useNavigate();
  let location = useLocation();

  const handleNavigation = (value)=>{
      const route = value.replace(/\s/g,'').toLowerCase();
      navigate(route)
  }

  // setup correct string to use as default value for the segemented tabs
  const defaultRoute = location.pathname === '/flightstatus' ? '/Flight status' : location.pathname;

  // if defaultRoute is flightstatus — Remove forward slash, captilize first word.
  const trimmed =   defaultRoute.replace(/[/]/g,'').charAt(0).toUpperCase() + defaultRoute.slice(2);


    return (
        <div className={styles.container}>
            <Title>Flyora</Title>
            <Segmented size='large' defaultValue={trimmed} onChange={(value)=>handleNavigation(value)} options={['Airlines','Insurance','Flight status']}/>
            <div className={styles.control}>
                <Badge status={operationalStatus?'processing':'error'} text={'Operational Status'}/>
            </div>
        </div>
    )
}