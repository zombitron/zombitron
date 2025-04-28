const utils = require('./utils.js');
console.log("┌────────────────────────┐");
console.log("│ Welcome to Zombitron ! │");
console.log("└────────────────────────┘");
console.log("We have a few things to do together before you can start playing");

const rl = utils.readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function secureserver(rl) {
    return new Promise((done, reject) => {
        rl.question("First question : do you want to use the accelerometer and gyroscope on your phone ? (y/n) ", ans => {
            utils.setsecureserver(ans).then(e => done());
        });
    })
}

const main = async () => {
    await secureserver(rl).then((e) => {
        utils.setosc(rl).then((e) => {
            console.log('\n All good !\n you can start now : npm run start')
            rl.close();
        })
    });
}
main()
