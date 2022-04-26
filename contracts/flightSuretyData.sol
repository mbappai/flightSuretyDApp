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
        uint256 seedFund;
        uint256 votes;
        string name;
        
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
    uint256 registeredAirlinesCount;


    address[] private _voters = new address[](0);
    uint constant MULTIPARTY_THRESHOLD = 4;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event HasPayedSeedFund(uint amount, string airlineName, address airlineAddress);
    event RegisteredNewAirline(address newAirline, string name);
 

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor ( address firstAirline) 
    {
        contractOwner = msg.sender;

        // Initialize first airline
        airlines[firstAirline].isRegistered = true;
        airlines[firstAirline].seedFund = 10 ether;
        airlines[firstAirline].name = 'Arik Airways';

        registeredAirlinesCount.add(1);
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

    function isAirline(address airline) public view  returns (bool){
        return airlines[airline].isRegistered;
    }


    /**
    * @dev Check if airline has paid seed fund
    *
    * @return A bool if seedFund amount is greater than initial value of 0
    */  
    function hasPaidSeedFund ( address airline) internal view returns (bool){
        return airlines[airline].seedFund > 0;
        
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


    function checkDuplicateVotes(address voter) internal view returns (bool){
        bool isDuplicate = false;
        for(uint c=0; c<_voters.length; c++) {
            if (_voters[c] == voter) {
                isDuplicate = true;
                return isDuplicate;
            }
        }
        return isDuplicate;
    }

    function voteForAirline(address newAirline, string memory _name) internal {


        // Increment votes field for airline about to be registered.
        airlines[newAirline].votes.add(1);

         // Get minimum voters for consensus (50% of registered airlines)
        uint minimumVotersRequired = registeredAirlinesCount.div(2);
        uint votesReceived = airlines[newAirline].votes;

        if ( votesReceived == minimumVotersRequired) {
            airlines[newAirline].isRegistered = true;
            airlines[newAirline].name = _name;

            registeredAirlinesCount.add(1);

            // Reset voters after successfully registering a new airline;
            _voters = new address[](0);   

            // Emit event when new airline is registered
            emit RegisteredNewAirline(newAirline, _name);   
        }

    }

    function airlineHasReachedConsensus(address airline) external view returns(bool) {
        uint256 numberOfRequiredVotes = registeredAirlinesCount.div(2); 
        return airlines[airline].votes >= numberOfRequiredVotes;
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
    function registerAirline ( address newAirline, string memory _name ) external  returns (bool success, uint256 votes)
    {

        // Confirm msg.sender (ariline) has paid seedFund before registering new airline
        require(hasPaidSeedFund(msg.sender),"Sorry can't register new airline because you haven't payed seed fund.");

        // Confirm msg.sender is not trying to register an airline more than once
        require(!isAirline(newAirline),"Airline trying to register already exist");


        // Use multiparty consensus if registered airlines reaches 4: 50% vote is required from registered user to approve registering new airline. 
        if(registeredAirlinesCount >= MULTIPARTY_THRESHOLD){
            
        // Check for duplicate vote by an airline (msg.sender).
        bool isDuplicate = checkDuplicateVotes(msg.sender);
        
        require(!isDuplicate, "Current voter can't cast more than 1 vote.");

        // Emit event to tell front-end the airline that recently voted


        // Atleast 50% of registered airlines should vote to register airline
        voteForAirline(newAirline, _name);

       
        }else{
        // Call registerAirline func from data-contract to register airline.
        airlines[newAirline].isRegistered = true;
        airlines[newAirline].name = _name;

        // Keep track of registered airlines by incrementing on each successful registration
        registeredAirlinesCount.add(1);

        emit RegisteredNewAirline(newAirline, _name);
        }


        return (success, 0);
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

        // Require that an airline needs to be registered before paying seed fund.
        require(airlines[msg.sender].isRegistered,"Please register before contributing to seed fund");

        // Require that an airline doesn't pay for seed funds more than once.
        require(airlines[msg.sender].seedFund == 0,"Thank you, but you can only pay once.");

        require(msg.value >= MINIMUM_SEED_FUND,"Please ensure to contribute a minimum of 10ether for the seed funding");

        // Transfer value to contract balance
        address(this).balance.add(msg.value);

        // Set amount paid by airline.
        airlines[msg.sender].seedFund = msg.value;

        // emit event for successful payment
        emit HasPayedSeedFund(msg.value,airlines[msg.sender].name,msg.sender);
    }

    function getFlightKey (
        address airline, 
        string memory flight,
        uint256 timestamp) pure internal returns(bytes32){

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

