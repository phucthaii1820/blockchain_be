import pkg from "elliptic";
import CryptoJS from "crypto-js";
import { Transaction } from "./transaction.js";

const { ec } = pkg;
const EC = new ec("secp256k1");

// in seconds
const BLOCK_GENERATION_INTERVAL = 100;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

class Block {
  constructor(index, timestamp, transactions, previousHash = "", difficulty) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.difficulty = difficulty;
    this.nonce = 0;
  }

  calculateHash() {
    return CryptoJS.SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Khối đã được đào: " + this.hash);
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 0;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0", 0);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getDifficulty = () => {
    const latestBlock = this.getLatestBlock();
    if (
      latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
      latestBlock.index !== 0
    ) {
      return this.getAdjustedDifficulty(latestBlock, this.chain);
    } else {
      return latestBlock.difficulty;
    }
  };

  getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock =
      aBlockchain[aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected =
      BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  };

  minePendingTransactions(miningRewardAddress) {
    if (this.pendingTransactions.length === 0) {
      throw new Error("Không có giao dịch nào để đào!");
    }
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.getLatestBlock().index + 1,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash,
      this.getDifficulty()
    );
    block.mineBlock(this.getDifficulty());

    console.log("Khối đã được đào thành công!");
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  createTransactionFirst(fromAddress) {
    const rewardTx = new Transaction(null, fromAddress, 900);
    this.pendingTransactions.push(rewardTx);

    this.minePendingTransactions(fromAddress);
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Giao dịch phải có người gửi và người nhận!");
    }

    if (!transaction.isValid()) {
      throw new Error("Không thể thêm giao dịch không hợp lệ vào blockchain!");
    }

    let currentAmount = this.getBalanceOfAddress(transaction.fromAddress);
    for (const tx of this.pendingTransactions) {
      if (tx.fromAddress === transaction.fromAddress) {
        currentAmount -= tx.amount;
      }
    }
    if (currentAmount < transaction.amount) {
      throw new Error(
        "Số dư trong ví của bạn không đủ để thực hiện giao dịch này!"
      );
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// Tạo ra một blockchain mới
const myCoin = new BlockChain();

// // Tạo ra hai khóa cho hai ví khác nhau
// const myKey = EC.keyFromPrivate(
//   "e1ebe6dcafe8b3c7b05b8e4a8a2f9f3fcbf39f724d9f5b2bea1c9d3e7e9fdd1"
// );
// const myWalletAddress = myKey.getPublic("hex");

// const yourKey = EC.keyFromPrivate(
//   "9e2b9e3b6f9f9b3c9a6d8f7e5c4b2a1d9c8b7a6d5e4f3c2b1a0d9e8f7c6b5a4"
// );
// const yourWalletAddress = yourKey.getPublic("hex");

// // Tạo 100 giao dịch từ ví của tôi đến ví của bạn
// for (let i = 0; i < 10000; i++) {
//   const tx1 = new Transaction(myWalletAddress, yourWalletAddress, 10);
//   tx1.sign(myKey);
//   myCoin.addTransaction(tx1);

//   myCoin.minePendingTransactions(myWalletAddress);
// }

export { myCoin };
