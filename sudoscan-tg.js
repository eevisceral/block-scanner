require('dotenv').config();
const Web3 = require("web3");
const axios = require('axios');

const API_KEY = process.env.etherscanKey2;
const INFURA_KEY = process.env.infuraKey2;
const web3 = new Web3('wss://mainnet.infura.io/ws/v3/' + INFURA_KEY);
const version = web3.version.api;
const TG_BOT = process.env.TG_API;
const TG_CHAT = process.env.chatID;
const TG_ALPHABOT = process.env.ALPHA_TG_API;
const TG_ALPHACHAT = process.env.alphaChatID;

const SUDO_FACTORY = '0xb16c1342e617a5b6e4b631eb114483fdb289c0a4'

// create timeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// get current block number
web3.eth.getBlockNumber()
.then(function (response) {
  var blockNumber = response;
    subscribe(blockNumber);
})
.catch((error) => {
  console.error(error + '\n');
  return
})


// subscribe to sudo factory block logs
function subscribe(blockNumber) {
  var block = blockNumber - 15;

  web3.eth.subscribe('logs', {
    address: SUDO_FACTORY,
    fromBlock: block
  },
  function (error, result) {
    if (error)
      console.log(error);
  })
  .on("connected", function(subscriptionId){
      console.log("Subscription ID: " + subscriptionId + "\nScanning all incoming transactions...");
  })

  .on("data", async (txData) => {
    try {
      var txHash = txData.transactionHash;
      await sleep(10000);
      getInternalTx(txHash);
    }
    catch (error) {
      console.error("Error collecting data from logs... \n");
      console.error(error)
      return
    }
  })
}; //end of subscribe function


// get internal transactions from new tx hashes to find pool address
function getInternalTx(transactionHash) {
  const txnHash = transactionHash;
  console.log("Scanning tx hash: " + txnHash + "\n");

  axios.get("https://api.etherscan.io/api?module=account&action=txlistinternal&txhash="
  + txnHash + "&apikey=" + API_KEY)

  .then(function (response) {
    var result = response.data.result;
    var status = response.data.status[0];

    var data = JSON.stringify(result);
    var clean = JSON.parse(data);

    if (response.status === 200 && status != 0) {
      var addy = clean[0].contractAddress;
      var sender = clean[0].from;
      // var blockDeployed = clean[0].blockNumber;

      if (sender === SUDO_FACTORY) {
        // console.log("Sudo pool address: " + addy + "\nSudo factory: " + sender);
        // console.log("✅  getInternalTx()") //
        getERC721Holdings(addy);
      }
      else {
        // console.log(response);
        console.log("Sender is not sudoswap factory...");
        return
      }
    }

    else if (status === 0) {
      // console.error(response);
      console.error('🚫  getInternalTx() Rate Limited.');
      return
    }

    else {
      // console.error(response);
      // console.error('Null `Internal Transactions` Response.');
      return
    };

  }) // end of .then request

  .catch((error) => {
    console.error(error + '\n');
    return
  })

}; // end of getInternalTx function


// get ERC721 holdings of pool address
function getERC721Holdings(poolAddy) {

  axios.get('https://api.etherscan.io/api?module=account&action=tokennfttx&address='
  + poolAddy + '&page=1&offset=100&sort=asc&apikey=' + API_KEY)

  .then(function (response) {
    var result = response.data.result;
    var status = response.data.status[0];

    var data = JSON.stringify(result);
    var clean = JSON.parse(data);

    if (response.status === 200 && status != 0) {
      var tokenCount = clean.length;
      var collectionAddress = clean[0].contractAddress;
      var tokenName = clean[0].tokenName;
      let block = clean[0].blockNumber;

        console.log("\n🛟  New Sudo Pool: " + poolAddy);
        console.log("🖼  Collection Address: " + collectionAddress);
        console.log("🔗 URL: https://sudoswap.xyz/#/browse/buy/" + collectionAddress);
        console.log("\nCollection Name: " + tokenName);
        console.log("Token IDs: (" + tokenCount + " total)");

        // if (tokenID != '') {
        //   let i = 0;
        //   for (let i = 0; i < tokenCount; i++) {
        //   var tokenID = result[i].tokenID;
        //     console.log(" + " + tokenID);
        //   }
        // }

      if (collectionAddress != '') {
        // console.log("✅  getERC721Holdings()"); //
        checkAge(collectionAddress, block, poolAddy, collectionAddress, tokenName, tokenCount);
      }
    }

    else if (status === 0) {
      // console.error(response);
      console.error('🚫  getERC721Holdings() Rate Limited.');
      return
    }

    else {
      // console.error(response);
      // console.error('Null `ERC721 Holdings` Response.');
      return
    };

  }) // end of .then request

  .catch((error) => {
    console.error(error + '\n');
    return
  })

}; // end of getERC721Holdings function


