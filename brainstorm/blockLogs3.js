  // init packages, infura, API keys
  require('dotenv').config();
  const Web3 = require("web3")
  const axios = require('axios');
  const API_KEY = process.env.etherscanKey;
  const INFURA_KEY = process.env.infuraKey;

  // create arrays to store data
  var numArray = [];
  var txArray = [];
  var txHashArray = [];
  var allTxArray = [];
  var b = 0;


  // // function getBlockData() {
    const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);

    // subscribe to new block headers
    const subscription = web3.eth.subscribe('newBlockHeaders')
    subscription.subscribe((error, result) =>{
      if (error) console.log("Error getting new block header.")
    })

    // fires once when successfully subscribed
    .on("connected", function(subscriptionId){
        console.log("Subscription ID: " + subscriptionId);
    })

    // collect data
    .on("data", async (data1) => {
      try {

        var currentBlock = await web3.eth.getBlockNumber();
        var blockMinusOne = (currentBlock - 1);
        var blockMinusThirty = (currentBlock - 30);

        // push data to array without duplicates
        if (numArray.includes(currentBlock) === false) numArray.push(currentBlock);

        // get transaction count
        var txCount = await web3.eth.getBlockTransactionCount(currentBlock);

        // create array of transactions in block
        var currentBlockData = await web3.eth.getBlock(currentBlock);
        var txArray = currentBlockData.transactions;
        // console.log(txArray);
        // scanContracts();

      }

      catch (error) {
        console.log(error);
      }


    }) // end of new block header subscription
//} // end of getBlockData function




  // function scanContracts() {
  // const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);

    // subscribe to block logs
    const subs = web3.eth.subscribe('logs', {
      // fromBlock: getBlockData
    },
    function (error, result) {
      if (error) console.log("There was an error.");
    })

    // collects data
    .on("data", async (data2) => {
      try {
        console.log(txArray.length);
        // loop for entire length of block tx count
        for(var t = 0; t < txArray.length - 1; t++) {

           // get latest tx receipt from all tx array
           var txReceipt = await web3.eth.getTransactionReceipt(txArray[b]);
           // console.log("Total Txs in Block: " + txns.length);
           // console.log("Scanning Tx #" + b + " / " + txns.length);
           var b = b++;

           // check all txs for contract ABIs
           var ADDRESS = txReceipt.contractAddress;

           if(web3.utils.isAddress(ADDRESS)) {
             var contractADDR = ADDRESS;
             console.log("Proceeding to get contract ABI for: " + ADDRESS);
             return
             getABI();
           }

           else if(!web3.utils.isAddress(ADDRESS)) {
             console.log("Not a contract address.");
           }

           else {
             console.log("No address found..");
           }

         }
      }
      catch (error) {
        console.log(error);
      }




  }) // end of logs subscription
//} // end of scanContracts function






const getABI = async () => {
  const smartAddr = await scanContracts()

  axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
  + smartAddr + "&apikey=" + API_KEY).then(response => {

    // parse json response
    var contractABI = "";
    contractABI = JSON.parse(response.data.result);

    // if contractABI is not null, execute
    if (contractABI != '') {

      // print ABI to reveal functions, events and other data we can analyze
      //console.log(contractABI)

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
    }; // end of async getABI function



//getBlockData();
// scanContracts();
