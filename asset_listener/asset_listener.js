require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { getNewAddress, getUtxo } = require('./fetch-assets');
const { ordinals_API } = require('./IDL/agent');
const logger = require('./logger');
const app = express();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Router
app.get('/', (req, res, next) => {
    res.send(`<pre style="color:white; font-size:large; background-color:black;">
    Hello there, Welcome to Asset Listener server of My Ordinals Loan!!!                                                                                                      
    </pre>`);
})

let isTesting = false;

const addressMonitor = async () => {
    const address = process.env.REACT_APP_ORDINAL_CUSTODY_ADDRESS;
    const inscriptions_length_FilePath = "./files/inscriptions_length.txt";
    const inscriptions_FilePath = "./files/inscriptions.json";
    let utxo = [];

    if (isTesting) {
        logger.info("*********** --- IN TESTING PHASE --- ***********");
        utxo = [1, 2, 3];
    } else {
        logger.info("*********** --- IN PRODUCTION PHASE --- ***********");
        utxo = await getUtxo(address);
    }

    const inscriptions_length = fs.readFileSync(inscriptions_length_FilePath, { encoding: "utf-8" });
    const inscriptions = fs.readFileSync(inscriptions_FilePath, { encoding: "utf-8" });

    logger.info(`Current inscriptions ${inscriptions_length}`);

    if (utxo.length !== Number(inscriptions_length)) {
        const result = await getNewAddress(address, inscriptions_length_FilePath, inscriptions_length_FilePath, inscriptions_length, isTesting);

        if (!isTesting) {
            const assets = result.map(asset => {
                const {
                    inscription_id: id, inscription_number: inscriptionNumber, content_type: mimeType, owner_address: address, timestamp, ...ext
                } = asset;
                return {
                    id, inscriptionNumber, mimeType, address, timestamp: Date.parse(timestamp), ...ext
                };
            }).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

            if (assets.length) {
                logger.info(`New Assets 😍 , ${assets}`);
                const addAssetPromises = assets.map(asset => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const addAsset = await ordinals_API.addUserSupply(asset.recipient, JSON.stringify(asset));
                            resolve(addAsset);
                        } catch (error) {
                            reject(error)
                        }
                    })
                });
                await Promise.all(addAssetPromises);

                // Storing the assets in file.
                const all_assets = inscriptions.length ? JSON.parse(inscriptions).concat(assets) : assets;
                fs.writeFileSync(inscriptions_FilePath, JSON.stringify(inscriptions ? all_assets : assets));

                logger.info("-- ALL DONE 😉 --");
            } else {
                logger.info("-- No New Assets 😏 --");
            }
        }
    } else {
        logger.info("-- No New Assets 😏 --");
    }
}

setInterval(() => {
    addressMonitor();
}, isTesting ? 3000 : process.env.ASSET_FETCH_INTERVAL);
addressMonitor();

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