const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const { REWARD_INPUT,MINING_REWARD } = require('../config');

describe('Transaction',()=>{
    let transaction,senderWallet,recipient,amount;
   
    beforeEach(()=>{
        senderWallet = new Wallet();
        recipient = 'recipient public key';
        amount = 50;
        transaction = new Transaction({senderWallet,recipient,amount});
    });

    it('has an id',()=>{
        expect(transaction).toHaveProperty("id");
    });

    describe('outputMap',()=>{
        it('has an output map',()=>{
            expect(transaction).toHaveProperty('outputMap');
        })

        it('outputs the amount to recipient',()=>{
            expect(transaction.outputMap[recipient]).toEqual(amount);
        })

        it('outputs the balance to sender',()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance-amount);
        })
    })

    describe('input',()=>{
        it('has an input',()=>{
            expect(transaction).toHaveProperty('input');
        })

        it('need to have timestamp',()=>{
            expect(transaction.input).toHaveProperty('timestamp');
        })

        it('sets the amount to the sender wallet balance',()=>{
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        })

        it('sets the adress to the sender wallet publicKey',()=>{
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });
        it('signs the input',()=>{
            expect(verifySignature({
                publicKey:senderWallet.publicKey,
                data:transaction.outputMap,
                signature:transaction.input.signature
            })).toBe(true);
        });
    });

    describe('validTransaction()',()=>{
        let errorMock;

        beforeEach(()=>{
            errorMock = jest.fn();

            global.console.error = errorMock;
        });
        describe('when transaction is valid',()=>{
            it('returns true',()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        })
        describe('when transaction is invalid',()=>{
            describe('transaction outputMap is invalid',()=>{
                it('returns false and logs error',()=>{
                    transaction.outputMap[senderWallet.publicKey] = 999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            })
            describe('when input sig has been faked',()=>{
                it('returns false',()=>{
                    transaction.input.signature = new Wallet().sign('data');

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            })
        })
    })

    describe('update()',()=>{
        let originalSignature,originalSenderOutput,nextRecipient, nextAmount;
        beforeEach(()=>{
            originalSignature = transaction.input.signature;
            originalSenderOutput=transaction.outputMap[senderWallet.publicKey]
            nextRecipient = 'next-recipient';
            nextAmount = 50;

            transaction.update({senderWallet,recipient:nextRecipient,amount:nextAmount});
        })
        it('outputs the amount to the next recipient',()=>{
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
        });

        it('subtracts the amount from the sender output amount',()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput-nextAmount)
        });

        it('maintains a total output that matches the input amount',()=>{
            expect(Object.values(transaction.outputMap).reduce((total,outputAmount)=>total+outputAmount)
            ).toEqual(transaction.input.amount);
        });

        it('re-signs the transaction',()=>{
            expect(transaction.input.signature).not.toEqual(originalSignature);
        });

    });

    describe('rewardTransaction()',()=>{
        let rewardTransaction,minerWallet;
        beforeEach(()=>{
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({minerWallet});
        });
        it('creates a transaction with reward input',()=>{
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        });
        
        it('creates 1 transaction FOR the miner with the MINING REWARD',()=>{
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        });
        
    });

});