require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ordinals_API } = require('./IDL/agent');
const { withdrawAsset } = require('./service');
const app = express();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const app_version = process.env.APP_VERSION;

// Home Router
app.get('/', (req, res, next) => {
    res.send(`<pre style="color:white; font-size:large; background-color:black;">
    Hello there, Welcome to Withdraw server !!!                                                                                                      
    </pre>`);
})

let isProcessing = 0;

const fetchWithdrawRequest = async () => {
    const requests = await ordinals_API.getWithDrawAssetsRequest();
    console.log("Requests", requests);

    if (requests.length) {
        isProcessing = 1;
        const [[_, req]] = requests;
        console.log("First Request", req);

        const result = await withdrawAsset(req.bitcoinAddress, req.asset_id, req.fee_rate);
        console.log("Withdraw Result", result);

        if (result.transaction) {
            const removeResult = await ordinals_API.removeWithDrawAssetsRequest({
                'transaction': result.transaction,
                'fee_rate': parseInt(req.fee_rate),
                'timestamp': Date.now(),
                'bitcoinAddress': req.bitcoinAddress,
                'asset_id': req.asset_id,
            });

            console.log("Remove Request", removeResult);
            if (removeResult) {
                isProcessing = 0;
            }
        }
    }
}

setInterval(() => {
    if (!isProcessing) {
        // fetchWithdrawRequest();
    }
}, 10000);
fetchWithdrawRequest();

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