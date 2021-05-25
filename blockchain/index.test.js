const Block = require('./block');
const Blockchain = require('./index');
const {cryptoHash} = require('../util');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

describe('Blockchain',()=>{
    let blockchain,originalChain, newChain;

    beforeEach(()=>{
        blockchain = new Blockchain();
        originalChain = blockchain.chain;
        newChain = new Blockchain();
    })

    it('chain array instance',()=>{
        expect(blockchain.chain instanceof Array).toBe(true)
    });

    it('should start with Genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block',()=>{
        const newData = 'newdata';
        blockchain.addBlock({data:newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()',()=>{
        describe('when chain does not start with genesis block',()=>{
            it('returns false',()=>{
                blockchain.chain[0] = {data:'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        })

        describe('when chain does start with genesis block and has multiple blocks',()=>{
            beforeEach(()=>{
                blockchain.addBlock({data:'Bears'});
                blockchain.addBlock({data:'Beets'});
                blockchain.addBlock({data:'Bees'});
            })

            describe('when last hash has changed',()=>{
                it('returns false',()=>{
                          blockchain.chain[2].lastHash = 'broken-lasthash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);   
                });
            });

            describe('chain contains the block with an invalid field',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].data = 'baddata';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);   
                });
            });

            describe('chain contains the block with a jumped difficulty',()=>{
                it('returns false',()=>{
                    const lastBlock = blockchain.chain[blockchain.chain.length -1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty -3;
                    const hash = cryptoHash(lastHash,timestamp,difficulty,nonce,data)
                    const badBlock = new Block({timestamp,lastHash,nonce,data,difficulty,hash})
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);   
                });
            });

            describe('chain does not contain invalid field ',()=>{
                it('returns true',()=>{
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);   
                });
            });
        })
    });

    describe('replaceChain()',()=>{
        describe('new chain is not longer',()=>{
            it('doesnt replace the chain',()=>{
                newChain.chain[0]= {new:'chain'};
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe('new chain is longer',()=>{

            beforeEach(()=>{
                newChain.addBlock({data:'Bears'});
                newChain.addBlock({data:'Beets'});
                newChain.addBlock({data:'Bees'});
            })

            describe('new chain is invalid',()=>{
                it('doesnt replace the chain',()=>{
                    newChain.chain[2].hash= 'some-fakehash';
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(originalChain);
                });
            });
            describe('new chain is valid',()=>{
                it('should replace the chain',()=>{
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            });
        });

    });

    describe('validTransactionData()',()=>{
        let transaction,wallet,rewardTransaction;

        beforeEach(()=>{
            wallet = new Wallet();
            transaction = wallet.createTransaction({recipient:"foo",amount:65});
            rewardTransaction = Transaction.rewardTransaction({minerWallet:wallet});
        });

        describe('data is valid',()=>{
            it('returns true',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction]});

                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(true);
            });
        });

        describe('transaction data should not have multiple rewards',()=>{
            it('returns false',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction,rewardTransaction]});

                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
            });
        });

        describe('transaction data has invalid outputMap',()=>{
            describe('transaction is regular',()=>{
                it('returns false',()=>{
                    transaction.outputMap[wallet.publicKey]=999999;
                    newChain.addBlock({data:[transaction,rewardTransaction]});
    
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                });
            });

            describe('transaction data is a reward transaction',()=>{
                it('returns false',()=>{
                    rewardTransaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({data:[transaction,rewardTransaction]});
    
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                });
            });
        });

        describe('transaction data has invalid input',()=>{
            it('returns false',()=>{
                wallet.balance = 9000;
                const evilOuputMap = {
                    [wallet.publicKey]:8900,
                    fooRecipient:100
                };
                const evilTransaction ={
                    input:{
                        timestamp:Date.now(),
                        amount:wallet.balance,
                        address:wallet.publicKey,
                        signature:wallet.sign(evilOuputMap)
                    },
                    outputMap:evilOuputMap
                }
                
                newChain.addBlock({data:[evilTransaction,rewardTransaction]});

                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
            });
        });

        describe('multiple trans data included in block',()=>{
            it('returns false',()=>{
                newChain.addBlock({data:[transaction,transaction,transaction]});

                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
            });
        });

    });

});