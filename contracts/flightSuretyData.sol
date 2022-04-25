// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    // address private firstAirline;                                       // Account of first airline deployed with contract
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    
    struct airlineInfo{
        bool isRegistered;
        uint seedFund;
    }
    mapping (address => airlineInfo) airlines;

    // variable to store insurancePayouts address => uint256;


    // Insurance data for each passenger
    struct insuranceInfo{
        uint256 paidAmount;
        bytes32 flightNo;
        uint256 timestamp;
    }

    mapping (address => insuranceInfo) insuredPassengers;
    uint constant MINIMUM_SEED_FUND = 10 ether;
    mapping(address => bool) private authorizedContracts;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event PayedSeedFund(uint amount);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor ( address firstAirline) 
    {
        contractOwner = msg.sender;

        // Initialize first airline
        airlines[firstAirline].isRegistered = true;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    modifier requireIsAuthorizedCaller()
    {
        require(authorizedContracts[msg.sender], "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            external 
                            view 
                            returns(bool) 
    {
        return operational;
    }

    function isAirline(address airline) external view  returns (bool){
        return airlines[airline].isRegistered;
    }

    function hasPaidSeedFund ( address airline, uint amount) external view returns (bool){
        airlines[airline].seedFund = amount;
        return true;
    }
    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function authorizeContract (address contractAddress) external {
        authorizedContracts[contractAddress] = true;
    }

    function deauthorizeContract (address contractAddress) external requireContractOwner {
        delete authorizedContracts[contractAddress];
    }


    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    // Function writes to the state hence, remains in the data contract.
    function registerAirline (address airline) external requireIsAuthorizedCaller {
       airlines[airline].isRegistered = true;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    // F
    function buy ()
                            external
                            payable
    {
        // Passengers may pay up to 1 ether for purchasing flight insurance
        // MAX_FLIGHT_INSURANCE_PRICE = 1 ether;

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund () external payable {

        // Require that an airline doesn't pay for seed funds more than once.
        require(airlines[msg.sender].seedFund == 0,"Thank you, but you can only pay once.");

        require(msg.value >= MINIMUM_SEED_FUND,"Please ensure to contribute a minimum of 10ether for the seed funding");

        // Transfer value to contract balance
        address(this).balance.add(msg.value);

        // Set amount paid by airline.
        airlines[msg.sender].seedFund = msg.value;

        // emit event for successful payment
        emit PayedSeedFund(msg.value);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    fallback() external payable {
        // fund();
    }

    receive() external payable { 
        // custom function code
        // fund();
    }


}

