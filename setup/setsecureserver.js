const readline = require('node:readline');
const utils = require('./utils.js');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question("Do you want to activate secure server and generate new certificates ? (y/n) ", ans => {
    utils.setsecureserver(ans);
    rl.close();
});