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

// subscribe to block logs
var subs = web3.eth.subscribe('logs', function (error, result) {
  if (!error)
    console.log(result);
})
  // fires once when successfully subscribed
  .on("connected", function(subscriptionId){
      console.log("Subscription ID: " + subscriptionId);
  })
  // collects data
  .on("data", function (log) {
    console.log(log);
  })
  // catches errors
  .catch((err) => {
    console.log("Whoops! Ran into a problem.")
  });
  
  // unsubscribes the subscription
subscription.unsubscribe(function(error, success){
  if(success)
    console.log('Successfully unsubscribed!');
  });
