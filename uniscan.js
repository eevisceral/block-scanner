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

  const UNI_FACTORY = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'

  // // subscribe to new block logs
  // web3.eth.subscribe('logs', {
  //   address: UNI_FACTORY,
  //   // fromBlock: '15348348',
  // },
  //   function (error, result) {
  //     if (error)
  //       console.log(error);
  //   })
  //   .on("connected", function(subscriptionId){
  //       console.log("Subscription ID: " + subscriptionId + "\nScanning all incoming transactions...");
  //   })
  //
  //   // collect data from logs
  //   .on("data", async (txData) => {
  //     try {
  //
  //       var txHash = await txData.transactionHash;
  //         console.log("Tx Hash: " + txHash);
  //       var blockNumber = await txData.blockNumber;
  //
  //       // get transaction receipt from previous block
  //       var txReceipt = await web3.eth.getTransactionReceipt(txHash);
  //
  //       // get tx data
  //       var txFrom = await txReceipt.from;
  //       var txTo = await txReceipt.to;
  //         console.log("To: (Uniswap Factory) " + txTo);
  //         console.log("From: " + txFrom);
  //
  //       // Call getInternalTx function
  //       var internalTxns = await getInternalTx(txHash);
  //
  //     }
  //     catch (error) {
  //       console.warn("Error caught... \n" + error + "\n");
  //     }
  //
  //   }) // end of web3.eth.logs subscription


  function getInternalTx(transactionHash) {
      // const txnHash = transactionHash;
      const txnHash = '0x6c164d56240fda359b266eac4dd56c9cf14e79f3dc95286cdef83aec158c3847';
        console.log("Scanning hash: " + txnHash + ".");

      axios.get("https://api.etherscan.io/api?module=account&action=txlistinternal&txhash="
      + txnHash + "&apikey=" + API_KEY)

      .then(function (response) {
        var result = response.data.result;
        var data = JSON.stringify(result);
        var cleaned = JSON.parse(data);

        if (response.status === 200) {
          var addy = cleaned[0].contractAddress;
          var sender = cleaned[0].from;
          var blockDeployed = cleaned[0].blockNumber;

          if (sender === UNI_FACTORY) {
            console.log("Uni LP address: " + addy);
            // getERC721Holdings(addy);
          }
          else {
            console.log("Not a Uni LP.");
            return
          }
        }

        else {
          console.error('Null contract address response. \nError: ' + error + '\n');
          return
        };

      }) // end of .then request

      .catch((error) => {
        console.error(error + '\n');
      })

    }; // end of getInternalTx function



  // function getERC721Holdings(poolAddy) {
  //
  //     axios.get('https://api.etherscan.io/api?module=account&action=addresstokennftbalance&address='
  //     + poolAddy + '&page=1&offset=100&apikey=' + API_KEY)
  //
  //     .then(function (response) {
  //       var result = response.data.result;
  //       var data = JSON.stringify(result);
  //       var cleaned = JSON.parse(data);
  //
  //       if (response.status === 200) {
  //         var nfts = cleaned;
  //         // var addy = cleaned[0].contractAddress;
  //           console.log("Contract ERC721 Holdings: \n" + nfts);
  //
  //       }
  //
  //       else {
  //         console.error('Null ERC721 Holdings response. \nError: ' + error + '\n');
  //         return
  //       };
  //
  //     }) // end of .then request
  //
  //     .catch((error) => {
  //       console.error(error + '\n');
  //     })
  //
  //   }; // end of getERC721Holdings function

  getInternalTx();
