const { ordinalIdlFactory } = require('./ordinals.did');
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;

const ordinalsCanisterId = process.env.MY_ORDINALS_CANISTER_ID;

const ordinalAgent = new HttpAgent({
    host: process.env.HTTP_AGENT_ACTOR_HOST,
})

const ordinals_API = Actor.createActor(ordinalIdlFactory, {
    agent: ordinalAgent,
    canisterId: ordinalsCanisterId
});

module.exports = { ordinals_API };