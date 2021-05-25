const Blockchain = require('./blockchain');
const express = require('express');
const request = require('request');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transactionpool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transactionminer');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'frontend/dist')));

const isDevelopment = process.env.ENV === 'development';

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = isDevelopment?`http://localhost:${DEFAULT_PORT}`:'https://crypto-grey.herokuapp.com';
const REDIS_URL=isDevelopment?'redis://127.0.0.1:6379':'redis://:p376222b79f9444e7d8e8afb54bbe5014705e0a6179370ad4ea8805a9d2f798a1@ec2-52-6-122-229.compute-1.amazonaws.com:25459';




const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({blockchain,transactionPool,redisUrl:REDIS_URL});
const wallet = new Wallet();
const transactionMiner = new TransactionMiner({blockchain,pubsub,wallet,transactionPool});





app.get('/api/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

app.post('/api/transact',(req,res)=>{
    const {recipient,amount} = req.body;
    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey });

    try{
        if(!transaction){
            transaction = wallet.createTransaction({recipient,amount,chain: blockchain.chain});
       }else{
           transaction.update({senderWallet:wallet,recipient,amount});
       }
    }catch(error){
        return res.status(400).json({type:'error',message:error.message});
    }
  
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.json({type:'success',transaction});
});

app.get('/api/transactionpool',(req,res)=>{
    res.json(transactionPool.transactionMap);
})

app.get('/api/minetransactions',(req,res)=>{
    transactionMiner.mineTransaction();
    res.statusCode =200;
    res.json(blockchain.chain);
})

app.get('/api/walletinfo',(req,res)=>{
    const address = wallet.publicKey;
    const balance = Wallet.calculateBalance({chain:blockchain.chain,address})
    res.json({address,balance});
})

app.post('/api/mine',(req,res)=>{
    const{data} = req.body;
    blockchain.addBlock({data});
    pubsub.broadcastChain();

    res.json(blockchain.chain);
});

app.get('/api/knownaddress',(req,res)=>{
    const addressMap = {};

    for (let block of blockchain.chain){
        for(let transaction of block.data){
            const recipients = Object.keys(transaction.outputMap)

            recipients.forEach(recipient=>addressMap[recipient]=recipient);
        }
    }
    res.json(Object.keys(addressMap));
});


app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'frontend/dist/index.html'))
});


const syncWithRootState=()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,res,body)=>{
        if(!error && res.statusCode===200){
            const rootChain = JSON.parse(body);
            console.log('replace chain on a synwith',rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
    request({url:`${ROOT_NODE_ADDRESS}/api/transactionpool`},(error,res,body)=>{
        if(!error && res.statusCode===200){
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('Syncing the transaction',rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}


let PEER_PORT;

if(process.env.GENERATE_PEER_PORT ==='true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}
const PORT = process.env.PORT || PEER_PORT|| DEFAULT_PORT;
app.listen(PORT,()=>{
    console.log(`Listening to localhost:${PORT}`);

    if(PORT !== DEFAULT_PORT){
        syncWithRootState();
    }
});

