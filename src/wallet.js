import pkg from "elliptic";
import CryptoJS from "crypto-js";
import { myCoin } from "./blockchain.js";

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

const createWallet = (username, password) => {
  const wallet = new Wallet();
  wallet.username = username;
  wallet.password = password;
  wallet.privateKey = CryptoJS.SHA256(Math.random().toString()).toString();
  const key = EC.keyFromPrivate(wallet.privateKey, "hex");
  wallet.publicKey = key.getPublic("hex");
  listWallet.push(wallet);
  return wallet;
};

const getWallet = (publicKey) => {
  let wallet = listWallet.find((wallet) => wallet.publicKey === publicKey);
  wallet.balance = myCoin.getBalanceOfAddress(publicKey) || 0;
  return wallet;
};

const getAllWallet = () => {
  for (const wallet of listWallet) {
    wallet.balance = myCoin.getBalanceOfAddress(wallet.publicKey) || 0;
  }
  return listWallet;
};

export { createWallet, getWallet, listWallet, getAllWallet };
