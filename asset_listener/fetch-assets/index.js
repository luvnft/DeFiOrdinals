const https = require('https');
const fs = require('fs');
const logger = require('../logger');

const getUtxo = async (address) => {
    return new Promise((resolve, reject) => {
        const reqs = https.request({
            host: process.env.MEMPOOL_BASE_URL,
            path: `/api/address/${address}/utxo`,
            port: 443,
            method: "GET",
            timeout: 50000,
        }, (response) => {
            let data = '';
            response.setEncoding('utf-8');

            response.on("data", (chunk) => {
                data += chunk;
            });

            response.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (parseError) {
                    reject(parseError);
                }
            });

            response.on("error", (err) => {
                console.log("********** API error ********", err);
                reject(err);
            });
        });
        reqs.end();
    });
};

const getConfirmedAssets = async (address) => {
    return new Promise((resolve, reject) => {
        const reqs = https.request({
            host: process.env.ORDI_SCAN_BASE_URL,
            path: `/v1/inscriptions?address=${address}`,
            port: 443,
            method: "GET",
            timeout: 50000,
            headers: {
                'Authorization': `Bearer ${process.env.ORDI_SCAN_BEARER}`,
            },
        }, (response) => {
            let data = '';
            response.setEncoding('utf-8');

            response.on("data", (chunk) => {
                data += chunk;
            });

            response.on("end", () => {
                try {
                    resolve(JSON.parse(data).data);
                } catch (parseError) {
                    reject(parseError);
                }
            });

            response.on("error", (err) => {
                console.log("********** API error ********", err);
                reject(err);
            });
        });
        reqs.end();
    });
};

const getTxData = async (address, page) => {
    return new Promise((resolve, reject) => {

        const reqs = https.request({
            host: process.env.ORDI_SCAN_BASE_URL,
            path: `/v1/address/${address}/activity?page=${page}`,
            port: 443,
            method: "GET",
            timeout: 50000,
            headers: {
                'Authorization': `Bearer ${process.env.ORDI_SCAN_BEARER}`,
            },
        }, (response) => {
            let data = '';
            response.setEncoding('utf-8');

            response.on("data", (chunk) => {
                data += chunk;
            });

            response.on("end", () => {
                try {
                    resolve(JSON.parse(data).data);
                } catch (parseError) {
                    console.log("Error", parseError);
                }
            });

            response.on("error", (err) => {
                console.log("********** API error ********", err);
                reject(err);
            });
        });
        reqs.end();
    })
};

const filterAssets = (txs, inscriptions) => {
    let RECEIVE_OBJ = {};

    // Step 1: Filter by type "RECEIVE".
    const RECEIVE_Data = txs.filter(item => item.type === 'RECEIVE');

    // Step 2: Remove duplicates based on timestamp.
    const FILTER_BY_TIMESTAMP = Object.values(
        RECEIVE_Data.reduce((acc, obj) => {

            if (!acc[obj.inscription_id] || Date.parse(obj.timestamp) > Date.parse(acc[obj.inscription_id].timestamp)) {
                acc[obj.inscription_id] = obj;
            }
            return acc;
        }, {})
    );

    // Constructing OBJ to get tx faster dynamically. 
    FILTER_BY_TIMESTAMP.forEach(asset => {
        RECEIVE_OBJ = { ...RECEIVE_OBJ, [asset.inscription_id]: asset }
    });

    // Comparing assets inscription_id and received tx ids.
    const confirmedInscriptions = inscriptions.map(asset => {
        const isAvailable = RECEIVE_OBJ[asset.inscription_id];
        if (isAvailable) {
            return { ...asset, recipient: isAvailable.counterpart_address, tx_id: isAvailable.txid }
        }
    }).filter(asset => asset);

    return confirmedInscriptions;
}

