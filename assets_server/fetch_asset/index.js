const https = require('https');

const getAsset = async (req, res) => {
    const collections = ["abstraordinals", "bbc", "bitcoin-bandits", "bitcoin-bandits", "bitcoin-boos", "bitcoin-frogs", "bitcoin-punks-i2", "bitcoinwhales", "blockmunchers", "degods", "dogepunks", "naked-frogs", "nocturnal-maxis", "npc", "ocm-dimensions", "og-cartridge", "omb", "ordinal-faces", "ordinal-fomojis", "ordinal-rocks"];
    const assetId = req.params.assetid;

    for (const collectionName of collections) {
        const json = require(`../approved_collections/${collectionName}/inscriptions.json`);
        const collection = require(`../approved_collections/${collectionName}/meta.json`);

        const asset = json.find(asset => asset.id === assetId);
        if (asset) {
            return res.send({
                success: true,
                message: "Fetched the asset from collection.",
                data: { assetId: asset.id, collectionName: collection.slug }
            });
        }
    }

    // Asset not found in any collection
    res.send({
        success: false,
        message: "Asset not found in any collection."
    });
};

const getAssetFromMagicEden = async (req, res) => {
    const asset = req.params.assetid
    console.log("asset", asset);
    const reqs = https.request({
        host: process.env.MAGICEDEN_API,
        path: `/v2/ord/btc/tokens?tokenIds=${asset}`,
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
                message: "fetched asset details successfully",
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


module.exports = { getAsset, getAssetFromMagicEden };
