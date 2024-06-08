// src/aptosService.js
import { AptosClient, FaucetClient } from "aptos";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com"; // Replace with the appropriate node URL
// const FAUCET_URL = "https://faucet.devnet.aptoslabs.com"; // Replace with the appropriate faucet URL
export const client = new AptosClient(NODE_URL);
// const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

export const contractAddress = "0x7b8a71405e76e1a3cccc7e9f5f01d401b466f02d7731dc753afa8a2b9ac7bc68";
export const Module = { BORROW: "borrow" };
export const Function = {
    CREATE_MANAGER: "create_manager",
    CREATE_BORROW_REQUEST: "create_borrow_request",
    GET_ALL_BORROW_REQUESTS: "get_all_borrow_requests"
};

// Function to create a new account and fund it
// export const createAccount = async () => {
//     const account = new AptosAccount();
//     await faucetClient.fundAccount(account.address(), 100000000); // Funding account with tokens
//     return account;
// };

// Function to call the create_aptogotchi function
// export const createAptogotchi = async (account, gotchiName) => {
//     try {
//         const payload = {
//             type: "entry_function_payload",
//             function: `${contractAddress}::${moduleName}::${functionName}`,
//             type_arguments: [],
//             arguments: [gotchiName, Math.floor(Math.random() * Number(5)),
//                 Math.floor(Math.random() * Number(6)),
//                 Math.floor(Math.random() * Number(4))],
//         };
//         console.log("payload", payload);
//         const txnRequest = await client.generateTransaction(account.address, payload);
//         const signedTxn = await client.signTransaction(account, txnRequest);
//         const transactionRes = await client.submitTransaction(signedTxn);
//         await client.waitForTransaction(transactionRes.hash);
//         return transactionRes;
//     } catch (error) {
//         console.log("create aptogotchi error", error);
//         Notify("error", error.message);
//     }
// };
