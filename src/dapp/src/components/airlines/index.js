import React,{useState} from 'react'

import AirlineRegister from './airlineRegister/airlineRegister'
import FlightRegister from './flightRegister/flightRegister'



export default function Airlines ({airlines, flights}){
    

    return(
      <div>
        <AirlineRegister
        airlines ={airlines}
        />

        <FlightRegister
          flights = {flights}
        />   
      </div>
    )
}