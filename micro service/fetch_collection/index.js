const https = require('https');

const getAllAssets = async (collections) => {
    const promises = collections.map(collection => {
        const [_, name] = collection;
        return new Promise((resolve, reject) => {
            const reqs = https.request({
                host: process.env.API_MAGICEDEN_BASE_URL,
                path: `/v2/ord/btc/stat?collectionSymbol=${name}`,
                port: 443,
                method: "GET",
                headers: {
                    Authorization: `Bearer 12e12850-a812-4d8f-be67-6c8857a2dbb3`
                }
            }, (response) => {
                let data = '';

                response.setEncoding('utf-8');

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    if (response.statusCode !== 200) {
                        const err = new Error('Not found');
                        err.status = response.statusCode;
                        err.message = data;
                        reject(err);
                    } else {
                        resolve({ ...JSON.parse(data), symbol: name });
                    }
                });
            });

            reqs.on('error', (err) => {
                reject(err);
            });

            reqs.end();
        });
    });

    try {
        const result = await Promise.all(promises);
        // console.log(result);
        return result;
    } catch (error) {
        console.error("Error:", error.message);
        return [];
    }
};

module.exports = { getAllAssets }
