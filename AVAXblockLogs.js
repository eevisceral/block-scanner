  // init packages
  require('dotenv').config();
  const Web3 = require("web3");
  const axios = require('axios');
  const express = require("express");
  const fs = require('fs');
  const { ethers } = require('ethers');

  // priv keys
  // const API_KEY = process.env.etherscanKey;
  // const INFURA_KEY = process.env.infuraKey1;
  //const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);
  const MAIN_URL = 'https://api.avax.network/ext/bc/C/rpc';
  const TEST_URL = 'https://api.avax-test.network/ext/bc/C/rpc';

  const web3 = new Web3(new Web3.providers.HttpProvider(MAIN_URL))


  // // express server
  // const app = express();
  // app.use(express.static("public"));

  // arrays to store data
  var numArray = [];
  var txArray = [];
  var addrArray = [];
  var b = 0;
  var txHashArray = [];

  // // server get response
  // app.get("/", function(req, res){
  //   res.sendFile(__dirname + "/index.html");

  // get data from new block
  web3.eth.getBlock('latest', true)
  .then(function (blockData) {
      latestBlock = blockData.number;
      txArray = blockData.transactions;
      txArrayLength = txArray.length;
        // console.log("Latest Block Number: " + latestBlock);

      //get transaction info from latest block
      web3.eth.getTransactionFromBlock(latestBlock, 2)
      .then(function (txFromBlock) {
        blockTxTo = txFromBlock.to;
        blockHash = txFromBlock.hash;
        blockTxFrom = txFromBlock.from;

        console.log("Transaction Info from Block Number " + latestBlock);
        console.log("Tx Array Length: " + txArrayLength);


          // loop getTxReceipt for entire length of block's transcation count
          for(var t = 0; t <= txArrayLength - 1; t++) {
          web3.eth.getTransactionReceipt(txArray[t].hash, (error, txReceipt) => {
            if (error) {
              console.log("Error getting txReceipt");
            }
            else if(blockTxTo == ''){
              // console.log("Analyzing txReceipt for: " + txReceipt.contractAddress);
              b++;
            }
            else {
              // console.log("Tx is not a contract creation.");
              b++;
            }
          })


          
          .then(function (analyzeTxReceipt) {
              txAddr = analyzeTxReceipt.contractAddress;
              txGasUsed = analyzeTxReceipt.cumulativeGasUsed;
              txHash = analyzeTxReceipt.transactionHash;
              txTo = analyzeTxReceipt.to;
              // console.log(analyzeTxReceipt);


                if(web3.utils.isAddress(txAddr) && txTo == '') {
                  contractADDR = txAddr;
                  console.log("Tx " + b + ": Proceeding to get contract ABI for: " + contractADDR);
                  console.log("Hash: " + txHash);
                  console.log('\n');
                  // if contract, save address to text file for manual analysis
                  contAddrSave = (contractADDR + '\n');
                  smartConFile = 'logs/AVAXContracts.txt';
                   fs.readFile(smartConFile, 'utf8' , (error, data) => {
                     if (error) throw console.log("Error reading file.");

                     if (smartConFile.includes(contractADDR) === false) {
                       fs.appendFile(smartConFile, contAddrSave, (error) => {
                         if (error) throw console.log("Error saving output file.");
                       })
                       console.log("Smart contract address saved.");
                       // call getABI function
                       getABI(contractADDR);
                       console.log("Calling ABI...");
                     } else if (smartConFile.includes(contractADDR) === true) {
                       console.log('Contract address already logged.');
                     }
                   }); // end if statement;

                } else if(!web3.utils.isAddress(txAddr)) {
                    console.log("Tx " + b + ": " + txAddr + " is not a contract address.");
                    console.log("Hash: " + txHash);
                } else {
                    console.log("No address found.");
                    console.log("Hash: " + txHash);
                }; // end else statement;

          }) // end analyzeTxReceipt;

         }; //end for loop;

        }) // end txFromBlock;

    .catch((err) => {

      console.log("Error getting transaction info from this block.")
      console.log('\n');

    }); // end catch;

  }); // end blockData;




  function getABI(conDetails) {
      const smartAddr = conDetails;
      // const smartAddr = process.env.testADDR;

      if(!web3.utils.isAddress(smartAddr)){
        console.log("Not a valid smart contract address.")
        return
      }

      // call etherscan API
      axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
      + smartAddr + "&apikey=" + API_KEY).then(response => {
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

          }); // end of axios get request

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
