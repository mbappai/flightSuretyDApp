import React,{useEffect} from 'react'
import {Segmented, Switch, Typography} from 'antd';
import { useNavigate, useLocation } from "react-router-dom";



import styles from './header.module.css'

const {Title, Text} = Typography

export default function Header(){

  let navigate = useNavigate();
  let location = useLocation();

  console.log(location.pathname.replace(/[/]/,""))

  const handleNavigation = (value)=>{
      const route = value.replace(/\s/g,'').toLowerCase();
      console.log(route)
      navigate(route)
  }

  const defaultRoute = location.pathname === '/flightstatus' ? '/Flight status' : location.pathname;
const trimmed =   defaultRoute.replace(/[/]/g,'').charAt(0).toUpperCase() + defaultRoute.slice(2);


    return (
        <div className={styles.container}>
            <Title>Flyora</Title>
            <Segmented size='large' defaultValue={trimmed} onChange={(value)=>handleNavigation(value)} options={['Airlines','Insurance','Flight status']}/>
            <div className={styles.control}>
                <Text style={{marginRight:'5px'}}>Operation control</Text>
            <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
            </div>
        </div>
    )
}