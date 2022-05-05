
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    // console.log(config)
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/


  it(`Verify first airline is registered by default`, async function () {
    // Check to see if first airline is registered
    let status;
    let numberOfAirlines;
    try{
         status = await config.flightSuretyData.isAirline.call(config.firstAirline);
         numberOfAirlines = await config.flightSuretyData.registeredAirlinesCount.call();
         console.log(numberOfAirlines.toNumber());
    }
    catch(e){
        console.log(e)
    }
    assert.equal(status, true, "First Airline is Registered");
    assert.equal(numberOfAirlines.toNumber(), 1, "Only one airline should be registered after deployment.");
 });
  
  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`verify the registration of first Airline`,async function(){


        let result = await config.flightSuretyData.isAirline.call(config.firstAirline,{from:config.owner});
        assert.equal(result, true, "First flight was not successfully created")

  })

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false,{from:config.owner});
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false,{from:config.owner});

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true,{from:config.owner});

  });


  
  
  xit('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
      
      // ARRANGE
      let newAirline = accounts[2];
      
      let numberOfAirlines;
      // ACT
      try {
          numberOfAirlines = await config.flightSuretyData.registeredAirlinesCount.call();
          // Registration fails if seed fund hasn't been paid
          await config.flightSuretyApp.registerAirline(newAirline,'Virgin Nigeria', {from: config.firstAirline});

          
        }
        catch(e) {
            // console.log(e)
            
        }
        let result = await config.flightSuretyData.isAirline.call(newAirline); 
        
        // ASSERT
        console.log(numberOfAirlines.toNumber());
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
        assert.equal(numberOfAirlines.toNumber(), 1, "Number of registered plane should still be 1.");
        
        
    });


  it('(first airline) can register an Airline using registerAirline() once its funded', async () => {
    
    // ARRANGE
    // Second airline
    let nigerianAirways = accounts[2];
    
    // ACT
    try {
        // Fund first airline
        await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10','ether') });
        // Register second airline after funding
        await config.flightSuretyApp.registerAirline(nigerianAirways,'Nigerian airways', {from: config.firstAirline});

        
    }
    catch(e) {
      console.log(e);
    }


    let result = await config.flightSuretyData.isAirline.call(nigerianAirways);
    let airlinesCount = await config.flightSuretyData.registeredAirlinesCount.call(); 

    assert.equal(result, true, "First Airline can register another airline once its funded");
    assert.equal(airlinesCount.toNumber(), 2, "2 airlines should now be registered");

}); 
    
  
it('(airline) cannot be registered more than once', async () => {
  
  // ARRANGE
  // Second airline
  let egyptAirways = accounts[3];
  let registrationCount = 0;
  
  // ACT
  try {

      // Attempt to register the same airline twice.
      await config.flightSuretyApp.registerAirline(egyptAirways,'Egypt airways', {from: config.firstAirline});
      registrationCount++;
      await config.flightSuretyApp.registerAirline(egyptAirways,'Egypt airways', {from: config.firstAirline});
      registrationCount++
      
  }
  catch(e) {
    // console.log(e);
  }


  let airlinesCount = await config.flightSuretyData.registeredAirlinesCount.call(); 

  assert.equal(registrationCount, 1, "An airline cannot be registered more than once");
  assert.equal(airlinesCount.toNumber(), 3, "3 airlines should now be registered");

}); 
  

  it(`(airline) registering up to 4 airline shouldn't require multiparty consensus `, async () => {
    
    // ARRANGE
    let egyptAirways = accounts[3];

    // 4th airline
    let ethopianAirways = accounts[4];

    // ACT
    try {

        
        
        // EGYPT AIRWAYS REGISTRATION AND SEED FUNDING
        await config.flightSuretyData.fund({from:egyptAirways, value: web3.utils.toWei('10', 'ether')});
        await config.flightSuretyApp.registerAirline(ethopianAirways, 'Ethopians Airways', {from: egyptAirways});
        
    }
    catch(e) {
        console.log('error',e)
        
    }
    // Check if airlines have been registered successfully
    let ethopianAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(ethopianAirways); 
    // let emiratesAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(emiratesAirways); 
    

    let numberOfAirlines = await config.flightSuretyData.registeredAirlinesCount.call();
    
    
    // ASSERT
    assert.equal(ethopianAirwaysIsRegistered, true, "Problem registering airlines");
    assert.equal(numberOfAirlines, 4, "4 airlines should be registered by now.");
        

  });

  it(`(airline) registering up to 5 airlines without consensus fails`, async () => {
    
    // ARRANGE
    let egyptAirways = accounts[3];

    // 5th airline to register
    let turkishAirways = accounts[5];

    // ACT
    try {

        await config.flightSuretyApp.registerAirline(turkishAirways, 'Turkish Airways', {from: egyptAirways});  
        
    }
    catch(e) {
        console.log('error',e)
        
    }
    // Check if airlines have been registered successfully
    let turkishAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(turkishAirways); 

    let numberOfAirlines = await config.flightSuretyData.registeredAirlinesCount.call();
    
    
    // ASSERT
    assert.equal(turkishAirwaysIsRegistered, false, "Problem registering airlines");
    assert.equal(numberOfAirlines, 4, "4 airlines should still be registered by now.");
        
  });

  it(`(airline) registering up to 5 airlines with consensus passes`, async () => {
    
    // ARRANGE
    // first airline --- REGISTERED AND FUNDED > ACTIVE
    let arikAirways = config.firstAirline;
    // second airline --- REGISTERED, NOT FUNDED > INACTIVE
    let nigerianAirways = accounts[2];
    // third airline  --- REGISTERED AND FUNDED > ACTIVE
    let egyptAirways = accounts[3];
    // fourth airline --- REGISTERED, NOT FUNDED > INACTIVE
    let ethopianAirways = accounts[4];
    
    // 5th airline to register --- NOT REGISTERED, NOT FUNDED > INACTIVE
    let turkishAirways = accounts[5];

    // ACT
    try {

        // await config.flightSuretyData.fund({from:nigerianAirways, value:web3.utils.toWei('10', 'ether')});

        // Active airlines (arikAirways and egyptAirways) voting to register new airline: turkish airways
        await config.flightSuretyApp.registerAirline(turkishAirways, 'Turkish Airways', {from: arikAirways});  
        // await config.flightSuretyApp.registerAirline(turkishAirways, 'Turkish Airways', {from: arikAirways});  
        await config.flightSuretyApp.registerAirline(turkishAirways, 'Turkish Airways', {from: egyptAirways});  
 
        
    }
    catch(e) {
        console.log(e)
        
    }
    // Check if airlines have been registered successfully
    let turkishAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(turkishAirways); 

    let numberOfAirlines = await config.flightSuretyData.registeredAirlinesCount.call();
    let airlinesHasReachedConsensus = await config.flightSuretyData.airlineHasReachedConsensus(turkishAirways);
     
    
    // ASSERT
    assert.equal(turkishAirwaysIsRegistered, true, "Problem registering airlines.");
    assert.equal(airlinesHasReachedConsensus, true, "Airlines haven't reached consensus.");
    assert.equal(numberOfAirlines, 5 , " 5 airlines should be registered after consensus.");
        
  });


  // ------------------------------------------- //
  // Test related to passengers
  // ------------------------------------------- //


  it(`(airline) cannot register flight if inactive`, async()=>{

    // ARRANGE

    // Unregistered airline
    let ghanaAirline = accounts[6];

    let flight = {
        name:'K102321',
        timestamp: Math.floor(Date.now() / 1000),
    }

    try{

        // ACT
        await config.flightSuretyApp.registerFlight(flight.timestamp,flight.name,{from:ghanaAirline});
    }
    catch(err){
        // console.log(err)
    }


    // ASSERT
    
    let flightIsRegistered = await config.flightSuretyApp.isFlightRegistered(ghanaAirline, flight.timestamp, flight.name);
    assert.equal(flightIsRegistered, false,'Inactive airline cannot register flights')

  });


  it(`(airline) can register flight if active`, async()=>{

    // ARRANGE

    // Unregistered airline
    let ghanaAirways = accounts[6];

    //REGISTERED AND FUNDED > ACTIVE
    let egyptAirways = accounts[3];

    let flight = {
        name:'K102321',
        timestamp: Math.floor(Date.now() / 1000),
    }

    try{

        // ACT
        // Register second airline after funding
        await config.flightSuretyApp.registerAirline(ghanaAirways,'Ghana airways', {from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(ghanaAirways,'Ghana airways', {from: egyptAirways});
        // await config.flightSuretyApp.registerAirline(ghanaAirways,'Ghana airways', {from: egyptAirways});
        await config.flightSuretyData.fund({from: ghanaAirways, value: web3.utils.toWei('10','ether') });

        await config.flightSuretyApp.registerFlight(flight.timestamp,flight.name,{from:ghanaAirways});
    }
    catch(err){
        console.log(err)
    }


    // ASSERT
    
    let flightIsRegistered = await config.flightSuretyApp.isFlightRegistered(ghanaAirways, flight.timestamp, flight.name);
    assert.equal(flightIsRegistered, true,'Error encountered while registering flight')


  });



 

});
