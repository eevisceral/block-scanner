  // init packages
  require('dotenv').config();
  const Web3 = require("web3");
  const axios = require('axios');
  const fs = require('fs');
  // const express = require("express");
  // const { ethers } = require('ethers');

  // connect to web3 websocket
  const API_KEY = process.env.snowtraceKey;
  const MAIN_URL = 'wss://api.avax.network/ext/bc/C/ws';
  const TEST_URL = 'wss://api.avax-test.network/ext/bc/C/ws';

  const web3 = new Web3(new Web3.providers.WebsocketProvider(TEST_URL))
  const version = web3.version.api;

  // // express server
  // const app = express();
  // app.use(express.static("public"));

  // arrays to store data
  var numArray = [];
  var txArray = [];
  var addrArray = [];
  var indexArray = [];
  var b = 0;

  // // server get response
  // app.get("/", function(req, res){
  //   res.sendFile(__dirname + "/index.html");

    // subscribe to block logs
  web3.eth.subscribe('logs', {
       // fromBlock: '13606200',
    },
    function (error, result) {
      if (error) console.log(error);
    })

    // fires once on sucessful subscription
    .on("connected", function(subscriptionId){
        console.log("ID: " + subscriptionId);
        console.log("\n");
        console.log("Scanning all incoming transactions...");
        console.log("\n");
    })

    // collect data from logs
    .on("data", async (txData) => {
      try {
        var txHash = txData.transactionHash;
        var blockNum = txData.blockNumber;
        var logsIndex = txData.logIndex;
        // console.log(logsIndex);

        // push data to array without duplicates
        if (txArray.includes(txHash) === false) txArray.push(txHash);
        if (numArray.includes(blockNum) === false) numArray.push(blockNum);

        // get transaction receipt for latest tx
        var b = (txArray.length - 1);
        var txReceipt = await web3.eth.getTransactionReceipt(txArray[b]);
          // console.log(txReceipt);

        // check all transactions for smart contracts
        var txFrom = txReceipt.from;
        var txTo = txReceipt.to;
        var contAddr = txReceipt.contractAddress;

          // console.log(txReceipt.transactionHash);

         // if smart contract, call getABI function
         if(web3.utils.isAddress(contAddr) && addrArray.includes(contAddr) === false) {
           var contractADDR = contAddr;
           console.log(b + ". Proceeding to save contract address: " + contAddr);

           // save address to text file for manual analysis
           if (addrArray.includes(contractADDR) === false) addrArray.push(contractADDR);
           contAddrSave = (contractADDR + '\n');
           smartConFile = './logs/AVAXContracts.txt';
            fs.readFile(smartConFile, 'utf8' , (error, data) => {
              if (error) throw console.error("Error reading file.");

              if (smartConFile.includes(contractADDR) === false) {
                fs.appendFile(smartConFile, contAddrSave, (error) => {
                  if (error) throw console.error("Error saving output file.");
                })

                console.log('%c Contract address saved to file.', 'background: #222; color:#93c47d');
                  console.log('\n');

                // call getABI function
                if (addrArray.length >= 10) {
                  getABI(addrArray);
                }

                else {
                  console.log(addrArray.length + ' contract addresses in array.')
                  console.log('%c Still scanning...', 'background: #222; color:#93c47d');
                    console.log('\n');
                }

              }

              else if (smartConFile.includes(contractADDR) === true) {
              console.warn('Contract address already saved.');
              }
            });


         }

         else if(!web3.utils.isAddress(contAddr)) {
           // console.log(b + ". " + contAddr + " is not a contract address.");
         }

         else {
           console.log("...");
         }


      }
      catch (error) {
        console.warn("Error caught, trying again...");
          console.log('\n');
      }


    }) // end of web3.eth.logs subscription



  function getABI(conArray) {
      var conArrLength = conArray.length;
      var a = conArrLength - 10;

      const smartAddr = conArray[a]; // process.env.avaxtest;

      console.log("Attempting to retrieve contract ABI from block explorer.");

      // if address is not a smart contract, log
      if(!web3.utils.isAddress(smartAddr)){
        console.error("Not a valid smart contract address.")
          console.log('\n');
          return
      }

      // call mainnet snowtrace API
      // axios.get("https://api.snowtrace.io/api?module=contract&action=getabi&address="
      // + smartAddr + "&apikey=" + API_KEY)

      // call testnet snowtrace API
      axios.get("https://api-testnet.snowtrace.io/api?module=contract&action=getabi&address="
      + smartAddr + "&apikey=" + API_KEY)

      .then(function (response) {
        var contractABI = "";
        var res = response.data.result;

        if (res = 'Contract source code not verified') {
          console.error(res)
            console.log('\n')
            return
        }

        // if source code is verified, parse JSON
        else if (res = !'') {
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
            console.error("Error retrieving ABI for " + smartAddr + ".");
              console.log('\n');
              return
          }

        } // end of if response not null

        else {
          console.error('Null API response.')
            console.log('\n')
            return
        };



      }) // end of axios get .then request

          .catch((error) => {

            console.error(error)
              console.log('\n');

          })




    }; // end of getABI() function



  // }); // end of server get
  //
  //
  // // server post
  // app.post("/", function(req, res){
  //   res.send("...")
  // }); // end of server post
  //
  //
  // // server port
  // app.listen(1503, function(){
  //   console.log("Server has started on Port 1503.");
  // }); // end of server port
