const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;
const MINING_REWARD = 50;

const GENESIS_DATA={
    timestamp:1,
    lastHash:'----',
    hash:'hash-one',
    data:[],
    difficulty:INITIAL_DIFFICULTY,
    nonce:0
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT ={address: '*authorized-reward*'};

module.exports = {GENESIS_DATA,MINE_RATE,STARTING_BALANCE, MINING_REWARD,REWARD_INPUT};