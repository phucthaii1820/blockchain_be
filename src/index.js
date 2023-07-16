import express from "express";
import dotenv from "dotenv";
import { myCoin } from "./blockchain.js";
import { createTransaction } from "./transaction.js";
import { createWallet, getWallet, getAllWallet } from "./wallet.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

app.get("/blocks", (req, res) => {
  res.send(myCoin);
});

app.post("/transaction", (req, res) => {
  const { privateKey, fromAddress, toAddress, amount } = req.body;
  createTransaction(privateKey, fromAddress, toAddress, +amount);
  res.send(myCoin);
});

app.post("/mining", (req, res) => {
  const { publicKey } = req.body;
  myCoin.minePendingTransactions(publicKey);
  res.send(myCoin);
});

app.post("/create-wallet", (req, res) => {
  const { username, password } = req.body;
  const wallet = createWallet(username, password);
  res.send(wallet);
});

app.get("/wallet", (req, res) => {
  const { publicKey } = req.query;
  const wallet = getWallet(publicKey);
  res.send(wallet);
});

app.get("/get-all-wallet", (req, res) => {
  res.send(getAllWallet());
});

// app.get("/peers", (req, res) => {
//   res.send(
//     getSockets().map(
//       (s: any) => s._socket.remoteAddress + ":" + s._socket.remotePort
//     )
//   );
// });
// app.post("/addPeer", (req, res) => {
//   connectToPeers(req.body.peer);
//   res.send();
// });

app.listen(port, () => {
  console.log("Listening http on port: " + port);
});
