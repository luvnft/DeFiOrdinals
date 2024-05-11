require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { getAllAssets } = require('./fetch_collection');
const { ordinals_API, ckBtc_Transac_API, ckEth_Transac_API } = require('./IDL/agent');
const { Principal } = require('@dfinity/principal');

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// static folder
app.use(`/uploads`, express.static(`uploads`))

// Home Router
app.get('/', (req, res, next) => {
    res.send(`<pre style="color:white; background-color:black">
        888       888 8888888888 888       .d8888b.   .d88888b.  888b     d888 8888888888       88888888888  .d88888b.
        888   o   888 888        888      d88P  Y88b d88P" "Y88b 8888b   d8888 888                  888     d88P" "Y88b
        888  d8b  888 888        888      888    888 888     888 88888b.d88888 888                  888     888     888
        888 d888b 888 8888888    888      888        888     888 888Y88888P888 8888888              888     888     888
        888d88888b888 888        888      888        888     888 888 Y888P 888 888                  888     888     888
        88888P Y88888 888        888      888    888 888     888 888  Y8P  888 888                  888     888     888
        8888P   Y8888 888        888      Y88b  d88P Y88b. .d88P 888   "   888 888                  888     Y88b. .d88P
        888P     Y888 8888888888 88888888  "Y8888P"   "Y88888P"  888       888 8888888888           888      "Y88888P"



        .d88888b.   8888888b.  8888888b.  8888888 888b    888        d8888 888       .d8888b.         .d8888b.  8888888888 8888888b.  888     888 8888888888 8888888b.
        d88P" "Y88b 888   Y88b 888  "Y88b   888   8888b   888       d88888 888      d88P  Y88b       d88P  Y88b 888        888   Y88b 888     888 888        888   Y88b
        888     888 888    888 888    888   888   88888b  888      d88P888 888      Y88b.            Y88b.      888        888    888 888     888 888        888    888
        888     888 888   d88P 888    888   888   888Y88b 888     d88P 888 888       "Y888b.          "Y888b.   8888888    888   d88P Y88b   d88P 8888888    888   d88P
        888     888 8888888P"  888    888   888   888 Y88b888    d88P  888 888          "Y88b.           "Y88b. 888        8888888P"   Y88b d88P  888        8888888P"
        888     888 888 T88b   888    888   888   888  Y88888   d88P   888 888            "888             "888 888        888 T88b     Y88o88P   888        888 T88b
        Y88b. .d88P 888  T88b  888  .d88P   888   888   Y8888  d8888888888 888      Y88b  d88P       Y88b  d88P 888        888  T88b     Y888P    888        888  T88b
        "Y88888P"   888   T88b 8888888P"  8888888 888    Y888 d88P     888 88888888  "Y8888P"         "Y8888P"  8888888888 888   T88b     Y8P     8888888888 888   T88b
    </pre>`);
})

const getNewAddress = async () => {
    const collections = await ordinals_API.getApprovedCollections();
    const getAllAssetsResult = await getAllAssets(collections);
    const result = await ordinals_API.set_collections(JSON.stringify(getAllAssetsResult));
    console.log(getAllAssetsResult);
    if (result) {
        console.log("Going Good !");
    } else {
        console.log("Check it!, Something wrong");
    }
}

setInterval(() => {
    getNewAddress();
}, [process.env.COLLECTIONS_FETCH_INTERVAL])
getNewAddress();

const arrayConstructor = (_array, _oldTxId) => {
    let shallGoAhead = true;
    let arr_ = [];
    _array.forEach((payment) => {
        const transDetails = payment.transaction.transfer[0];
        const { transfer, ...remainingDetails } = payment.transaction;
        const { from, to, amount } = transDetails;
        if (payment.id === _oldTxId) {
            shallGoAhead = false
        }
        if (payment.id !== _oldTxId && shallGoAhead) {
            arr_.push({
                from,
                to,
                amount,
                transaction: {
                    ...transDetails,
                    ...remainingDetails
                }
            })
        }
    })
    return arr_;
}

