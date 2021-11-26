// init packages
require('dotenv').config();
const Web3 = require("web3");
const axios = require('axios');
const fs = require('fs');

// connect to web3 websocket
const API_KEY = process.env.snowtraceKey;
const MAIN_URL = 'wss://api.avax.network/ext/bc/C/ws';
const TEST_URL = 'wss://api.avax-test.network/ext/bc/C/ws';

const web3 = new Web3(new Web3.providers.WebsocketProvider(TEST_URL))
const version = web3.version.api;

const TEST_ADDR = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';


function getABI() {

    // create loop for length of conArray
    // for (var i=0; i <= conArrLength - 1; i++) {

    smartAddr = TEST_ADDR; // process.env.avaxtest;

    console.log("Attempting to retrieve contract ABI from block explorer.");

    // call testnet snowtrace API
    axios.get("https://api-testnet.snowtrace.io/api?module=contract&action=getabi&address="
    + smartAddr + "&apikey=" + API_KEY)

    .then(function (response) {
      var res = response.data.result;
      console.log(res);

      // if source code is verified, parse JSON
      if (res = !'') {
        var contractABI = "";
        contractABI = JSON.parse(response.data.result);

        if (contractABI != '') {

          // print ABI to reveal contract functions we can use - TODO: add filesave functionality*
            console.log(contractABI);
            console.log('\n');

          // get contract details
          const contractDetails = new web3.eth.Contract(contractABI, smartAddr)
            // console.log(contractDetails);

          // get name for given contract
          contractDetails.methods.name().call({ from: smartAddr },
            function (error, result) {
              console.log("Contract Name: " + result)
                console.log('\n');
          });

          // get symbol for given contract
          contractDetails.methods.symbol().call({ from: smartAddr },
            function (error, result) {
              console.log("Ticker: " + result)
                console.log('\n');
          });

          // get total token supply for given contract
          contractDetails.methods.totalSupply().call({ from: smartAddr },
            function (error, result) {
              console.log("Total Supply: " + result)
                console.log('\n');
          });

        } // end of if contract ABI

        else {
          console.log("No ABI for " + smartAddr + ".");
            console.log('\n');
            return
        }

      } // end of if response not null

      else if (res = 'Contract source code not verified') {
        console.log(res)
          console.log('\n')
          return
      }

      else {
        console.log('Null API response.')
          console.log('\n')
          return
      };



    }) // end of axios get .then request

        .catch((error) => {

          console.log(error)
            console.log('\n');

        })


    // }; // end of for loop


  }; // end of getABI() function


getABI();
