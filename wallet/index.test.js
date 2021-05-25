const Wallet = require('./index');
const {verifySignature} = require('../util');
const Transaction  = require('./transaction');
const Blockchain = require('../blockchain');
const {STARTING_BALANCE} = require('../config')


describe('Wallet',()=>{
    let wallet;
    beforeEach(()=>{
        wallet = new Wallet();
    });

    it('has a balance',()=>{
        expect(wallet).toHaveProperty('balance')
    });

    it('has a publicKey',()=>{
        expect(wallet).toHaveProperty('publicKey')
    });

    describe('signing data',()=>{
        const data = 'justdata';

        it('varifies a sign',()=>{        
            expect(verifySignature({
                publicKey:wallet.publicKey,
                data,
                signature:wallet.sign(data)
            })).toBe(true);

        });

        it('does not varify an invalid sign',()=>{
            expect(verifySignature({
                publicKey:wallet.publicKey,
                data,
                signature:new Wallet().sign(data)
            })).toBe(false);
        });

    });

    describe('createTransaction()',()=>{
        describe('amount exceeds the balance',()=>{
            it('throws an error',()=>{
                expect(()=>wallet.createTransaction({amount:999999, recipient:'foo-recipient'})).toThrow('Amount exceeds balance');
            });
        });

        describe('amount is valid',()=>{
            let transaction,amount,recipient;
            beforeEach(()=>{
                amount = 50;
                recipient = 'foo-recipient',

                transaction = wallet.createTransaction({amount,recipient});
            })
            it('creates an instance of Transaction',()=>{
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input with the wallet',()=>{
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount to the recipient',()=>{
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });

        });

        describe('and a chain is passed',()=>{
            it('calls Wallet.calculateBalance()',()=>{

                const originalCalculateBalance =  Wallet.calculateBalance;
                const calculateBalanceMock = jest.fn();
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient:'foo',
                    amount:10,
                    chain: new Blockchain().chain
                });
                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()',()=>{
        let blockchain;
        beforeEach(()=>{
            blockchain = new Blockchain();
        });
        
        describe('no outputs for the wallet',()=>{
            it('return STARTING_BALANCE',()=>{         
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(STARTING_BALANCE)
            });
        });
        describe('there are outputs for the wallet)',()=>{
            let transactionOne,transactionTwo;

            beforeEach(()=>{
                transactionOne = new Wallet().createTransaction({
                    recipient:wallet.publicKey,
                    amount:50
                })
                transactionTwo = new Wallet().createTransaction({
                    recipient:wallet.publicKey,
                    amount:60
                })
                blockchain.addBlock({data:[transactionOne,transactionTwo]});
            })

            it('adds transaction to wallet balance',()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(STARTING_BALANCE+transactionOne.outputMap[wallet.publicKey]+transactionTwo.outputMap[wallet.publicKey]);
            });

        });

        describe('wallet have made transactions',()=>{
            let recentTransaction;

            beforeEach(()=>{
                recentTransaction = wallet.createTransaction({
                    recipient:'foo',
                    amount:50
                });
                
                blockchain.addBlock({data:[recentTransaction]});
            });

            it('returns the output of the recent transaction',()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(recentTransaction.outputMap[wallet.publicKey]);
            });

            describe('are outputs after recent transaction',()=>{
                let sameBlockTransaction, nextBlockTransaction;
              
                beforeEach(()=>{
                    recentTransaction = wallet.createTransaction({
                        recipient:'foo',
                        amount:60
                    });

                    sameBlockTransaction = Transaction.rewardTransaction({minerWallet:wallet});
                    
                    blockchain.addBlock({data:[recentTransaction,sameBlockTransaction]});

                    nextBlockTransaction = new Wallet().createTransaction({
                        recipient:wallet.publicKey,
                        amount:75
                    });

                    blockchain.addBlock({data:[nextBlockTransaction]});
                });
                it('includes output amount in the returned balance',()=>{
                    expect(Wallet.calculateBalance({
                        chain:blockchain.chain,
                        address:wallet.publicKey
                    })).toEqual(recentTransaction.outputMap[wallet.publicKey]+
                                sameBlockTransaction.outputMap[wallet.publicKey]+
                                nextBlockTransaction.outputMap[wallet.publicKey]);
                });
            });
        });
    });
});