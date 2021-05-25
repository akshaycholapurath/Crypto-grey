const Block = require('./block');
const {cryptoHash} = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');


class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({
            lastBlock:this.chain[this.chain.length-1],
            data
        });
        this.chain.push(newBlock);
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0])!== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i =1; i < chain.length;i++){
            const {timestamp,lastHash,hash,data,nonce,difficulty} = chain[i];
            const actuallastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;
            if(actuallastHash !== lastHash) return false;

            const newhash = cryptoHash(timestamp,lastHash,data,nonce,difficulty)
            if(newhash !== hash) return false;

            if(Math.abs(lastDifficulty-difficulty) >1)return false;
        }
        return true;
    }

    replaceChain(chain,validateTransactions,onSuccess) {
        if(this.chain.length>=chain.length) {
            console.error('Incoming chain must be longer');
            return;
        }
        if(!Blockchain.isValidChain(chain)) {
            console.error('Incoming chain must be valid')
            return;
        }
        if(validateTransactions &&!this.validTransactionData({chain})){
            console.error('Incoming chain transaction must be valid')
            return;
        }

        if(onSuccess) onSuccess();

        console.log('Chain is being replaced');
        return this.chain=chain;
    }

    validTransactionData({chain}){

        for(let i=1;i<chain.length;i++){
            const block = chain[i];
            let rewardTransactionCount = 0;
            const transactionSet = new Set();

            for(let transaction of block.data){
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount += 1;

                    if(rewardTransactionCount >1){
                        console.error('Miner Reward exceed limit');
                        return false;
                    }

                    if(Object.values(transaction.outputMap)[0]!==MINING_REWARD){
                        console.error('Miner Reward amount is invalid');
                        return false;
                    }
                }
                else{
                    if(!Transaction.validTransaction(transaction)){
                        console.error('Invalid data');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain:this.chain,
                        address: transaction.input.address
                    });

                    if(transaction.input.amount !== trueBalance){
                        console.error('Invalid input');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('Invalid transaction');
                        return false;
                    }else{
                        transactionSet.add(transaction);
                    }
                } 
            }
        }

        return true;
    }
}

module.exports = Blockchain;