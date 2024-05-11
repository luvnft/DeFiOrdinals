const { getNewAddress, getAssets } = require("../fetch_all_assets");

const getWithdraw = async (req, res) => {
    // If user wants to withdraw the asset, the inscription number and user's bitcoin address
    // will passed to this API.
    // This API will tell the requesting asset for withdraw by the user address 
    // is available in custody wallet or not.

    // TO-DO loan check before withdraw.
    const address = req.query.address
    const inscription = req.params.inscription
    const ORDINAL_CUSTODY_ADDRESS = process.env.ORDINAL_CUSTODY_ADDRESS;

    const result = await getAssets(ORDINAL_CUSTODY_ADDRESS);
    const filterAsset = result.find(asset => asset.inscriptionNumber.toString() === inscription && asset.genesis_address === address);
    console.log("filterAsset", filterAsset);

    if (filterAsset?.id) {
        res.send({
            success: true,
            message: "Withdraw Request",
            data: filterAsset
        })
    } else {
        res.send({
            success: false,
            message: "The inscription is not matched with custody assets.",
        })
    }
}

module.exports = { getWithdraw };