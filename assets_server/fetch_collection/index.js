const https = require('https');

const getCollection = async (req, res) => {
    const collectionName = req.params.collection
    const reqs = https.request({
        host: process.env.MAGICEDEN_API,
        path: `/v2/ord/btc/stat?collectionSymbol=${collectionName}`,
        port: 443,
        method: "GET",
        timeout: 50000,
        headers: {
            authorization: `Bearer ${process.env.MAGICEDEN_BEARER}`
        }
    }, (response) => {
        let data = '';
        response.setEncoding('utf-8');

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            console.log("Result", data);
            res.send({
                success: true,
                message: "fetched collection successfully",
                data: JSON.parse(data)
            })
        });

        response.on("error", (err) => {
            console.log("********** Fetch Collection API error ********", err);
            reject(err);
        });
    });
    reqs.end();
};

const getCollectionFromMagicEden = async (req, res) => {
    const collectionName = req.params.collection
    const reqs = https.request({
        host: process.env.MAGICEDEN_API,
        path: `/v2/ord/btc/collections/${collectionName}`,
        port: 443,
        method: "GET",
        timeout: 50000,
        headers: {
            authorization: `Bearer ${process.env.MAGICEDEN_BEARER}`
        }
    }, (response) => {
        let data = '';
        response.setEncoding('utf-8');

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            res.send({
                success: true,
                message: "fetched collection details successfully",
                data: JSON.parse(data)
            })
        });

        response.on("error", (err) => {
            console.log("********** Fetch Collection API error ********", err);
            reject(err);
        });
    });
    reqs.end();
};

module.exports = { getCollection, getCollectionFromMagicEden }