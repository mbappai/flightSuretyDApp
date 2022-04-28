
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
    // let seedFund = await config.flightSuretyData.MINIMUM_SEED_FUND.call();
    
    // ACT
    try {
        // Fund first airline
        await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei('10','ether') });
        // Register second airline after funding
        await config.flightSuretyApp.registerAirline(nigerianAirways,'Nigerian airways', {from: accounts[3]});

        
    }
    catch(e) {
      console.log(e);
    }

    // // Retrieve seed fund
    // seedFund = await config.flightSuretyData.getSeedFund.call(config.firstAirline);

    let result = await config.flightSuretyData.isAirline.call(nigerianAirways);
    let airlinesCount = await config.flightSuretyData.registeredAirlinesCount.call(); 

    assert.equal(result, true, "First Airline can register another airline once its funded");
    assert.equal(airlinesCount.toNumber(), 2, "2 airlines should now be registered");

}); 
    

  xit(`(airline) registering up to 4 airline shouldn't require multiparty consensus `, async () => {
    
    // ARRANGE
    let egyptAirways = accounts[3];
    // let ethopianAirways = accounts[4];
    // let emiratesAirways = accounts[5];
    // let turkishAirways = accounts[6];

    // ACT
    try {
        
        // await config.flightSuretyData.fund({from:config.firstAirline ,value:web3.utils.toWei('10','ether')});

        
        // EGYPT AIRWAYS REGISTRATION AND SEED FUNDING
        await config.flightSuretyApp.registerAirline(egyptAirways, 'Egypt airways', {from: config.firstAirline});
        await config.flightSuretyData.fund({from:egyptAirways, value: web3.utils.toWei('10', 'ether')});
        
        //  // ETHOPIAN AIRWAYS REGISTRATION AND SEED FUNDING
        // await config.flightSuretyApp.registerAirline(ethopianAirways, 'Ethopian airways', {from: config.firstAirline});
        // await config.flightSuretyData.fund({from:ethopianAirways, value: web3.utils.toWei('10', 'ether')});
        
        // // EMIRATES AIRWAYS REGISTRATION AND SEED FUNDING
        // await config.flightSuretyApp.registerAirline(emiratesAirways, 'Emirates airways', {from: config.firstAirline});
        // await config.flightSuretyData.fund({from:emiratesAirways, value: web3.utils.toWei('10', 'ether')});
        
        // TURKISH AIRWAYS REGISTRATION AND SEED FUNDING
        // await config.flightSuretyApp.registerAirline(turkishAirways, 'Turkish airways', {from: config.firstAirline});
        // await config.flightSuretyData.fund({from:turkishAirways, value: web3.utils.toWei('10', 'ether')});
        
    }
    catch(e) {
        console.log('error',e)

    }
    // Check if airlines have been registered successfully
    let nigerianAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(nigerianAirways); 
    let egyptAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(egyptAirways); 
    // let ethopianAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(ethopianAirways); 
    // let emiratesAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(emiratesAirways); 
    // let turkishAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(turkishAirways); 


    console.log(nigerianAirwaysIsRegistered,egyptAirwaysIsRegistered);

    let result = nigerianAirwaysIsRegistered && egyptAirwaysIsRegistered ;

    // ASSERT
    assert.equal(result, true, "Problem registering airlines");
    assert.equal(numberOfAirlines, 4, "4 airlines should be registered by now.");
        

  });



 

});
