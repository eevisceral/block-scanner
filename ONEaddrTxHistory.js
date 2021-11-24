const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");

const hmy_ws = new Harmony("wss://ws.s0.t.hmny.io", {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyMainnet,
});

const hmy = new Harmony("https://api.s0.t.hmny.io", {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyMainnet,
});

// subscribing to latest header
let headers = hmy_ws.blockchain.newBlockHeaders();
headers.on("data", function (res, err) {
  if (err) {
    console.log(err);
  }
  console.log(res);
});

// getting history txns of a public address
(async function () {
  let options = {
    address: "one15vlc8yqstm9algcf6e94dxqx6y04jcsqjuc3gt",
    pageIndex: 0,
    pageSize: 1,
    fullTx: true,
    txType: "ALL",
    order: "ASC",
  };
  const response = await hmy.messenger.send(
    "hmyv2_getTransactionsHistory",
    [options],
    hmy.chainType,
    hmy.chainId
  );
  console.log(response.result);
});

// getting past events of a contract address
(async function () {
  let options = {
    fromBlock: "0xF11551",
    toBlock: "0xF11551",
    address: "0x9b68bf4bf89c115c721105eaf6bd5164afcc51e4",
  };

  const logs = await hmy_ws.messenger.send(
    "hmy_getLogs",
    [options],
    hmy_ws.chainType,
    hmy_ws.chainId
  );
  console.log(logs);
})();