// check how old the NFT collection is
function checkAge(conAddr, block, poolAddy, collectionAddress, tokenName, tokenCount) {
  var currentBlock = block;
  var contract = conAddr;
  var pool = poolAddy;
  var collection = collectionAddress;
  var name = tokenName;
  var count = tokenCount;

  axios.get('https://api.etherscan.io/api?module=account&action=txlist&address='
  + contract + '&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=' + API_KEY)

  .then(function (response) {
    var result = response.data.result;
    var status = response.data.status[0];

    var data = JSON.stringify(result);
    var clean = JSON.parse(data);

    // determine delta between currentblock and earliestblock
    var earliestBlock = clean[0].blockNumber;
    var delta = (currentBlock - earliestBlock);

      if (response.status === 200 && delta <= 260 && delta > 125) {
        var age = 'Collection Age: Less than 1hr 👀 👀 👀';
        var bDelta = 'Block Δ: ' + delta;
        console.log(age + "\n" + bDelta);
          sendMessageAlphaTG(pool, collection, name, count, age, bDelta);
          sendMessageTG(pool, collection, name, count, age, bDelta);
          return
          // console.log("Sending to Telegram");
          // getABI(contract);
      }

        else if (response.status === 200 && delta <= 125 && delta > 65) {
          var age = 'Collection Age: Less than 30m 🔥🔥🔥';
          var bDelta = 'Block Δ: ' + delta;
          console.log(age + "\n" + bDelta);
            sendMessageAlphaTG(pool, collection, name, count, age, bDelta);
            sendMessageTG(pool, collection, name, count, age, bDelta);
            return
            // console.log("Sending to Telegram");
            // getABI(contract);
        }

        else if (response.status === 200 && delta <= 65) {
          var age = 'Collection Age: Less than 15m 💎💎💎';
          var bDelta = 'Block Delta: ' + delta;
          console.log(age + "\n" + bDelta);
            sendMessageAlphaTG(pool, collection, name, count, age, bDelta);
            sendMessageTG(pool, collection, name, count, age, bDelta);
            return
            // console.log("Sending to Telegram");
            // getABI(contract);
        }

        // else if (response.status === 200 && delta > 260) {
        //   var age = 'Collection Age: Older than 1h 🥱🥱🥱';
        //   var bDelta = 'Block Δ: ' + delta;
        //   console.log(age + "\n" + bDelta);
        //   // console.log("Not sending to Telegram...");
        //   // sendMessageTG(pool, collection, name, count, age, bDelta);
        //   //return
        // }

        else if (response.status === 200 && delta > 260 && delta < 3000) {
          var age = 'Age: Less than ~12hrs 🥱🥱🥱';
          var bDelta = 'Block Δ: ' + delta;
          console.log(age + "\n" + bDelta);
            sendMessageTG(pool, collection, name, count, age, bDelta);
            return
        }

        else if (response.status === 200 && delta >= 6500) {
          var age = 'Age: Older than ~24hrs 💤💤💤';
          var bDelta = 'Block Δ: ' + delta;
          console.log(age + "\n" + bDelta);
            sendMessageTG(pool, collection, name, count, age, bDelta);
            return
        }

        else if (response.status === 200 && delta >= 3000 && delta < 6500) {
          var age = 'Age: Less than ~24hrs 😴😴😴';
          var bDelta = 'Block Δ: ' + delta;
          console.log(age + "\n" + bDelta);
            sendMessageTG(pool, collection, name, count, age, bDelta);
            return
        }

        else if (status === 0) {
          // console.error(response);
          console.error('🚫  checkAge() Rate Limited.');
        return
        }

        else {
          // console.error(response);
          // console.error('Could not check age... \n');
          return
        };

  }) // end of .then request

  .catch((error) => {
    console.error(error + '\n');
    return
  })

}; // end of checkAge function


