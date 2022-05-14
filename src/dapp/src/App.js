import React from "react";
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";
import drizzleOptions from "./drizzleOptions";
// import MyComponent from "./MyComponent";
import "./App.css";
import {Typography} from 'antd';
import InsuranceForm from './components/insuranceForm/insuranceForm.js'
import FlightStatus from "./components/flightForms/flightStatus";
import OperationStatus from "./components/operationStatus/index";
import FlightReport from './components/flightReport/index'

const { Title } = Typography;

const drizzle = new Drizzle(drizzleOptions);

const App = () => {
  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {drizzleContext => {
          // const { drizzle, drizzleState, initialized } = drizzleContext;

          // if (!initialized) {
          //   return "Loading..."
          // }

          return (
            // <MyComponent drizzle={drizzle} drizzleState={drizzleState} />
            <div className="layout">
              <Title>Flyora</Title>
              <OperationStatus/>
              <InsuranceForm/>
              <FlightStatus/>
              <FlightReport/>
            </div>
          )
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
