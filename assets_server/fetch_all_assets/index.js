const https = require('https');

const getAllAssets = async (address) => {
    return new Promise((resolve, reject) => {
        const reqs = https.request({
            host: process.env.MEMPOOL_BASE_URL,
            path: `/api/address/${address}/utxo`,
            port: 443,
            method: "GET",
        }, (response) => {
            let data = "";
            response.setEncoding('utf-8');

            response.on("data", (chunk) => {
                response.statusCode !== 200 ? data = chunk : data += chunk;
            });

            response.on("end", () => {
                if (response.statusCode !== 200) {
                    const err = new Error('Not found');
                    err.status = response.statusCode;
                    err.message = data;
                    return [];
                } else {
                    resolve(JSON.parse(data));
                }
            });
        })
        reqs.end()
    });

}

const confirmAssets = async (allAssets) => {
    try {
        const results = await Promise.all(
            allAssets
                .filter((utxo) => utxo.status.confirmed)
                .map(async (asset, index) => {
                    return new Promise((resolve, reject) => {
                        const reqs = https.request({
                            host: process.env.INSCRIBE_XVERSE_BASE_URL,
                            path: `/v1/inscriptions/utxo/${asset.txid}/${asset.vout}`,
                            port: 443,
                            method: "GET",
                            timeout: 50000
                        }, (response) => {
                            let data = "";

                            response.setEncoding('utf-8');

                            response.on("data", (chunk) => {
                                data += chunk;
                            });

                            response.on("end", () => {
                                try {
                                    const parsedData = JSON.parse(data);
                                    if (parsedData.length) {
                                        resolve(parsedData[0]);
                                    } else {
                                        resolve(null);
                                    }
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
                })
        );
        // console.log("results", results);
        return results;
    } catch (error) {
        console.error("Error:+", error.message);
        return [];
    }
};

const getConfirmedAssets = async (assetIds, address) => {
    const promises = assetIds.map((assetId) => {
        return new Promise((resolve, reject) => {
            const reqs = https.request({
                host: process.env.API_XVERSE_BASE_URL,
                path: `/v1/address/${address}/ordinals/inscriptions/${assetId}`,
                port: 443,
                method: "GET",
                timeout: 50000
            }, (response) => {
                let data = '';
                response.setEncoding('utf-8');

                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {
                    try {
                        const parsedData = JSON.parse(data);
                        const result = {
                            id: assetId,
                            inscriptionNumber: parsedData.number,
                            mimeType: parsedData.mime_type,
                            ...JSON.parse(data)
                        };
                        resolve(result);
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
    });

    try {
        const results = await Promise.all(promises);
        console.log("Almost reached END!");
        return results;
    } catch (error) {
        console.error("Error:", error.message);
        return [];
    }
};

const getNewAddress = async (req, res) => {
    const address = req.params.address

    const getAllAssetsResult = await getAllAssets(address);
    // console.log("API 1 DONE!", getAllAssetsResult.length);
    const confirmAssetsResult = await confirmAssets(getAllAssetsResult);
    // console.log("API 2 DONE!", confirmAssetsResult.length);
    const filteredData = confirmAssetsResult.filter(asset => asset);
    const getConfirmedAssetsResult = await getConfirmedAssets(filteredData, address)

    if (getConfirmedAssetsResult.length) {
        res.send({
            success: true,
            message: "Fetched assets successfully",
            data: getConfirmedAssetsResult,
        })
    } else {
        res.send({
            success: true,
            message: "Oops! Seems you have no assets.",
        })
    }

}

const getAssets = async (address) => {

    const getAllAssetsResult = await getAllAssets(address);
    // console.log("API 1 DONE!", getAllAssetsResult.length);
    const confirmAssetsResult = await confirmAssets(getAllAssetsResult);
    // console.log("API 2 DONE!", confirmAssetsResult.length);
    const filteredData = confirmAssetsResult.filter(asset => asset);
    const getConfirmedAssetsResult = await getConfirmedAssets(filteredData, address)
    console.log(`Fetched ${getConfirmedAssetsResult.length} assets`);

    if (getConfirmedAssetsResult.length) {
        return getConfirmedAssetsResult
    } else {
        return [];
    }

}

module.exports = { getAllAssets, confirmAssets, getConfirmedAssets, getNewAddress, getAssets };