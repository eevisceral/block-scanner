require('dotenv').config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");


const app = express();


app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
  res.sendFile(__dirname + "/app1index.html");
});


app.post("/", function(req,res){
  const query = req.body.address;
  const apiKey = process.env.EtherscanKey;

  const url = "https://api.etherscan.io/api?module=account&action=balance&address="
    + query + "&tag=latest&apikey=" + apiKey;

  https.get(url, function(response){
    console.log(response.statusCode);

    response.on("data", function(data){
        const ethData = JSON.parse(data)
        const result = ethData.result
        const message = ethData.message
        const ethResult = result / 1000000000000000000
        const gweiResult = result / 1000000000

        res.write("<h1>The address balance is " + ethResult + " ETH.</h1>");
        res.write(" <p>(" + gweiResult + " GWEI).</p>");
        res.send()
    })
  })
})


app.listen(3000, function() {
  console.log("Running on localhost:3000");
})
