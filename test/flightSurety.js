
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


  
  
//   it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
      
//       // ARRANGE
//       let newAirline = accounts[2];
      
      
//       // ACT
//       try {
//           // Check if seed fund has been paid
//           await config.flightSuretyApp.registerAirline(newAirline,'Virgin Nigeria', {from: config.firstAirline});
          
//         }
//         catch(e) {
            
//         }
//         let result = await config.flightSuretyData.isAirline.call(newAirline); 
        
//         // ASSERT
//         assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
        
//     });
    
    // it(`(airline) can pay seed fund only after registration`, async ()=>{
  
    //   // ARRANGE
    //   let registeredAirline = config.firstAirline;
  
    //    // ACT
    //   await config.flightSuretyData.fund({from:registeredAirline, value:web3.utils.toWei('10','ether')});
  
    //   let result = await config.flightSuretyData.hasPaidSeedFund.call(registeredAirline);
  
    //   // ASSERT
    //   assert.equal(result, true, "Airline seed fund payment didn't go through");
  
    // })

  it('(airline) cannot register more than 4 airlines without multiparty consensus ', async () => {
    
    // ARRANGE
    let nigerianAirways = accounts[2];
    let egyptAirways = accounts[3];
    let ethopianAirways = accounts[4];
    let emiratesAirways = accounts[5];
    let turkishAirways = accounts[6];

    // ACT
    try {
        // First airline tries to register 4 planes
        await config.flightSuretyApp.registerAirline(nigerianAirways,'Nigerian airways', {from: config.firstAirline});
        await config.flightSuretyData.fund({from:nigerianAirways, value: web3.utils.toWei('10', 'ether')});
        
        // EGYPT AIRWAYS REGISTRATION AND SEED FUNDING
        await config.flightSuretyApp.registerAirline(egyptAirways, 'Egypt airways', {from: config.firstAirline});
        await config.flightSuretyData.fund({from:egyptAirways, value: web3.utils.toWei('10', 'ether')});
        
        // ETHOPIAN AIRWAYS REGISTRATION AND SEED FUNDING
        await config.flightSuretyApp.registerAirline(ethopianAirways, 'Ethopian airways', {from: config.firstAirline});
        await config.flightSuretyData.fund({from:ethopianAirways, value: web3.utils.toWei('10', 'ether')});
        
        // EMIRATES AIRWAYS REGISTRATION AND SEED FUNDING
        await config.flightSuretyApp.registerAirline(emiratesAirways, 'Emirates airways', {from: config.firstAirline});
        await config.flightSuretyData.fund({from:emiratesAirways, value: web3.utils.toWei('10', 'ether')});
        
        // TURKISH AIRWAYS REGISTRATION AND SEED FUNDING
        await config.flightSuretyApp.registerAirline(turkishAirways, 'Turkish airways', {from: config.firstAirline});
        await config.flightSuretyData.fund({from:turkishAirways, value: web3.utils.toWei('10', 'ether')});
        
    }
    catch(e) {
        console.log('error',e)

    }
    // Check if airlines have been registered successfully
    let nigerianAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(nigerianAirways); 
    let egyptAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(egyptAirways); 
    let ethopianAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(ethopianAirways); 
    let emiratesAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(emiratesAirways); 
    let turkishAirwaysIsRegistered = await config.flightSuretyData.isAirline.call(turkishAirways); 

    console.log(await config.flightSuretyApp.registeredAirlinesCount.call())

    console.log(nigerianAirwaysIsRegistered,ethopianAirwaysIsRegistered,egyptAirwaysIsRegistered,emiratesAirwaysIsRegistered,turkishAirwaysIsRegistered);
    // console.log(nigerianAirwaysIsRegistered, egyptAirwaysIsRegistered, ethopianAirwaysIsRegistered);
    let result = nigerianAirwaysIsRegistered && ethopianAirwaysIsRegistered && egyptAirwaysIsRegistered && emiratesAirwaysIsRegistered && turkishAirwaysIsRegistered;
    // let result = nigerianAirwaysIsRegistered && egyptAirwaysIsRegistered && ethopianAirwaysIsRegistered;

    // ASSERT
    assert.equal(result, true, "Problem registering airlines");

  });



 

});
