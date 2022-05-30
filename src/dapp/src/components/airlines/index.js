import React,{useState} from 'react'

import AirlineRegister from './airlineRegister/airlineRegister'
import FlightRegister from './flightRegister/flightRegister'

import { Skeleton } from 'antd'



export default function Airlines ({airlines, flights, flightSuretyApp, firstAirline, isLoadingAirlines, isLoadingFlights}){
    

    return(
      <div>
        <AirlineRegister
        airlines ={airlines}
        flightSuretyApp = {flightSuretyApp}
        isLoadingAirlines = {isLoadingAirlines}
        firstAirline = {firstAirline}
        />


        <FlightRegister
          flights = {flights}
          isLoadingFlights = {isLoadingFlights}
        />   
      </div>
    )
}