// // get contract ABI if project is < 1hr old
// function getABI(contract) {
//   var conAddr = contract;
//   var contractABI = "";
//
//   axios.get("https://api.etherscan.io/api?module=contract&action=getabi&address="
//   + conAddr + "&apikey=" + API_KEY)
//
//   .then(response => {
//     var status = response.data.status[0];
//     contractABI = JSON.parse(response.data.result);
//
//     if (contractABI != '' && conAddr != '') {
//       const instance = new web3.eth.Contract(contractABI, conAddr)
//       // console.log(instance);
//
//         // // get maxSupply
//         // instance.methods.maxSupply().call({ from: conAddr },
//         //   function (error, result) {
//         //     console.log("Max Supply: " + result)
//         // });
//         //
//         // // get cost
//         // instance.methods.cost().call({ from: conAddr },
//         //   function (error, result) {
//         //     console.log("Cost: " + result)
//         // });
//         //
//         // // get owner
//         // instance.methods.owner().call({ from: conAddr },
//         //   function (error, result) {
//         //     console.log("Owner: " + result)
//         // });
//
//       console.log("✅  getABI()")
//       return
//       }
//
//       else if (status === 0) {
//         // console.error(response);
//         console.error('🚫  getABI() Rate Limited.');
//         return
//       }
//
//     else {
//         // console.error(response);
//         console.error("Address: " + conAddr + " is not verified...");
//         return
//     }
//
//   }) // end of .then request
//
//   .catch((error) => {
//     console.error(error + '\n');
//     return
//   })
//
//   }; // end of getABI function



  function sendMessageTG(pool, collection, name, count, age, bDelta) {
    var pool = pool;
    var collection = collection;
    var name = name;
    var count = count;
    var age = age;
    var delta = bDelta;

    var message = `| Collection Name: ${name} \n | Token IDs: (${count} total) \n | ${age} \n | ${delta} \n\n | 🛟  New Sudo Pool: ${pool} \n | 🖼  Collection Address: ${collection} \n | 🔗  URL: https://sudoswap.xyz/#/browse/buy/${collection}`;

      axios({
        method: 'post',
        url: `https://api.telegram.org/bot${TG_BOT}/sendMessage`,
        data: {
            chat_id: TG_CHAT,
            text: message,
            // parse_mode: 'HTML',
        }
      })

      .then(data => {
        console.log('✅ Sent to Telegram')
        //return
      })

      .catch(error => {
        console.error('⛔️ Could not send to Telegram')
        //return
      })

  };

  function sendMessageAlphaTG(pool, collection, name, count, age, bDelta) {
    var pool = pool;
    var collection = collection;
    var name = name;
    var count = count;
    var age = age;
    var delta = bDelta;

    var message = `| Collection Name: ${name} \n | Token IDs: (${count} total) \n | ${age} \n | ${delta} \n\n | 🛟  New Sudo Pool: ${pool} \n | 🖼  Collection Address: ${collection} \n | 🔗  URL: https://sudoswap.xyz/#/browse/buy/${collection}`;

      axios({
        method: 'post',
        url: `https://api.telegram.org/bot${TG_ALPHABOT}/sendMessage`,
        data: {
            chat_id: TG_ALPHACHAT,
            text: message,
            // parse_mode: 'HTML',
        }
      })

      .then(data => {
        console.log('✅ Sent to Alpha Telegram')
        //return
      })

      .catch(error => {
        console.error('⛔️ Could not send to Alpha Telegram')
        //return
      })

  };
