  // init packages
  require('dotenv').config();
  const Web3 = require("web3")
  const axios = require('axios');
  const express = require("express");

  // priv keys
  const API_KEY = process.env.etherscanKey;
  const INFURA_KEY = process.env.infuraKey;
  const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);

  // express server
  const app = express();
  app.use(express.static("public"));

  // create arrays to store data
  var numArray = [];
  var txArray = [];
  var addrArray = [];
  var b = 0;

  // server get response
  app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");


    // subscribe to block logs
    const subs = web3.eth.subscribe('logs', {
       // fromBlock: '13606200',
    },
    function (error, result) {
      if (error) console.log("There was an error when subscribing to web3.");
    })

    // fires once when successfully subscribed
    .on("connected", function(subscriptionId){
        console.log("Subscription ID: " + subscriptionId);
    })

    // collect data
    .on("data", async (txData) => {
      try {
        //console.log(data);
        var txHash = txData.transactionHash;
        var blockNum = txData.blockNumber;
        var addr = txData.address;

        // push data to array without duplicates
        if (txArray.includes(txHash) === false) txArray.push(txHash);
        if (numArray.includes(blockNum) === false) numArray.push(blockNum);
        if (addrArray.includes(addr) === false) addrArray.push(addr);

        // get txReceipt to identify contract address, to and from addresses
        var b = (txArray.length - 1);
        var txReceipt = await web3.eth.getTransactionReceipt(txArray[b]);
        // console.log(txReceipt);

         // check all txs for contract ABIs
         var txFrom = txReceipt.from;
         var txTo = txReceipt.to;
         var ADDRESS = txReceipt.contractAddress;
         //console.log(txReceipt.transactionHash);

         if(web3.utils.isAddress(ADDRESS)) {
           var contractADDR = ADDRESS;
           console.log(b + ". Proceeding to get contract ABI for: " + ADDRESS);
           console.log('\n');
           getABI(ADDRESS);
         }

         else if(!web3.utils.isAddress(ADDRESS)) {
           // console.log(b + ". " + ADDRESS + " is not a contract address.");
         }

         else {
           console.log("Hmm... No address found.");
         }


      }
      catch (error) {
        console.log(error);
      }


    }) // end of web3.eth.logs subscription



  function getABI(conDetails) {
      const smartAddr = conDetails;

      axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
      + smartAddr + "&apikey=" + API_KEY).then(response => {

        // parse json response
        var contractABI = "";
        contractABI = JSON.parse(response.data.result);

        // if contractABI is not null, execute
        if (contractABI != '') {

          // print ABI to reveal functions, events and other data we can analyze
          // console.log(contractABI)

          // get contractDetails from contractABI + smartAddr
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

          // get totalSupply for given contract
          contractDetails.methods.totalSupply().call({ from: smartAddr },
            function (error, result) {
              console.log("Total Supply: " + result)
          });

          // // get past Transfer events from contract
          // contract.getPastEvents('Transfer', {fromBlock: 13589400, toBlock: 'latest'},
          //   (err, events) => { console.log(events) })

          }

            // else, address does not have verified contract yet
            else {
                console.log("No ABI for " + smartAddr + " yet.");
                //start;
            }

          }); // end of axios get request

    }; // end of getABI function

    // getABI();

  }); // end of server get

  // server post
  app.post("/", function(req, res){
    res.send("...")
  }); // end of server post


  // server port
  app.listen(1503, function(){
    console.log("Server has started on Port 1503.");
  }); // end of server port
