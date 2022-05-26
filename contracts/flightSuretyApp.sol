// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)


    IFlightSuretyData flightSuretyData;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;


    // Credit value
    uint8 private constant PASSENGER_CREDIT_VALUE = 150;

    address private contractOwner;          // Account used to deploy contract
    address private firstAirline;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
        string flight;
    }
    mapping(bytes32 => Flight) private s_flights;



    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
 
    event FlightRegistered(bytes32 flightKey, address airline);

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
         // Modify to call data contract's status
        require(flightSuretyData.isOperational(), "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the caller of registerAirline to be a registeredAirline.
    */
    

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineIsActive() 
    {
        require(flightSuretyData.isAirlineActive(msg.sender), " INACTIVE AIRLINE: Confirm that you have both been registered and have paid the seed fund before attempting registering a new airline.");  
        _;  
    }

    // Modifier to check if number of registered users have reached 4

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor ( address dataContract){

        contractOwner = msg.sender;

        flightSuretyData = IFlightSuretyData(dataContract);

    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() 
                            public 
                            pure 
                            returns(bool) 
    {
        return true;  // Modify to call data contract's status
    }

    function isFlightRegistered(address airline, uint timestamp, string memory flight) public view returns (bool){
       
       bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        return s_flights[flightKey].isRegistered;

    }

    function isAirlineFunded(address airline) public view returns(bool){
        return flightSuretyData.isAirlineFunded(airline);
    }


    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline ( address newAirline, string memory _name ) public requireIsOperational requireAirlineIsActive {
        flightSuretyData.registerAirline(newAirline, _name);
    }




   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight (uint _timestamp, string memory _flight ) public requireIsOperational requireAirlineIsActive{
        

        bytes32 flightKey = getFlightKey(msg.sender, _flight, _timestamp);

        bool isRegisteredTwice = keccak256(abi.encodePacked((s_flights[flightKey].flight))) == keccak256(abi.encodePacked((_flight)));
        require(!isRegisteredTwice,'DOUBLE REGISTRATION ATTEMPT: The given flight has already been registered');

        // TODO: WRITE TO FLIGHTS STORAGE ONLY ONCE

        s_flights[flightKey].flight = _flight;
        s_flights[flightKey].airline = msg.sender;
        s_flights[flightKey].statusCode = STATUS_CODE_UNKNOWN;
        s_flights[flightKey].updatedTimestamp = _timestamp;
        s_flights[flightKey].isRegistered = true;

        emit FlightRegistered(flightKey, msg.sender);

    }

    function fundAirline() public payable{
        flightSuretyData.fund(msg.value);
    }

    function buyFlightInsurance ( 
        string memory _flight, 
        string memory passengerName,
        address passengerAddress,
        uint256 _timestamp, 
        address airline 
        ) public payable requireIsOperational{

        // confirm that flight is registered.
        require(isFlightRegistered(airline, _timestamp, _flight),'FLIGHT NOT FOUND: You can only buy insurance for registered flights');

        flightSuretyData.buyInsurance(_flight, passengerName, passengerAddress, msg.value);
    }
    
   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus ( 
        address airline, 
        string memory flight, 
        uint256 timestamp, 
        uint8 statusCode ) internal {

            //generate flightKey
            bytes32 flightKey = getFlightKey(airline, flight, timestamp);

            // update flight status code
            s_flights[flightKey].statusCode = statusCode;

            // When flight is delayed, credit passengers with insurance 
          if (statusCode != STATUS_CODE_ON_TIME) {
            flightSuretyData.creditInsuree(flight, PASSENGER_CREDIT_VALUE);
          }

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

    }
    

    // Get the current flight status
    function getFlightStatus (
                                address airline,
                                string memory flight,                        
                                uint256 timestamp     
                            )
                            public
                            view
                            returns(uint8)
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        return s_flights[flightKey].statusCode;
    }

    function withdrawCredit(address passengerAddress) public requireIsOperational{
         // verify it's be en called from an externally owned account - msg.sender == tx.origin
        require(msg.sender == tx.origin,'WRONG CALLER: Only EOA can call this function');

        // transfer funds to passenger account.
        uint256 creditToPay = flightSuretyData.pay(passengerAddress);

        payable(passengerAddress).transfer(creditToPay);
 
    }

    function getPassengerCredit(address passengerAddress) public view requireIsOperational returns(uint){
        return flightSuretyData.getPassengerCredit(passengerAddress);
    }

   

// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint256 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify                                                 // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;



    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);




    // Register an oracle with the contract
    function registerOracle ( ) external payable{
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        // uint8[3] memory indexes = [5,6,8];
        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

     // Generate a request for oracles to fetch flight information
    function fetchFlightStatus (
                            address airline,
                            string memory flight,
                            uint256 timestamp                            
                        )
                        external
    {
        uint8 index = getRandomIndex(msg.sender);
    

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));

        ResponseInfo storage s_response = oracleResponses[key];

        s_response.requester = msg.sender;
        s_response.isOpen = true;

        emit OracleRequest(index, airline, flight, timestamp);
    } 


    function getMyIndexes ( ) view external returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airline,
                            string memory flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {
        emit OracleReport(airline, flight, timestamp, statusCode);
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // TODO: CLOSE response acceptance for request

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey (
         address airline, 
        string memory flight, 
        uint256 timestamp
        ) pure internal returns(bytes32) {
             return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes (address account) internal returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);
        // uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number.sub(nonce.add(1))), account))).mod(maxValue));

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}   

interface IFlightSuretyData{
    function registerAirline(address airline, string memory name) external;
    function isOperational() external view returns (bool);
    function isAirline(address airline) external view returns (bool);
    function isAirlineActive(address airline) external view returns (bool);
    function buyInsurance(string memory flight, string memory passengerName, address passengerAddress, uint256 insuranceAmount) external payable;
    function creditInsuree(string memory flight, uint256 creditAmount) external;
    function getPassengerCredit(address passengerAddress) external view returns(uint256);
    // function clearPassengerCredit(address passengerAddress) external;
    function pay(address passengerAddress) external returns(uint256);
    function isAirlineFunded(address airline) external view returns(bool);
    function fund(uint value) external payable;
}
