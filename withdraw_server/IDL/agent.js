const { ordinalsIDL } = require('./ordinals.did');
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;

const ordinalsCanisterId = process.env.ORDINALS_CANISTER_ID;

const ordinalsAgent = new HttpAgent({
    host: process.env.HTTP_AGENT_ACTOR_HOST,
})

const ordinals_API = Actor.createActor(ordinalsIDL, {
    agent: ordinalsAgent,
    canisterId: ordinalsCanisterId
});

module.exports = { ordinals_API };