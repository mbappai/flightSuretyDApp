# FlightSurety

FlightSurety is a flight delay insurance for passengers. Passengers will have to purchase an insurance prior to thier flight.

## Goal

The goal of this Dapp is to check the flight status of your ticket to determine whether or not you are eligible to receive the insurance money incase of any delay caused by the airline your booked with.  

The eligibility of the insurance payout is determined by the following possibilities that could cause a flight delay.  

- If your trip gets cancelled due to a *technicality* ------ You get payed!
- If your trip gets cancelled due to *weather conditions* ------- You get payed!
- If your trip gets cancelled due to *lateness of the airline* ------- You get payed!
- If your trip gets cancelled due to * an unknown reason* ------- You get payed!  

If a flight gets delayed due to any of the afforementioned possibilities, then the passengers gets paid `1.5X` the amount they paid for the insurance.  

## Components of the architecture

There are two main parts to the application.

1. **On-chain**: This involves the smart contracts which contains the logic of the flight insurance. The contract can further be sub-divided into two parts.  

  - *Data Contract*: Which holds the state of the contract on the blockchain.
  - *App Contract*: Which holds the business logic of our application.  

This allows for flexibility incase we decided to change our business logic without interfering with the data contract.

2. **Off-chain**: This involves the client side which the passenger will use for purchasing the insurance as well as checking the flight status of their flight.
  - *Server App*: Which represents the oracles will feed data to the smart-contract and oracle code.

## How to check flight status of air tickets in a smart contract?

> One thing to keep in mind is that, by defaut, smart contracts are only able to access data that is stored on the blockchain (on-chain data). To access data that resides outside the blockchain (off-chain data) requires that help of an oracle.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)