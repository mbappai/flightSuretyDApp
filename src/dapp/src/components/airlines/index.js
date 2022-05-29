import React,{useState} from 'react'

import AirlineRegister from './airlineRegister/airlineRegister'
import FlightRegister from './flightRegister/flightRegister'



export default function Airlines ({airlines, flights, flightSuretyApp, firstAirline}){
    

    return(
      <div>
        <AirlineRegister
        airlines ={airlines}
        flightSuretyApp = {flightSuretyApp}
        firstAirline = {firstAirline}
        />

        <FlightRegister
          flights = {flights}
          // flightSuretyApp = {flightSuretyApp}
          // firstAirline = {firstAirline}
        />   
      </div>
    )
}