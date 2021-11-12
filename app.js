// init packages, infura, API keys
require('dotenv').config();
const Web3 = require("web3")
const axios = require('axios');
//const fs = require('fs')

// .env variables
const API_KEY = process.env.etherscanKey;
const INFURA_KEY = process.env.infuraKey;

/**
//init express server
const express = require("express");
const bodyParser = require("body-parser");
//const request = require("request");

// run express and body-parser
const app = express();
//app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

    // server get
    app.get("/", function(req, res){
      res.sendFile(__dirname + "/index.html");
    });

    // server post
    app.post("/", function(req, res){
      res.send("...")
    });

    // server port
    app.listen(1503, function(){
      console.log("Server has started on Port 1503.");
    });
// end server */

// create arrays to store block header data
var numArray = [];
var timeArray = [];
var hashArray = [];
var txArray = [];
var txHashArray = [];

  // connect to infura
  var web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);

  // subscribe to all new block headers
  start = web3.eth.subscribe('newBlockHeaders', function (error, result) {})

    // fires once when successfully subscribed
    .on("connected", function(subscriptionId){
        console.log("Connected to Web3.") ;
        console.log("Subscription ID: " + subscriptionId);
        console.log("\n");
    })

    // fires on all new blocks
    .on("data", function (blockHeadData) {

      // store useful block header data
      blockNum = blockHeadData.number;
      blockTime = blockHeadData.timestamp;
      blockHash = blockHeadData.hash;

      // push data to arrays without duplicates
      if (numArray.includes(blockNum) === false) numArray.push(blockNum);
      if (timeArray.includes(blockTime) === false) timeArray.push(blockTime);
      if (hashArray.includes(blockHash) === false) hashArray.push(blockHash);
        // console.log("Block Number Array:");
        // console.log(numArray);
        // console.log("Datetime Array:");
        // console.log(timeArray);


      // getBlock function
      web3.eth.getBlock('latest')
      .then(function (blockData) {

        // create array of txs within block
        txArray = blockData.transactions;
        // n = txArray.length - 1;
          // console.log("Intrablock Transaction Array: ");
          // console.log(txArray);

        // get latest block number from data
        latestBlock = blockData.number;
          // console.log("Latest Block Number: " + latestBlock);


        // function to count number of transactions in block
        web3.eth.getBlockTransactionCount('latest')
        .then(function (txCount) {

            console.log("Total Txs in Block: " + txCount);

            //get transaction info from latest block
            web3.eth.getTransactionFromBlock('latest', 2)
            .then(function (txFromBlock) {

              // console.log(txFromBlock);
              latestBlockNum = txFromBlock.blockNumber
              txHash = txFromBlock.hash
              console.log("Transaction Info from Block Number " + latestBlockNum)
              // console.log("Transaction Hash: " + txHash);

              // push tx hashes to array
              if (txHashArray.includes(txHash) === false) txHashArray.push(txHash);
              txHashArrayLength = txHashArray.length;
              console.log("Transaction Hash Array Length: " + txHashArrayLength);
              // console.log(txHashArray);


              // get latest tx receipt from transcation hash
              web3.eth.getTransactionReceipt(txHash)
              .then(function (txReceipt) {

                console.log("Analyzing Tx Receipt...");
                console.log('\n');
                // console.log(txReceipt);
                conAddr = txReceipt.contractAddress;

                // loop for entire length of block's transcation count
                for(var t = 0; t <= txCount - 1; t++) {

                  if(web3.utils.isAddress(conAddr)) {

                    // address is a smart contract
                    smartAddr = conAddr;

                    // save transaction data to file
                    // var data = txReceipt
                    // fs.writeFile(logs/c${t}/`txData${t}.txt`, data, (error) => {
                    //   if (error) throw err;
                    // })

                    // call getABI function for etherscan webhook
                    console.log(t + ". Proceeding to get contract ABI for: " + conAddr);
                    console.log('\n');
                    getABI();
                  }

                  else {

                    console.log(t + ". " + conAddr + " is not a contract address.");
                    //return

                  }

                }


            });


          })

          .catch((err) => {

            console.log("Whoops! Error getting transaction info from block.")
            console.log('\n');

          });


      });


    })

  })


  // start.unsubscribe(function (error, success) {
  //     if (success)
  //         console.log('Successfully unsubscribed!');
  // });

//
//
// smartAddr = process.env.testADDR;
//
// async function getABI() {
//
//   // Find smartAddr with verified source code, call etherscan to get contractABI
//   axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
//   + smartAddr + "&apikey=" + API_KEY).then(response => {
//
//     // parse json response
//     var contractABI = "";
//     contractABI = JSON.parse(response.data.result);
//
//     // if contractABI is not null, execute
//     if (contractABI != '') {
//
//       // print ABI to reveal functions, events and other data we can analyze
//       //console.log(contractABI)
//       //console.log("\n\n")
//
//       // get contractDetails from contractABI + smartAddr
//       const contractDetails = new web3.eth.Contract(contractABI, smartAddr)
//       //console.log(contractDetails);
//
//       // get name for given contract
//       contractDetails.methods.name().call({ from: smartAddr },
//         function (error, result) {
//           console.log("Contract Name: " + result)
//       });
//
//       // get symbol for given contract
//       contractDetails.methods.symbol().call({ from: smartAddr },
//         function (error, result) {
//           console.log("Ticker: " + result)
//       });
//
//       // get totalSupply for given contract
//       contractDetails.methods.totalSupply().call({ from: smartAddr },
//         function (error, result) {
//           console.log("Total Supply: " + result)
//       });
//
//       // // get past Transfer events from contract
//       // contract.getPastEvents('Transfer', {fromBlock: 13589400, toBlock: 'latest'},
//       //   (err, events) => { console.log(events) })
//
//     }
//
//     // else, address does not have verified contract yet
//     else {
//         console.log("No ABI for " + smartAddr + " yet.");
//     }
//   })
// }



start;
//getABI();
