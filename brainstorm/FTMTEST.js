  // init packages
  require('dotenv').config();
  const Web3 = require("web3");
  const axios = require('axios');
  const fs = require('fs');
  // const express = require("express");
  // const { ethers } = require('ethers');

  // connect to web3 websocket
  const API_KEY = process.env.ftmscanKey;
  const MAIN_URL = 'wss://wsapi.fantom.network/';
  const TEST_URL = 'wss://wsapi.testnet.fantom.network/';
  const TEST_ADDR = process.env.ftmtest;

  const web3 = new Web3(new Web3.providers.WebsocketProvider(MAIN_URL))
  const version = web3.version.api;


  axios.get("https://api.ftmscan.com/api?module=contract&action=getabi&address="
  + TEST_ADDR + "&apikey=" + API_KEY)

  .then(function (response) {

    var contractABI = "";
    // console.log(response.data.result);
    var res = response.data.result;

    if (res != '') {

      contractABI = JSON.parse(res);
      console.log(contractABI);

      // get contract details
      const contractDetails = new web3.eth.Contract(contractABI, TEST_ADDR)
        // console.log(contractDetails);

      // get name for given contract
      contractDetails.methods.name().call({ from: TEST_ADDR },
        function (error, result) {
          console.log("Contract Name: " + result)
            console.log('\n');
      });




    }
    else if (res = '') {
      console.log('result is blank')
    }
    else {
      console.log('error')
    };





  });
