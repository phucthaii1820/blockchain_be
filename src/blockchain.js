import CryptoJS from "crypto-js";

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash = () =>
    CryptoJS.SHA256(this.fromAddress + this.toAddress + this.amount).toString();
}

class Block {
  constructor(previousHash, timestamp, transactions) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash = () =>
    CryptoJS.SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();

  mineBlock = (difficulty) => {
    while (true) {
      this.hash = this.calculateHash();
      if (
        this.hash.substring(0, difficulty) === Array(difficulty + 1).join("0")
      )
        break;
      this.nonce++;
    }
    console.log("Block mined: " + this.hash);
  };
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 10;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock = () => new Block("0", Date.now(), []);

  getLatestBlock = () => this.chain[this.chain.length - 1];

  minePendingTransactions = (miningRewardAddress) => {
    let block = new Block("", Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  };

  createTransaction = (transaction) => {
    this.pendingTransactions.push(transaction);
  };

  addBlock = (newBlock) => {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  };

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

  isChainValid = () => {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash !== prevBlock.hash) return false;
    }

    return true;
  };
}

let myCoin = new BlockChain();

export { myCoin };
