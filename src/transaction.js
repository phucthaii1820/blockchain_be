import CryptoJS from "crypto-js";
import pkg from "elliptic";
import { myCoin } from "./blockchain.js";

const { ec } = pkg;
const EC = new ec("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.signature = null;
    this.timestamp = Date.now();
  }

  calculateHash() {
    return CryptoJS.SHA256(
      this.fromAddress + this.toAddress + this.amount
    ).toString();
  }

  sign(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("Bạn không thể ký giao dịch cho ví khác!");
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, "base64");
    this.signature = sig.toDER("hex");
  }

  isValid() {
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error("Không có chữ ký số trong giao dịch này");
    }

    const publicKey = EC.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

const createTransaction = (privateKey, toAddress, fromAddress, amount) => {
  const tx = new Transaction(toAddress, fromAddress, amount);
  tx.sign(EC.keyFromPrivate(privateKey));
  myCoin.addTransaction(tx);
};

export { Transaction, createTransaction };
