const utils = require('./utils.js');
const rl = utils.readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question("Do you want to activate secure server and generate new certificates ? (y/n) ", ans => {
    utils.setsecureserver(ans);
    rl.close();
});