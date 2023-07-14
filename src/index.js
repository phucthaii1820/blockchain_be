import express from "express";
import dotenv from "dotenv";
// import bodyParser from "body-parser";
import { myCoin } from "./blockchain.js";

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
  const { fromAddress, toAddress, amount } = req.body;
  console.log(req.body);
  myCoin.createTransaction({
    fromAddress,
    toAddress,
    amount,
  });
  res.send(myCoin);
});

app.get("/mine", (req, res) => {
  myCoin.minePendingTransactions("my-address");
  res.send(myCoin);
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
