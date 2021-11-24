  // init packages, infura node, API keys
  require('dotenv').config();
  const Web3 = require("web3")
  const axios = require('axios');
  const API_KEY = process.env.etherscanKey;
  const INFURA_KEY = process.env.infuraKey;
  const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY)

  // create array to store block data
  var numArray = [];
  var b = 0;

  function parser() {
    // subscribe to all new block headers
    var subscription = web3.eth.subscribe('newBlockHeaders')
      subscription.subscribe((error, result) => {
        if (!error)
        // for(var t = 0; t = txCount - 1; t++) {
          var blockData = result
          console.log(blockData.number)

          // store latest block num, get tx count, and create array of txs
          const curBlock = web3.eth.getBlock(blockData.number);
          const txArray = curBlock.transactions;

          var blockNum = blockData.number;
          var txCount = web3.eth.getBlockTransactionCount(blockNum);

          // push data to array without duplicates
          if (numArray.includes(blockNum) === false) numArray.push(blockNum);
            console.log(numArray);

            // if latest block number is not null, execute tx receipt scan
            if (curBlock != '') {
               console.log("Block " + blockNum);
               console.log("Total Txs in Block: " + txCount);
               console.log("Scanning Tx #" + b + " / " + txCount);

            // get latest tx receipt from tx array
            const txReceipt = web3.eth.getTransactionReceipt(txArray[b]);
            var b = b++;

              // check all txs for contract ABIs
              var ADDRESS = txReceipt.contractAddress;
                if(web3.utils.isAddress(ADDRESS)) {
                  console.log("Proceeding to get contract ABI for: " + ADDRESS);
                  var contractADDR = ADDRESS;
                  return new Promise(async(resolve, reject) => {
                    console.log("Waiting for getABI");
                    await getABI();
                    console.log("Resolving promise!")
                    resolve();

                })
            }
        // }
    }
  })

  .on("data", async (blockHeader) => {
      try {

        async function getABI() {
          // find a new contract address with verified source code, call etherscan to get contract ABI
          axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
          + contractADDR + "&apikey=" + API_KEY)
          .then(response => {

              // parse JSON format of response
              var contractABI = "";
              contractABI = JSON.parse(response.data.result);

              // if contract ABI is not null, execute
              if (contractABI != '') {

                // log ABI to reveal functions, events and other data we can analyze
                console.log("Successfully logged contract ABI for " + contractADDR);
                  // console.log(contractABI);

                // get contract details from ABI & address in order to call methods
                const contractDetails = new web3.eth.Contract(contractABI, contractADDR)

                // get name for given contract
                contractDetails.methods.name().call({ from: contractADDR },
                  function (error, result) {
                    console.log("Contract Name: " + result)
                });

                // get symbol for given contract
                contractDetails.methods.symbol().call({ from: contractADDR },
                  function (error, result) {
                    console.log("Ticker: " + result)
                });

                // // get past Transfer events from contract
                // contract.getPastEvents('Transfer', {fromBlock: 13589400, toBlock: 'latest'},
                //   (err, events) => { console.log(events) })

              }

                // else, address does not have verified contract yet
                return console.log("No verified ABI contract for " + contractADDR + " yet.");
          })
        };


        }
    catch (error) {}
  })
};

parser();
