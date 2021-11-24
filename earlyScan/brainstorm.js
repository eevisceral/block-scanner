
// example format:
  // subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {})
  //     .on("data", function (transactionHash) {
  //         web3.eth.getTransaction(transactionHash)
  //         .then(function (transaction) {
  //             createNode(transaction.from, transaction.to);
  //         });
  //     })




// Contract scraper WIP.

async function scanTxs() {

  // count no. of txs and create array
  const latestBlock = await web3.eth.getBlock('latest');
  const txCount = await web3.eth.getBlockTransactionCount('latest');
  const txArray = await latestBlock.transactions;

  // loop until reaches length of the array
  for(var i = 0; i < txCount; i++) {
    try {
      console.log("Scanning tx #" + i + " / " + txCount);

      // // get latest block number and tx count from hash
      // const latestBlock = await web3.eth.getBlock(numArray[t]);
      // const txCount = await web3.eth.getBlockTransactionCount(numArray[t]);

      const txReceipt = await web3.eth.getTransactionReceipt(txArray[i]);

        // check which addresses have contract ABIs
        const ADDRESS = txReceipt.contractAddress;
          if(web3.utils.isAddress(ADDRESS)) {
            console.log("Proceeding to get contract ABI for: " + ADDRESS);
            const contractADDR = ADDRESS
            getABI();
          }

        // else, keep searching
        else if(!web3.utils.isAddress(ADDRESS)) {
          console.log("Not a contract address.");
        }

    // catch errors
    } catch (err) {
      console.error(err);
    }
  }
};




