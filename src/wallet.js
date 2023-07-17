import pkg from "elliptic";
import CryptoJS from "crypto-js";
import { myCoin } from "./blockchain.js";
import argon2 from "argon2";

const { ec } = pkg;
const EC = new ec("secp256k1");

class Wallet {
  constructor() {
    this.publicKey = "";
    this.privateKey = "";
    this.balance = 0;
    this.username = "";
    this.password = "";
  }
}

let listWallet = [];

const createWallet = async (username, password) => {
  if (listWallet.find((wallet) => wallet.username === username)) {
    throw new Error("Tài khoản đã tồn tại");
  }

  const wallet = new Wallet();
  wallet.username = username;
  wallet.password = await argon2.hash(password);
  wallet.privateKey = CryptoJS.SHA256(Math.random().toString()).toString();
  const key = EC.keyFromPrivate(wallet.privateKey, "hex");
  wallet.publicKey = key.getPublic("hex");
  listWallet.push(wallet);
  return wallet;
};

const getWallet = (publicKey) => {
  let wallet = listWallet.find((wallet) => wallet.publicKey === publicKey);
  if (!wallet) {
    throw new Error("Ví không tồn tại");
  }
  wallet.balance = myCoin.getBalanceOfAddress(publicKey) || 0;
  return wallet;
};

const getAllWallet = () => {
  for (const wallet of listWallet) {
    wallet.balance = myCoin.getBalanceOfAddress(wallet.publicKey) || 0;
  }
  return listWallet;
};

const loginWallet = async (username, password) => {
  const wallet = listWallet.find((wallet) => wallet.username === username);
  if (!wallet) {
    throw new Error("Username hoặc mật khẩu không chính xác");
  }
  if (!(await argon2.verify(wallet.password, password))) {
    throw new Error("Username hoặc mật khẩu không chính xác");
  }
  return wallet;
};

export { createWallet, getWallet, listWallet, getAllWallet, loginWallet };
