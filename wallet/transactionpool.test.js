const TransactionPool = require('./transactionpool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool',()=>{
    let transactionPool, transaction,senderWallet;
    senderWallet = new Wallet()

    beforeEach(()=>{
        transactionPool = new TransactionPool();
        transaction = new Transaction({
            senderWallet,
            recipient : "foo-recipient",
            amount : 50
        });
    });

    describe('setTransaction()',()=>{
        it('adds a transaction',()=>{
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    

    });
    describe('validTransactions()',()=>{
        let validTransactions;
        errorMock= jest.fn();
        global.console.error = errorMock;

        beforeEach(()=>{
            validTransactions = [];

            for(let i = 0;i<10;i++){
                transaction = new Transaction({
                    senderWallet,
                    recipient:'any-recipient',
                    amount : 30
                });
                if(i%3===0){
                    transaction.input.amount = 999999;
                }else if(i%3===1){
                    transaction.input.signature = new Wallet().sign('foo');
                }else{
                    validTransactions.push(transaction);
                }
            transactionPool.setTransaction(transaction);
            }
        });

        it('returns the valid transactions',()=>{
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        })
        it('logs error for invalid transactions',()=>{
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        })
    });

    describe('clear()',()=>{
        it('clears the transactions',()=>{
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    })

    describe('clearBlockchainTransactions()',()=>{
        it('clears the pool of any existing blockchain transactions',()=>{
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i =0; i<6;i ++){
                const transaction = new Wallet().createTransaction({
                    recipient: 'foo',amount:20
            });

            transactionPool.setTransaction(transaction)
            if(i%2===0){
                blockchain.addBlock({data:[transaction]})
            }else{
                expectedTransactionMap[transaction.id]=transaction;
            }
        }

            transactionPool.clearBlockchainTransactions({chain:blockchain.chain});

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    })
});