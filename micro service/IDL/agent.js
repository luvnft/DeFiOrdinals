const { ordinalIdlFactory } = require('./ordinals.did');
const { ckBtcTransactionIdlFactory } = require('./ckBtcTransac.did');
const { ckEthTransactionIdlFactory } = require('./ckEthTransac.did');

const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;

const ordinalsCanisterId = process.env.MY_ORDINALS_CANISTER_ID;
const ckBtcTransactionCanisterId = process.env.CKBTC_TRANSAC_CANISTER_ID;
const ckEthTransactionCanisterId = process.env.CKETH_TRANSAC_CANISTER_ID;

const ordinalAgent = new HttpAgent({
    host: process.env.HTTP_AGENT_ACTOR_HOST,
})

const ordinals_API = Actor.createActor(ordinalIdlFactory, {
    agent: ordinalAgent,
    canisterId: ordinalsCanisterId
});

const ckBtc_Transac_API = Actor.createActor(ckBtcTransactionIdlFactory, {
    agent: ordinalAgent,
    canisterId: ckBtcTransactionCanisterId
});

const ckEth_Transac_API = Actor.createActor(ckEthTransactionIdlFactory, {
    agent: ordinalAgent,
    canisterId: ckEthTransactionCanisterId
});

module.exports = { ordinals_API, ckBtc_Transac_API, ckEth_Transac_API };