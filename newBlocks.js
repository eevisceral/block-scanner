// init packages, infura, API keys
require('dotenv').config();
const Web3 = require("web3")
const axios = require('axios');

// .env variables
const API_KEY = process.env.etherscanKey;
const INFURA_KEY = process.env.infuraKey;

// connect to infura
var web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);

// create arrays to store data
var txArray = [];
var txHashArray = [];

// subscribe to all new block headers
start = web3.eth.subscribe('newBlockHeaders', function (error, result) {})

  // fires once when successfully subscribed
  .on("connected", function(subscriptionId){
      console.log("Connected to Web3.") ;
      console.log("Subscription ID: " + subscriptionId);
  })

  // fires on all new blocks
  .on("data", function (blockHeadData) {

  // // get last 10 blocks
  // web3.eth.getBlockNumber().then((latest) => {
  //   for (let i = 1; i < 10; i++) {

  // get data from new block
  web3.eth.getBlock('latest', true)
  .then(function (blockData) {
      // create array of all txs within block
      txArray = blockData.transactions;
        // console.log("Intrablock Transaction Array: ");
        // console.log(txArray);

      // get latest block number
      latestBlock = blockData.number;
        console.log("Latest Block Number: " + latestBlock);


  // function to count number of transactions in block
  web3.eth.getBlockTransactionCount(latestBlock)
  .then(function (txCount) {
      console.log("Total Txs in Block: " + txCount);



  //get transaction info from latest block
  web3.eth.getTransactionFromBlock(latestBlock, 2)
  .then(function (txFromBlock) {

      // console.log(txFromBlock);
      latestBlockNum = txFromBlock.blockNumber
      txHash = txFromBlock.hash
      console.log("Block Number " + latestBlock)
      console.log("Transaction Info from Block Number " + latestBlockNum)
      // console.log("Transaction Hash: " + txHash);

      // push tx hashes to array
      if (txHashArray.includes(txHash) === false) txHashArray.push(txHash);
      txHashArrayLength = txHashArray.length;
      console.log("Transaction Hash Array Length: " + txHashArrayLength);
      // console.log(txHashArray);

  // get latest tx receipt from transcation hash
  web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
    if (error) {
      reject(error);
    } else if (receipt == null) {
      setTimeout(
        () => asyncTxReceipt(resolve, reject),
        interval ? interval : 500);
    } else {
      console.log(receipt);

    }
  })
  .then(function (analyzeTxReceipt) {

      conAddr = analyzeTxReceipt.contractAddress;
      console.log("Analyzing Tx Receipt for " + conAddr);
      console.log('\n');

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
          return

        }

      };

    })

      })

      .catch((err) => {

        console.log("Whoops! Error getting transaction info from block.")
        console.log('\n');

      });


    });


  })

})


async function getABI() {

// Find smartAddr with verified source code, call etherscan to get contractABI
axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
+ smartAddr + "&apikey=" + API_KEY).then(response => {

  // parse json response
  var contractABI = "";
  contractABI = JSON.parse(response.data.result);

  // if contractABI is not null, execute
  if (contractABI != '') {

    // print ABI to reveal functions, events and other data we can analyze
    //console.log(contractABI)
    //console.log("\n\n")

    // get contractDetails from contractABI + smartAddr
    const contractDetails = new web3.eth.Contract(contractABI, smartAddr)
    //console.log(contractDetails);

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

    });
  };




// start.unsubscribe(function (error, success) {
//     if (success)
//         console.log('Successfully unsubscribed!');
// });


//smartAddr = process.env.testADDR;
//async function getABI() {
//};


//start;
//getABI();
