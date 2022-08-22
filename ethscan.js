  // init packages
  require('dotenv').config();
  const Web3 = require("web3");
  const axios = require('axios');
  const fs = require('fs');
  const $ = require('jquery');
  // const { ethers } = require('ethers');

  // connect to web3 websocket
  const API_KEY = process.env.etherscanKey;
  const INFURA_KEY = process.env.infuraKey1;
  const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);
  const version = web3.version.api;

    // subscribe to block logs
  web3.eth.subscribe('logs', {
       // fromBlock: '13606200',
     },
       function (error, result) {
         if (error)
           console.log(error);
       })
       .on("connected", function(subscriptionId){
           console.log("Subscription ID: " + subscriptionId + "\nScanning all incoming transactions...");
       })

    // collect data from logs
    .on("data", async (txData) => {
      try {
        var txHash = await txData.transactionHash;
        var blockNum = await txData.blockNumber;

        // get transaction receipt for latest tx
        var txReceipt = await web3.eth.getTransactionReceipt(txHash);

        // check all transactions for smart contracts
        var txFrom = await txReceipt.from;
        var txTo = await txReceipt.to;
        var contAddr = await txReceipt.contractAddress;

         // if smart contract, call getABI function
         if(web3.utils.isAddress(contAddr)) {
           var contractADDR = contAddr;
           console.log("Proceeding to save contract address: " + contAddr);

           // save address to text file for manual analysis
           contAddrSave = ('\n' + contractADDR + '\n');
           smartConFile = './logs/ETHContracts.txt';
            fs.readFile(smartConFile, 'utf8' , (error, data) => {
              if (error) throw console.error("Error reading file.");

              if (smartConFile.includes(contractADDR) === false) {
                fs.appendFile(smartConFile, contAddrSave, (error) => {
                  if (error) throw console.error("Error saving output file.");
                })

                console.log('%c Contract address saved to file.', 'background: #222; color:#93c47d');
                  console.log('\n');

                // call getABI function
                  // getABI(contractADDR);

              }

              else if (smartConFile.includes(contractADDR) === true) {
              console.log('%c Contract address already saved.', 'background: #222; color:#93c47d');
              }
            });


         }

         else if(!web3.utils.isAddress(contAddr)) {
           // console.log(contAddr + " is not a contract address.");
         }

         else {
           console.log("...");
         }


      }
      catch (error) {
        console.warn("Error caught...");
          console.log('\n');
      }


    }) // end of web3.eth.logs subscription

  //
  //
  // function getABI(conArray) {
  //     var conArrLength = conArray.length;
  //     var a = conArrLength - 10;
  //
  //     const smartAddr = conArray[a]; // process.env.avaxtest;
  //
  //     console.log("Attempting to retrieve contract ABI from block explorer.");
  //
  //     // if address is not a smart contract, log
  //     if(!web3.utils.isAddress(smartAddr)){
  //       console.error("Not a valid smart contract address.")
  //         console.log('\n');
  //         return
  //     }
  //
  //     // call mainnet etherscan API
  //     axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
  //     + smartAddr + "&apikey=" + API_KEY)
  //
  //     // call testnet etherscan API
  //     // axios.get("https://api.kovan.etherscan.io/api?module=contract&action=getabi&address="
  //     // + smartAddr + "&apikey=" + API_KEY)
  //
  //     .then(function (response) {
  //       var contractABI = "";
  //       var res = response.data.result;
  //
  //       // if source code is verified, parse JSON
  //       if (res = !'') {
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
  //         } // end of if contract ABI
  //
  //         else {
  //           console.error("No ABI for " + smartAddr + ".");
  //             console.log('\n');
  //             return
  //         }
  //
  //       } // end of if response not null
  //
  //       else if (res = 'Contract source code not verified') {
  //         console.error(res)
  //           console.log('\n')
  //           return
  //       }
  //
  //       else {
  //         console.error('Null API response.')
  //           console.log('\n')
  //           return
  //       };
  //
  //
  //
  //     }) // end of axios get .then request
  //
  //         .catch((error) => {
  //
  //           console.error(error)
  //             console.log('\n');
  //
  //         })
  //
  //
  //
  //
  //   }; // end of getABI() function
