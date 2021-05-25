const EC = require('elliptic').ec;
const crypto = require('crypto');

const ec = new EC('secp256k1');

const verifySignature = ({publicKey,data,signature})=>{
    const keyFromPublic = ec.keyFromPublic(publicKey,'hex');
    return keyFromPublic.verify(cryptoHash(data),signature)
}


const cryptoHash = (...inputs)=>{
    const hash = crypto.createHash('sha256');
    
    hash.update(inputs.map(input=>JSON.stringify(input)).sort().join(' '));
    return hash.digest('hex');
}

module.exports = {ec,verifySignature,cryptoHash};