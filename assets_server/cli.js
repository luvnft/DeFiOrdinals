const { exec } = require("child_process");

exec("ord wallet send --fee-rate 3 bc1q4h0p8fg9jfqt402pfmc3pnem4s982ts3q7aztx 4c4e3a403cf084a3bd0f035d84669af38a8480eb8c702cff9e860f6721abf6bfi0", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});