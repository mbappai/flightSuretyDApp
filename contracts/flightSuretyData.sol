// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    // TODO: prefix all storage variables with s_
    // TODO: replace require statements with revert statement
    // TODO: create custom error messages
    // TODO: reduce reading frequency from global variables
    // TODO: make variables constant wherever possible.
    // TODO: capitalize struct names


    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    // address private firstAirline;                                       // Account of first airline deployed with contract
    address private immutable i_contractOwner;                                      // Account used to deploy contract
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
    struct Passenger{
        bool isInsured;
        string name;
        string flight;
        uint256 credit;
        uint256 insuranceAmount;
        bytes32 flightKey;
    }

    // Track Insured Flights
    struct FlightInsurance {
        bool isInsured;
        address passenger;   // Passenger that insured flight
        uint256 insuranceAmount;  // Amount paid by passenger to insure flight
        bytes32 flightKey;   // Key of the flight that got insured.
    }


    mapping (address => Passenger) private s_passengers;
    mapping (bytes32 => FlightInsurance) private s_flightInsurances;

    uint public constant MINIMUM_SEED_FUND = 10 ether;
    uint public constant MIN_FLIGHT_INSURANCE_PRICE = 1 ether;
    mapping(address => bool) private authorizedContracts;
    uint256 public registeredAirlinesCount;


    address[] private _voters = new address[](0);
    uint constant MULTIPARTY_THRESHOLD = 4;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event HasPayedSeedFund(uint amount, string airlineName, address airlineAddress);
    event RegisteredNewAirline(address newAirline, string name);
    event CastVote(address voterAddress, string voterName, address voteeAddress, string voteeName );
 

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor ( address firstAirline) 
    {
        i_contractOwner = msg.sender;

        // Initialize first airline
        airlines[firstAirline].isRegistered = true;
        airlines[firstAirline].seedFund = 0; // Don't fund in order to make test pass
        airlines[firstAirline].name = 'Arik Airways';

        registeredAirlinesCount++;
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
        require(msg.sender == i_contractOwner, "Caller is not contract owner");
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
    function hasPaidSeedFund ( address airline) public view returns (bool){
        return airlines[airline].seedFund >= MINIMUM_SEED_FUND; 
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

    function voteForAirline(address newAirline, string memory _name, address voter) internal {


        // Increment votes field for airline about to be registered.
        airlines[newAirline].votes = airlines[newAirline].votes.add(1);

         // Get minimum voters for consensus (50% of registered airlines)
        uint minimumVotersRequired = registeredAirlinesCount.div(2);
        uint votesReceived = airlines[newAirline].votes;

        if ( votesReceived == minimumVotersRequired) {
            airlines[newAirline].isRegistered = true;
            airlines[newAirline].name = _name;

            registeredAirlinesCount++;

            // Reset voters after successfully registering a new airline;
            _voters = new address[](0);   

            // Emit event when new airline is registered
            emit RegisteredNewAirline(newAirline, _name);   
        }

        // Emit event after every vote showing which airline voted.
        emit CastVote(voter,airlines[voter].name,newAirline, _name);

    }

    function airlineHasReachedConsensus(address airline) external view returns(bool) {
        uint256 numberOfRequiredVotes = registeredAirlinesCount.div(2); 
        return airlines[airline].votes >= numberOfRequiredVotes;
    }


    function isAirlineActive(address airline) external view returns (bool){
        bool state;

        bool isRegistered = airlines[airline].isRegistered;
        bool isFunded = airlines[airline].seedFund >= MINIMUM_SEED_FUND;

        state = isRegistered && isFunded;

        return state;
    }

    function getFlightKey (
         address airline, 
        string memory flight, 
        uint256 timestamp
        ) pure internal returns(bytes32) {
             return keccak256(abi.encodePacked(airline, flight, timestamp));
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
    function registerAirline ( address newAirline, string memory _name ) external  returns (bool success, uint256 votes) {

        // Confirm msg.sender is not trying to register an airline more than once
        require(!isAirline(newAirline), "AIRLINE ALREADY EXIST: Please register a new airline");


        // Use multiparty consensus if registered airlines reaches 4: 50% vote is required from registered user to approve registering new airline. 
        if(registeredAirlinesCount >= MULTIPARTY_THRESHOLD){
            
        // Check for duplicate vote by an airline (msg.sender).
        bool isDuplicate = checkDuplicateVotes(msg.sender);
        
        require(!isDuplicate, "DOUBLE VOTING: Voter is only allowed to cast 1 vote.");

        // Emit event to tell front-end the airline that recently voted


        // Atleast 50% of registered airlines should vote to register airline
        voteForAirline(newAirline, _name,msg.sender);

       
        }else{
        
        // Register airline
        airlines[newAirline].isRegistered = true;
        airlines[newAirline].name = _name;
        airlines[newAirline].votes = airlines[newAirline].votes.add(1);

        // Keep track of registered airlines by incrementing on each successful registration
        registeredAirlinesCount++;

        emit RegisteredNewAirline(newAirline, _name);
        }


        return (success, 0);
    }



   /**
    * @dev Buy insurance for a flight
    *
    */   
    // F
    function buy ( string memory _flight, string memory passengerName, address passengerAddress ) external requireIsOperational payable {

        // Passenger cannot buy insurance for the same flight more than once.
        require(!s_passengers[passengerAddress].isInsured, 'FLIGHT ALREADY INSURED');


        // Passengers may pay up to 1 ether for purchasing flight insurance
        require(msg.value >= MIN_FLIGHT_INSURANCE_PRICE,"INSUFFICIENT AMOUNT: Minimum price for flight insurance is 1 ether");

        // Transfer payment to DAO
        payable(address(this)).transfer(msg.value);


        // Track passenger
        s_passengers[passengerAddress].flight = _flight;
        s_passengers[passengerAddress].insuranceAmount = msg.value;
        s_passengers[passengerAddress].isInsured = true;
        s_passengers[passengerAddress].name = passengerName;

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees ( ) external pure{
        // If flight is delayed then passenger gets funded
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
        This function transfers the funds accumulated for the passenger
     *
    */
    function pay( ) external pure {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund () external payable {

        // Require that an airline needs to be registered before paying seed fund.
        require(airlines[msg.sender].isRegistered,"FUNDING BEFORE REGISTRATION: Please ensure airline is registered before paying seed fund");

        // Require that an airline doesn't pay for seed funds more than once.
        require(airlines[msg.sender].seedFund == 0,"DOUBLE PAYMENT ATTEMPT: Thank you, but you can only pay once.");

        require(msg.value >= MINIMUM_SEED_FUND,"INSUFFICIENT AMOUNT: Please ensure to meet the minimum amount of 10 ether for the seed fund");

        // Transfer value to contract balance
        payable(address(this)).transfer(msg.value);

        // Set amount paid by airline.
        airlines[msg.sender].seedFund = airlines[msg.sender].seedFund.add(msg.value);

        // emit event for successful payment
        emit HasPayedSeedFund(msg.value,airlines[msg.sender].name,msg.sender);
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
