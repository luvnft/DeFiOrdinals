const { exec } = require("child_process");

const withdrawAsset = async (to, id, fee) => {
    console.log(`ord wallet send --fee-rate ${fee} ${to} ${id}`);
    try {
        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(`ord wallet send --fee-rate ${fee} ${to} ${id}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });

        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return false;
        }

        console.log(`stdout: ${stdout}`);
        return JSON.parse(stdout);
    } catch (error) {
        console.log(`error: ${error.message}`);
        return false;
    }
};

// Example usage:
// const result = await withdrawAsset(req.bitcoinAddress, req.asset_id, req.fee_rate);
// console.log("Withdraw Result", result);

module.exports = { withdrawAsset };
