  // init packages
  require('dotenv').config();
  const Web3 = require("web3");
  const axios = require('axios');
  const fs = require('fs');
  // const express = require("express");
  // const { ethers } = require('ethers');

  // connect to web3 websocket
  const API_KEY = process.env.ftmscanKey;
  const MAIN_URL = 'wss://wsapi.fantom.network/';
  const TEST_URL = 'wss://wsapi.testnet.fantom.network/';

  const web3 = new Web3(new Web3.providers.WebsocketProvider(MAIN_URL))
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
         if(web3.utils.isAddress(contAddr)) {
           var contractADDR = contAddr;
           console.log(b + ". Proceeding to save contract address: " + contAddr);
           console.log('\n');

           // save address to text file for manual analysis
           // if (addrArray.includes(contractADDR) === false) addrArray.push(contractADDR);
           contAddrSave = (contractADDR + '\n');
           smartConFile = './logs/FTMContracts.txt';
            fs.readFile(smartConFile, 'utf8' , (error, data) => {
              if (error) throw console.log("Error reading file.");

              if (smartConFile.includes(contractADDR) === false) {
                fs.appendFile(smartConFile, contAddrSave, (error) => {
                  if (error) throw console.log("Error saving output file.");
                })
                console.log("Contract address saved!");
                // call getABI function
                getABI(contractADDR);
                console.log("Attempting to retrieve contract ABI from block explorer...");
              }

              else if (smartConFile.includes(contractADDR) === true) {
              console.log('Contract address already saved.');
              }
            });


         }

         else if(!web3.utils.isAddress(contAddr)) {
           // console.log(b + ". " + contAddr + " is not a contract address.");
         }

         else {
           console.log("... No address found.");
         }


      }
      catch (error) {
        console.log("Error caught...");
      }


    }) // end of web3.eth.logs subscription



  function getABI(conDetails) {
      const smartAddr = conDetails;
      // const smartAddr = process.env.testADDR;

      if(!web3.utils.isAddress(smartAddr)){
        console.log("Not a valid smart contract address.")
        return
      }

      // call mainnet ftmscan API
      axios.get("https://api.ftmscan.io/api?module=contract&action=getabi&address="
      + smartAddr + "&apikey=" + API_KEY)

      // call testnet ftmscan API
      // axios.get("https://api.testnet.ftmscan.io/api?module=contract&action=getabi&address="
      // + smartAddr + "&apikey=" + API_KEY)

      .then(response => {
        var result = response.data.result;

        // if source code is verified, parse JSON
        if(result != "Contract source code not verified"){
          var contractABI = "";
          contractABI = JSON.parse(response.data.result);


        // if contractABI is not null, execute
        if (contractABI != '') {

          // print ABI to reveal unique functions, events, etc.
          // console.log(contractABI);

          // get contract details
          const contractDetails = new web3.eth.Contract(contractABI, smartAddr)
          // console.log(contractDetails);

          // get name for given contract
          contractDetails.methods.name().call({ from: smartAddr },
            function (error, result) {
              console.log("Contract Name: " + result)
          });

          // get symbol for given contract
          contractDetails.methods.symbol().call({ from: smartAddr },
            function (error, result) {
              console.log("Ticker: " + result)
          });

          // get total token supply for given contract
          contractDetails.methods.totalSupply().call({ from: smartAddr },
            function (error, result) {
              console.log("Total Supply: " + result)
          });

          // // get past transfer events from contract
          // contract.getPastEvents('Transfer', {
          // fromBlock: 13589400,
          // toBlock: 'latest'},
          //   (err, events) => { console.log(events) })

          }
        }
          // else, address does not have verified contract
          else {
            console.log("No ABI for " + smartAddr + " yet.");
            return
          }


          }) // end of axios get request

          .catch((error) => {

            console.log(error)
            console.log('\n');

          });

    }; // end of getABI function


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
