import express from "express";
import dotenv from "dotenv";
import { myCoin } from "./blockchain.js";
import { createTransaction } from "./transaction.js";
import {
  createWallet,
  getWallet,
  getAllWallet,
  loginWallet,
} from "./wallet.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", false);

  // Pass to next layer of middleware
  next();
});

app.get("/blocks", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Lấy danh sách khối thành công",
    data: myCoin.chain,
  });
});

app.post("/transaction", (req, res) => {
  const { privateKey, fromAddress, toAddress, amount } = req.body;
  try {
    createTransaction(privateKey, fromAddress, toAddress, +amount);
    res.status(200).send(myCoin);
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

app.get("/transaction-first", (req, res) => {
  const { publicKey } = req.query;
  try {
    const transactions = myCoin.createTransactionFirst(publicKey);
    res.status(200).send({
      success: true,
      message: "Tạo giao dịch thành công",
      data: true,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

app.post("/mining", (req, res) => {
  const { publicKey } = req.body;
  try {
    myCoin.minePendingTransactions(publicKey);
    res.status(200).send({
      success: true,
      message: "Đào khối thành công",
      data: myCoin,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

app.post("/create-wallet", async (req, res) => {
  const { username, password } = req.body;
  try {
    const wallet = await createWallet(username, password);
    res.status(200).send({
      success: true,
      message: "Tạo ví thành công",
      data: wallet,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const wallet = await loginWallet(username, password);
    res.status(200).send({
      success: true,
      message: "Đăng nhập thành công",
      data: wallet,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

app.get("/wallet", (req, res) => {
  const { publicKey } = req.query;
  try {
    const wallet = getWallet(publicKey);
    res.status(200).send({
      success: true,
      message: "Lấy ví thành công",
      data: wallet,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

app.get("/get-all-wallet", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Lấy danh sách ví thành công",
    data: getAllWallet(),
  });
});

app.listen(port, () => {
  console.log("Listening http on port: " + port);
});
