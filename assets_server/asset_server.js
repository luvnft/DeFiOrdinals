require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { getNewAddress } = require('./fetch_all_assets');
const { getCollection, getCollectionFromMagicEden } = require('./fetch_collection');
const { getAsset, getAssetFromMagicEden } = require('./fetch_asset');
const { getWithdraw } = require('./fetch_withdraw');
const { getBtcPrice, getEthPrice, getIcpPrice } = require('./fetch_btc_eth_prices');

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Home Router
app.get('/', (req, res, next) => {
    res.send(`<pre style="color:white; font-size:large; background-color:black;">
    Hello there, Welcome to Asset server of My Ordinals Loan!!!
        This is the server to fetch the user's real time wallet assets.                                                                                                            
    </pre>`
    );
})

// Old, gives statis json inscription details
app.get(`/api/${process.env.APP_VERSION}/fetch/asset/:assetid`, getAsset);
// New, gives full details of an asset
app.get(`/api/v2/fetch/asset/:assetid`, getAssetFromMagicEden);

app.get(`/api/${process.env.APP_VERSION}/fetch/assets/:address`, getNewAddress);
app.get(`/api/${process.env.APP_VERSION}/withdraw/asset/:inscription`, getWithdraw);

// v1 gives only collections floor
app.get(`/api/${process.env.APP_VERSION}/fetch/collection/:collection`, getCollection);
// New v2 gives full collections details
app.get(`/api/v2/fetch/collection/:collection`, getCollectionFromMagicEden);

app.get(`/api/${process.env.APP_VERSION}/fetch/BtcPrice`, getBtcPrice);
app.get(`/api/${process.env.APP_VERSION}/fetch/EthPrice`, getEthPrice);
app.get(`/api/${process.env.APP_VERSION}/fetch/IcpPrice`, getIcpPrice);

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