async function getABI() {
// find contractADDR with verified source code, call etherscan to get contractABI
axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=
  ${contractADDR}&apikey=${API_KEY}`)
  .then(response => {
    var contractABI = "";
    contractABI = JSON.parse(response.data.result);
    if (contractABI != '') {

      // print ABI to reveal functions, events and other data we can analyze
      console.log(contractABI)
      console.log("\n\n")

      // get contractDetails from contractABI + contractADDR
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

        // get totalSupply for given contract
        contractDetails.methods.totalSupply().call({ from: contractADDR },
          function (error, result) {
            console.log("Total Supply: " + result)
        });

        // // get past Transfer events from contract
        // contract.getPastEvents('Transfer', {fromBlock: 13589400, toBlock: 'latest'},
        //   (err, events) => { console.log(events) })

      }

      // else, no verified contract yet
      else {
          console.log(`No ABI contract for ${contractADDR} yet.`);
        }

  })
  // catch errors
  .catch(error => {
      console.log(error);
  });
}


// run script
scanTxs();
getABI();



// Notes...

function asyncTimeout(delay) {
    return (new Promise(resolve => {setTimeout(() => resolve(delay), delay)}))
        .then(d => `Waited ${d} seconds`);
}

function asyncFetch(url) {
    return fetch(url)
        .then(response => (response.text()))
        .then(text => `Fetched ${url}, and got back ${text}` );
}

















// Scrap work...


numArray.push(blockNum);
timeArray.push(blockTime);
hashArray.push(blockHash);



if (!error) {
  console.log(result);

  return;
}


console.error(error);
})


// fires once when successfully subscribed
.on("connected", function(subscriptionId){
    console.log("Subscription ID: " + subscriptionId);
})

  subscription.subscribe((error, result) => {
    if (error) console.log(error)
    })

    else if (!error) {
        console.log("Block Number: " + result.number);
        console.log("Timestamp: " + result.timestamp);
        console.log("Block Hash: " + result.hash);
        return;
    }
    console.error(error);
})


// fires on each incoming blockHeader
.on("data", function(blockHeader){






async function lookBack() {
var bnArray = [];
var e = 1

// get latest 10 blocks
// const latestBlock = await web3.eth.getBlock('latest');
web3.eth.getBlockNumber().then((latest) => {
  for (var n = 0; n < 10; n++) {
    web3.eth.getBlock(latest - e).then(bnArray.push(e))
  }
})
  try {
    console.log("Getting block number " + e + ".");
    const latestBlock = web3.eth.getBlock(latest - n).then(bnArray.push(e));
    e++;
    console.log(bnArray);

} catch (err) {
  console.error(err);
}
lookBack();





const currentBlock = await web3.eth.getBlockNumber().then(console.log);





// get latest block, count number of txs, then create array of txs within
const latestBlock = await web3.eth.getBlock('latest');
const txCount = await web3.eth.getBlockTransactionCount('latest');
const txArray = await latestBlock.transactions;






async function logPastBlocks() {
const START_BLOCK = currentBlock - 10;
console.log("start" + START_BLOCK);

for(var n = START_BLOCK; n >= currentBlock - 1; n++) {
  try {

   const pastLogs = await web3.eth.getPastLogs(START_BLOCK);
   const pastLogsTxCount = await web3.eth.getBlockTransactionCount(START_BLOCK, 'latest');
   const pastLogsTxArray = await pastLogs.transactions;

   console.log("Scanning tx #" + n + " / " + pastLogsTxCount);
   const pastLogsTxReceipt = await web3.eth.getTransactionReceipt(pastLogsTxArray[n]);
   // catch errors
   } catch (err) {
     console.error(err);
   }
 }
}
logPastBlocks();

//
// var subscription = web3.eth.subscribe('newBlockHeaders')
// subscription.subscribe((error, result) => {


// else, if latest block number is null, log and return
  else if (blockData = '') {
  return console.log("Latest block still pending.");
};
          //
          //
          //
          //       // else, log and keep searching
          //       // else if(!web3.utils.isAddress(ADDRESS)) {
          //         return console.log("Not a contract address.");
          //       }
          //   }
          //
          //   // else, if latest block number is null, log and return
          //   // else if (blockData = '') {
          //     return console.log("Latest block still pending.");
          //   };
          // // };



          // .then(console.log())
          // .catch(error => console.log("Error caught!"))






  // // get transaction from specific block hash
  // const hash = '0x...'
  // web3.eth.getTransactionFromBlock(hash, 2).then(console.log)



    // // loop for entire length of block tx count
    // for(var t = 0; t < txCount.length; t++) {

        // increase increment
        // t++;

        // transaction increment (t)
        // const t = 0;


      // // if latest block number is not null, execute tx receipt scan
      // if (latestBlock != '') {

      // // else, if latest block number is null, log and return
      // else if (latestBlock = '') {
      //   return console.log("Latest block still pending.");
      // }



      //
      //
      //
      //
      //
      //
      // // check all txs for contract ABIs
      // if(web3.utils.isAddress(conAddr)) {
      //   smartAddr = conAddr
      //   console.log("Proceeding to get contract ABI for: " + smartAddr);
      //   //return (new getABI());
      //
      // }
      //
      // // else, log and keep searching
      // else if(!web3.utils.isAddress(conAddr)) {
      //
      //   console.log("Not a contract address.");
      //
      // }






    // web3.utils.isAddress(conAddr)
    // .then(function (conCheck) {
    //
    //     if (conCheck === false) {
    //
    //       smartAddr = conAddr;
    //       console.log("Proceeding to get contract ABI for: " + smartAddr);
    //       //return (new getABI());
    //
    //     }
    //
    //     else {
    //
    //       console.log(smartAddr + " is not a contract address.");
    //
    //     }
    //
    // })
  // });






    // // get transaction info from tx hash
    // web3.eth.getTransaction(hashData)
    // .then(function (txInfo) {
    //   console.log("Get Transaction Info from Hash for " + latestBlock)
    // });




//saving files with fs

      // try {
      //   var data1 = JSON.stringify(contractABI);
        // var data2 = contractDetails;
        // var data3 = contractDetails.methods;
        //   fs.writeFile(`logs/c${t}/contractABI${t}.txt`, data1, (error) => {})
        // } catch (err) {
        //   console.error(err)
        // }
        // fs.writeFile(`logs/c${t}/conDetails${t}.txt`, data2, (error) => {
        //   if (error) throw err;
        // })
        // fs.writeFile(`logs/c${t}/conMethods${t}.txt`, data3, (error) => {
        //   if (error) throw err;
        // })
