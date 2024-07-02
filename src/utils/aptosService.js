// src/aptosService.js
import { AptosClient, FaucetClient } from "aptos";

const NODE_URL = "https://fullnode.devnet.aptoslabs.com"; // Replace with the appropriate node URL
// const FAUCET_URL = "https://faucet.devnet.aptoslabs.com"; // Replace with the appropriate faucet URL
export const client = new AptosClient(NODE_URL);
// const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

export const contractAddress = "0x2ad83ec367d3f654a08b301bcbdd84d519820a1f8f1d385f6b04436983650041";
export const Module = { ORDINALS_LOAN: "OrdinalsLoan" };
export const Function = {
    CREATE: {
        INIT_ORDINAL: "init_ordinal",
        CREATE_ORDINAL: "create_ordinal",
        MINT_ORDINAL: "mint_ordinal",
        CREATE_BORROW_REQUEST: "create_borrow_request"
    },
    VIEW: {
        AVAILABLE_ORDINAL_COUNT: "available_ordinal_count",
        GET_ORDINALS: "get_ordinals",
        GET_BORROW_REQUEST: "get_borrow_request",
        GET_MAX_ORDINALS: "get_max_ordinals",
        GET_ORDINAL_DETAILS: "get_ordinal_details"
    }
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
