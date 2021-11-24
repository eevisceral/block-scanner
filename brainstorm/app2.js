// init packages, infura, API keys
require('dotenv').config();
const Web3 = require("web3")
const axios = require('axios');
const API_KEY = process.env.etherscanKey;
const INFURA_KEY = process.env.infuraKey;

// create arrays to store block header data
var numArray = [];
var timeArray = [];
var hashArray = [];
var txArray = [];
  // var n = numArray.length;


// init function
function watchCons() {
  const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);
  // subscribe to all new block headers
  var sub = web3.eth.subscribe('newBlockHeaders', function(error, result){
    if (error){
      console.log("notconnected");
      process.exit();
    }
        // store useful block header data
        var blockNum = result.number;
        var blockTime = result.timestamp;
        var blockHash = result.hash;
        // push data to arrays without duplicates
        if (numArray.includes(blockNum) === false) numArray.push(blockNum);
        if (timeArray.includes(blockTime) === false) timeArray.push(blockTime);
        if (hashArray.includes(blockHash) === false) hashArray.push(blockHash);
          console.log("Block Number Array:");
          console.log(numArray);
          console.log("Datetime Array:");
          console.log(timeArray);
          console.log("Hash Array:");
          console.log(hashArray);
      })


  // fires with each new block
  .on('data', async function(data){
    //console.log(data);
    var hashData = await data.hash;
    // store latest block hash & tx count
    const blockData = await web3.eth.getBlock(hashData).then(console.log("Retrieved blockData."));

    var txCount = await web3.eth.getBlockTransactionCount(hashData).then(console.log(txCount + "Total Txs in Block "));
      //console.log(txCount + "Total Txs in Block ");

    // create array of txs within block
    const txArray = await blockData.transactions;
    // var t = txCount - 1;
      console.log("Intrablock Transaction Array: ");
      console.log(txArray);

    // get latest block number from data
    var latestBlock = await blockData.number;
      console.log("Latest Block from Hash: " + latestBlock);

    const txInfo = await web3.eth.getTransaction(hashData).then(console.log("Get Transaction Info from Hash for " + latestBlock));
      //console.log("Get Transaction Info from Hash for " + latestBlock);

    const txFromBlock = await web3.eth.getTransactionFromBlock(hashData).then(console.log("Get Transaction Info from Block for " + latestBlock));
      //console.log("Get Transaction Info from Block for " + latestBlock);

    // get latest tx receipt from tx array
    const txReceipt = await web3.eth.getTransactionReceipt(hashData).then(console.log("Tx Reciept: " + txReceipt));
      //console.log("Retrieving Transaction Reciept for Latest Block " + latestBlock);
      //console.log(txReceipt);

    // check all txs for contract ABIs
    var ADDRESS = txReceipt.contractAddress;

    if(web3.utils.isAddress(ADDRESS)) {
      var contractADDR = ADDRESS;
      console.log("Proceeding to get contract ABI for: " + ADDRESS);
      return
      //return (new getABI());
    }

    else if(!web3.utils.isAddress(ADDRESS)) {
      console.log("Not a contract address.");
      return
      return (new watchCons());
  })

}
watchCons();






        // // else, log and keep searching
        // else if(!web3.utils.isAddress(ADDRESS)) {


    // try {
    //   console.log("Latest Block Number: " + blockHeader.number);
    //   console.log("Timestamp: " + blockHeader.timestamp);
        // console.log("Block Hash: " + blockHeader.hash);




          // // loop for entire length of block tx count
          // for(var t = 0; t < txCount.length; t++) {
          //
          // }

        // increase block increment
        // b++;

        // transaction increment (t)
        // const t = 0;



        //
        // // else, if latest block number is null, log and return
        // else if (latestBlock = '') {
        //   return console.log("Latest block still pending.");
        // }


  // // find contractADDR with verified source code, call etherscan to get contractABI
  // axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=
  //   ${contractADDR}&apikey=${API_KEY}`)
  //   .then(response => {
  //
  //     var contractABI = "";
  //     contractABI = JSON.parse(response.data.result);
  //
  //     if (contractABI != '') {
  //
  //       // print ABI to reveal functions, events and other data we can analyze
  //       console.log(contractABI)
  //       console.log("\n\n")
  //
  //       // get contractDetails from contractABI + contractADDR
  //       const contractDetails = new web3.eth.Contract(contractABI, contractADDR)
  //
  //       // get name for given contract
  //       contractDetails.methods.name().call({ from: contractADDR },
  //         function (error, result) {
  //           console.log("Contract Name: " + result)
  //       });
  //
  //       // get symbol for given contract
  //       contractDetails.methods.symbol().call({ from: contractADDR },
  //         function (error, result) {
  //           console.log("Ticker: " + result)
  //       });
  //
  //       // get totalSupply for given contract
  //       contractDetails.methods.totalSupply().call({ from: contractADDR },
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
  //         console.log(`No ABI contract for ${contractADDR} yet.`);
  //     }
  //   })

  // }
// })



// // if latest block number is not null, execute tx receipt scan
// if (latestBlock != '') {



// // unsubscribes the subscription
// subscription.unsubscribe(function(error, success){
//   if (success) {
//     console.log('Successfully unsubscribed!');
//   }
// });


// // get transaction from specific block hash
// const hash = '0x...'
// web3.eth.getTransactionFromBlock(hash, 2).then(console.log)
