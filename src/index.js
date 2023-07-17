import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

const allowlist = ["http://localhost:3000"];
const corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));

app.get("/blocks", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Lấy danh sách khối thành công",
    data: myCoin.chain,
  });
});

app.get("/block/:hash", (req, res) => {
  const { hash } = req.params;
  const block = myCoin.getBlockByHash(hash);
  if (!block) {
    res.status(400).send({
      success: false,
      message: "Khối không tồn tại",
      data: null,
    });
  }
  res.status(200).send({
    success: true,
    message: "Lấy khối thành công",
    data: block,
  });
});

app.post("/transaction", (req, res) => {
  const { privateKey, fromAddress, toAddress, amount } = req.body;
  try {
    createTransaction(privateKey, fromAddress, toAddress, +amount);
    res.status(200).send({
      success: true,
      message: myCoin,
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

app.get("/pending-transactions", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Lấy danh sách giao dịch thành công",
    data: myCoin.pendingTransactions,
  });
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

app.get("/check-mining", (req, res) => {
  res.status(200).send({
    success: true,
    data: myCoin?.pendingTransactions?.length,
  });
});

app.post("/create-wallet", async (req, res) => {
  const { username, password } = req.body;
  try {
    const wallet = await createWallet(username, password);
    await myCoin.rewardWhenCreateAccount(wallet.publicKey);
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
