const https = require('https');

const getBtcPrice = async (_, res) => {
    let ONE_MINUTE = 60;
    const unixTimestampSeconds = Math.floor(new Date().getTime() / 1000);

    const reqs = https.request({
        host: process.env.REACT_APP_COINBASE_API,
        path: `/products/BTC-USD/candles?start=${Math.floor(
            unixTimestampSeconds - 60
        )}&end=${unixTimestampSeconds}&granularity=${ONE_MINUTE}`,
        port: 443,
        method: "GET",
        timeout: 50000,
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
        }

    }, (response) => {
        let data = '';
        response.setEncoding('utf-8');

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            // console.log("Result", data);
            res.send({
                success: true,
                message: "Fetched BTC Price",
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

const getEthPrice = async (_, res) => {
    let ONE_MINUTE = 60;
    const unixTimestampSeconds = Math.floor(new Date().getTime() / 1000);

    const reqs = https.request({
        host: process.env.REACT_APP_COINBASE_API,
        path: `/products/ETH-USD/candles?start=${Math.floor(
            unixTimestampSeconds - 60
        )}&end=${unixTimestampSeconds}&granularity=${ONE_MINUTE}`,
        port: 443,
        method: "GET",
        timeout: 50000,
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
        }

    }, (response) => {
        let data = '';
        response.setEncoding('utf-8');

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            // console.log("Result", data);
            res.send({
                success: true,
                message: "Fetched BTC Price",
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

const getIcpPrice = async (_, res) => {
    let ONE_MINUTE = 60;
    const unixTimestampSeconds = Math.floor(new Date().getTime() / 1000);

    const reqs = https.request({
        host: process.env.REACT_APP_COINBASE_API,
        path: `/products/ICP-USD/candles?start=${Math.floor(
            unixTimestampSeconds - 60
        )}&end=${unixTimestampSeconds}&granularity=${ONE_MINUTE}`,
        port: 443,
        method: "GET",
        timeout: 50000,
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
        }

    }, (response) => {
        let data = '';
        response.setEncoding('utf-8');

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            // console.log("Result", data);
            res.send({
                success: true,
                message: "Fetched ICP Price",
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

module.exports = { getBtcPrice, getEthPrice, getIcpPrice }