// ckBTC transactions
const getCkBtcTransactions = async () => {

    try {
        const getOldTxId = await ordinals_API.getCkBTC_oldest_tx_id();
        const transactionArg = {
            max_results: 100,
            account: {
                owner: Principal.fromText(process.env.MY_ORDINALS_CANISTER_ID),
                subaccount: [],
            },
            start: []
        }

        const ckBTCData = await ckBtc_Transac_API.get_account_transactions(transactionArg);
        await ordinals_API.setCkBTC_oldest_tx_id(ckBTCData.Ok.transactions[0].id);

        const ckBTCtrans = arrayConstructor(ckBTCData.Ok.transactions, getOldTxId);
        // console.log("ckBTCtrans", ckBTCtrans.length);

        const ckBtcTransactions = ckBTCtrans.map(async (trans) => {
            try {
                let _from = trans.from;
                let balanceRes;
                if (trans.from.owner.toText() === process.env.MY_ORDINALS_CANISTER_ID) {
                    // Changing the canister id to user's plug address
                    _from = trans.to;
                } else {
                    // No need to add balance for withdrawl
                    balanceRes = await ordinals_API.addckBTCBalance(_from.owner, trans.amount);
                }

                const transRes = await ordinals_API.addckBTCTransactions(_from.owner, JSON.stringify(trans.transaction, (key, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }));
                return { transRes, balanceRes };
            } catch (error) {
                console.log("Add Transaction Error", error);
            }
        })
        const result = await Promise.all(ckBtcTransactions);
        console.log("Btc result", result);
        console.log("All Done for CkBTC");
    } catch (error) {
        console.log("error", error);
    }
}

setInterval(() => {
    getCkBtcTransactions();
}, [process.env.TRANSACTIONS_FETCH_INTERVAL])
getCkBtcTransactions();

// ckETH transactions --------------------------------------------------------------------------------
const getCkEthTransactions = async () => {
    try {
        const getOldTxId = await ordinals_API.getCkEth_oldest_tx_id();
        const transactionArg = {
            max_results: 100,
            account: {
                owner: Principal.fromText(process.env.MY_ORDINALS_CANISTER_ID),
                subaccount: [],
            },
            start: []
        }

        const ckETHData = await ckEth_Transac_API.get_account_transactions(transactionArg);
        await ordinals_API.setCkEth_oldest_tx_id(ckETHData.Ok.transactions[0].id);
        // console.log(ckETHData);
        const ckETHtrans = arrayConstructor(ckETHData.Ok.transactions, getOldTxId);
        // console.log("ckETHtrans", ckETHtrans);

        const ckEthTransactions = ckETHtrans.map(async (trans) => {
            try {
                let _from = trans.from;
                let balanceRes;
                if (trans.from.owner.toText() === process.env.MY_ORDINALS_CANISTER_ID) {
                    // Changing the canister id to user's plug address
                    _from = trans.to;
                } else {
                    // No need to add balance for withdrawl
                    balanceRes = await ordinals_API.addckEthBalance(_from.owner, trans.amount);
                }

                const transRes = await ordinals_API.addckEthTransactions(_from.owner, JSON.stringify(trans.transaction, (key, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }));

                return { transRes, balanceRes };
            } catch (error) {
                console.log("Add Transaction Error", error);
            }
        })
        const result = await Promise.all(ckEthTransactions);
        console.log("Eth result", result);
        console.log("All Done for CkETH");
    } catch (error) {
        console.log("error", error);
    }
}

setInterval(() => {
    getCkEthTransactions();
}, [process.env.TRANSACTIONS_FETCH_INTERVAL])
getCkEthTransactions();

// Error handler
app.use((req, res, next) => {
    const err = new Error('not found');
    err.status = 404;
    next(err)
})

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        success: false,
        status: err.status || 500,
        message: err.message
    })
})

app.listen(process.env.APP_PORT, () => {
    console.log(`Running on PORT ${process.env.APP_PORT}`);
})