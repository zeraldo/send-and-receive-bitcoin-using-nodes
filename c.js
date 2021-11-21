// const http = require('http');
// const hostname = '127.0.0.1';
// const port = 3000;
// const server = http.createServer((req, res) => {
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('Ola Mundo!\nBem vindo ao nodejs');
// });
// server.listen(port, hostname, () => {
  // console.log(`Server running at http://${hostname}:${port}/`);
// });
//Modulo de bitcoin

const axios = require("axios");
const bitcore = require("bitcore-lib");

const express = require("express");
const app = express();

const store = require("store");

const util = require('util');
app.get('/', function (req, res) {
   // console.log("Zeraldo Zua");
	var rcvaddress = req.query.rcvaddress;
	var amount = req.query.amount;
	var amountToSend = amount;
	///res.send('Estamos a enviar para ' + rcvaddress + ' uma quantia de ' + amount);
	
	store.set('rcvaddress', rcvaddress);
	
	store.set('amount', Math.round(req.query.amount));
	var amount = Math.round(req.query.amount);
	
const sendBitcoin = async (rcvaddress, amount) => {
  const sochain_network = "BTCTEST";
  const privateKey = "93F2mUJPKbXW8Q9cMNz4ZmpsjgTbNjrMeCaUesTPE7k1DFhSmnk";
  const sourceAddress = "mtVE8anM63kQcgKUC6oQQD9K6xiV4wsr7q";
  //const satoshiToSend = amountToSend * 100000000;
  const satoshiToSend = store.get('amount');
  let fee = 0;
  let inputCount = 0;
  let outputCount = 2;
  const utxos = await axios.get(
    `https://sochain.com/api/v2/get_tx_unspent/BTCTEST/mtVE8anM63kQcgKUC6oQQD9K6xiV4wsr7q`
  );
  const transaction = new bitcore.Transaction();
  let totalAmountAvailable = 0;

  let inputs = [];
  utxos.data.data.txs.forEach(async (element) => {
    let utxo = {};
    utxo.satoshis = Math.floor(Number(element.value) * 100000000);
    utxo.script = element.script_hex;
    utxo.address = utxos.data.data.address;
    utxo.txId = element.txid;
    utxo.outputIndex = element.output_no;
    totalAmountAvailable += utxo.satoshis;
    inputCount += 1;
    inputs.push(utxo);
  });

  transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
  // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte

  // fee = transactionSize * 20
  // if (totalAmountAvailable - satoshiToSend - fee  < 0) {
    // throw new Error("Balance is too low for this transaction");
  // }
   fee = 550;
   
  //Set transaction input
  transaction.from(inputs);

  // set the recieving address and the amount to send
  //transaction.to(store.get('rcvaddress'), store.get('amount'));

  transaction.to(store.get('rcvaddress'), store.get('amount'));

  // Set change address - Address to receive the left over funds after transfer
  transaction.change("mtVE8anM63kQcgKUC6oQQD9K6xiV4wsr7q");

  //manually set transaction fees: 20 satoshis per byte
  transaction.fee(276);

  // Sign transaction with your private key
  transaction.sign("93F2mUJPKbXW8Q9cMNz4ZmpsjgTbNjrMeCaUesTPE7k1DFhSmnk");

  // serialize Transactions
  const serializedTransaction = transaction.serialize();
  // Send transaction
  const result = await axios({
    method: "POST",
    url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
    data: {
      tx_hex: serializedTransaction,
    },
  });
 // console.log(result.data.data.txid);
  res.send(result.data.data.txid);
  return result.data.data;
 // console.log(result.data.data);
};

sendBitcoin();

   // res.send(util.inspect(req.query));
})

app.listen(3000);