const getNewAddress = async (address, inscriptionsFilePath, inscriptions_length_FilePath, inscription_length, isTesting) => {
    const txFilePath = "./files/txid.txt";
    let FIRST_TXID = "";

    let PAGE_NO = 1;

    // Recursive function to fetch txs
    const fetchTxs = async (page, tx_id) => {
        const txs = await getTxData(address, page);

        // fetch and gives txs happened before first txid
        if (tx_id) {
            // Type 3 will come here.
            const Index_Of_Tx = txs.findIndex((tx) => tx.txid === tx_id);
            if (Index_Of_Tx === -1) {
                PAGE_NO += 1;
                return txs.concat(await fetchTxs(PAGE_NO, tx_id));
            } else {
                return txs.splice(0, Index_Of_Tx);
            }
        }
        // Fetch all txs
        else {
            // Type 2 will come here.
            if (txs.length === 10) {
                PAGE_NO += 1;
                return txs.concat(await fetchTxs(PAGE_NO));
            } else {
                return txs;
            }
        }
    }

    // Here, getting txs of custody address
    let txs;
    let inscriptions;
    if (isTesting) {
        txs = require("../json/getTxdata_page_one.json");
        inscriptions = require("../json/getConfirmedAssets.json");
    } else {
        // Fetching first page activity of custody address
        txs = await getTxData(address, PAGE_NO);
        // Fetching inscriptions of custody address
        inscriptions = await getConfirmedAssets(address);
    }

    // Reading the first txid that we saved before
    FIRST_TXID = fs.readFileSync(txFilePath, 'utf8').trim();
    logger.info('Read txid from file:', FIRST_TXID);

    const Index_Of_Tx = txs.findIndex((tx) => tx.txid === FIRST_TXID);
    logger.info("Index_Of_Tx", Index_Of_Tx);

    // Which means the no more txs happened.
    // i.e(Txid in the file, is in first position of txs).
    // TYPE 1
    if (Index_Of_Tx === 0) {
        return [];
    }
    // Which means there is no first tx id present in file, so so we need to fetch all pages of txs.
    // i.e(This will happen in initial stage of no data in DB or no first txid in file)
    // TYPE 2
    else if (Index_Of_Tx === -1 && !FIRST_TXID) {
        logger.info("TYPE 2");
        PAGE_NO += 1;
        const TX_FROM_PAGE_TWO = await fetchTxs(PAGE_NO);
        txs = txs.concat(TX_FROM_PAGE_TWO);
    }
    // Which means first txid lies inbetween in page 1, page 2,.., page n. 
    // TYPE 3
    else if (Index_Of_Tx === -1 && FIRST_TXID) {
        logger.info("TYPE 3");
        // TXS_HAPPENED_BEFORE_FIRST_TX
        PAGE_NO += 1;
        const TXS_HAPPENED_BEFORE_FIRST_TX = await fetchTxs(PAGE_NO, FIRST_TXID);
        txs = txs.concat(TXS_HAPPENED_BEFORE_FIRST_TX);
    }

    if (Index_Of_Tx) {
        logger.info("TYPE 4");
        txs = txs.splice(0, Index_Of_Tx);
    }

    const counts = txs.reduce((accumulator, transaction) => {
        const { type } = transaction;
        accumulator[type] = accumulator[type] + 1;
        return accumulator;
    }, {
        RECEIVE: 0,
        SEND: 0,
        INSCRIBE: 0
    });

    if (!counts?.RECEIVE) {
        let current_length;
        current_length = (Number(inscription_length) + counts.INSCRIBE) - counts.SEND;

        fs.writeFileSync(inscriptions_length_FilePath, JSON.stringify(current_length));
        fs.writeFileSync(txFilePath, txs[0].txid, { flag: 'w' });

        logger.warn(`Nothing in "RECEIVE" state Latest Count of INSCRIBE or SEND is ${counts}`)
    }

    logger.info(`SLICED TXS , ${txs}`);
    // Filtering "RECEIVE" txs
    const confirmedInscriptions = filterAssets(txs, inscriptions);
    if (confirmedInscriptions.length) {
        // Writing the first txid in file
        fs.writeFileSync(txFilePath, txs[0].txid, { flag: 'w' });

        // Writing the current inscriptions of custody address
        fs.writeFileSync(inscriptionsFilePath, (inscriptions.length).toString(), { flag: 'w' });

        return confirmedInscriptions;
    } else {
        return [];
    }
}

module.exports = { getNewAddress, getTxData, getUtxo };