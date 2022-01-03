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
  function subLogs() {
  web3.eth.subscribe('logs', {
       // fromBlock: '13606200',
    },
    function (error, result) {
      if (error) console.log(error);
    })

    // fires once on sucessful subscription
    .on("connected", function(subscriptionId){
        console.log("ID: " + subscriptionId);
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
           smartConFile = './logs/FTMContracts.txt';
            fs.readFile(smartConFile, 'utf8' , (error, data) => {
              if (error) throw console.log("Error reading file.");

              if (smartConFile.includes(contractADDR) === false) {
                fs.appendFile(smartConFile, contAddrSave, (error) => {
                  if (error) throw console.log("Error saving output file.");
                })

                console.log("Contract address saved to file.");
                  console.log('\n');

                // call getABI function
                if (addrArray.length >= 1) {
                  getABI(addrArray);
                }

                else {
                  console.log(addrArray.length + ' contract addresses in array.')
                  console.log("Still scanning...");
                    console.log('\n');
                }

              }

              else if (smartConFile.includes(contractADDR) === true) {
              console.log('Contract address already saved.');
              }
            });


         }

         else if(!web3.utils.isAddress(contAddr)) {
           // console.log(b + ". " + contAddr + " is not a contract address.");
           //  console.log('\n');
         }

         else {
           console.log("...");
         }


      }
      catch (error) {
        console.log("Error caught.");
          console.log('\n');
      }

    }) // end of web3.eth.logs subscription

}; // end of subLogs function



  // function getABI(conArray) {
  //     var conArrLength = conArray.length;
  //     var a = conArrLength - 1;
  //
  //     const smartAddr = conArray[a]; // process.env.ftmtest;
  //
  //     console.log("Attempting to retrieve contract ABI from block explorer...");
  //
  //     // if address is not a smart contract, log
  //     // if(web3.utils.isAddress(smartAddr)){
  //     //   console.log("Not a valid smart contract address.")
  //     //     console.log('\n');
  //     //     subLogs();
  //     // }
  //
  //     // call mainnet ftmscan API
  //     axios.get("https://api.ftmscan.io/api?module=contract&action=getabi&address="
  //     + smartAddr + "&apikey=" + API_KEY)
  //
  //     // call testnet ftmscan API
  //     // axios.get("https://api.testnet.ftmscan.io/api?module=contract&action=getabi&address="
  //     // + smartAddr + "&apikey=" + API_KEY)
  //
  //     .then(function (response) {
  //
  //       var res = response.data.result;
  //
  //       // if source code is verified, parse JSON
  //       if (res = !'') {
  //         var contractABI = "";
  //         contractABI = JSON.parse(response.data.result);
  //
  //         if (contractABI != '') {
  //
  //           // print ABI to reveal contract functions we can use - TODO: add filesave functionality*
  //           console.log(contractABI);
  //           console.log('\n');
  //
  //           // get contract details
  //           const contractDetails = new web3.eth.Contract(contractABI, smartAddr)
  //             // console.log(contractDetails);
  //
  //           // get name for given contract
  //           contractDetails.methods.name().call({ from: smartAddr },
  //             function (error, result) {
  //               console.log("Contract Name: " + result)
  //                 console.log('\n');
  //           });
  //
  //           // get symbol for given contract
  //           contractDetails.methods.symbol().call({ from: smartAddr },
  //             function (error, result) {
  //               console.log("Ticker: " + result)
  //                 console.log('\n');
  //           });
  //
  //           // get total token supply for given contract
  //           contractDetails.methods.totalSupply().call({ from: smartAddr },
  //             function (error, result) {
  //               console.log("Total Supply: " + result)
  //                 console.log('\n');
  //           });
  //
  //           subLogs();
  //
  //         } // end of if contract ABI
  //
  //         else {
  //           console.log("No ABI for " + smartAddr + ".");
  //             console.log('\n');
  //             return
  //         }
  //
  //       } // end of if response not null
  //
  //       else if (res = 'Contract source code not verified') {
  //         console.log(res + ".")
  //           console.log('\n')
  //           subLogs();
  //       }
  //
  //       else {
  //         console.log('Null API response.')
  //           console.log('\n')
  //           subLogs();
  //       };
  //
  //     }) // end of axios get .then request
  //
  //         .catch((error) => {
  //           console.log("Having trouble accessing FTMScan API.")
  //             console.log('\n');
  //             subLogs()
  //         })
  //
  //   }; // end of getABI() function



subLogs();

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
