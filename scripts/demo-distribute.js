module.exports = async function main (callback) {
    try {
        const accounts = await web3.eth.getAccounts();

        const Distribute = artifacts.require("Distribute");
        const distribute = await Distribute.deployed();

        console.log(`${accounts[0]}: ${await web3.eth.getBalance(accounts[0])}`);
        console.log(`${accounts[1]}: ${await web3.eth.getBalance(accounts[1])}`);
        console.log(`${accounts[2]}: ${await web3.eth.getBalance(accounts[2])}`);
        console.log(`${accounts[3]}: ${await web3.eth.getBalance(accounts[3])}`);

        // let txn = await distribute.redistribute([accounts[1], accounts[2], accounts[3]], [3333, 3333, 3334], {from: accounts[0], value: 100});
        let txn = await distribute.simulateRedistribute([3333, 3333, 3334], 100);
        console.log(txn[0].toString()); 

        console.log(`${accounts[0]}: ${await web3.eth.getBalance(accounts[0])}`);
        console.log(`${accounts[1]}: ${await web3.eth.getBalance(accounts[1])}`);
        console.log(`${accounts[2]}: ${await web3.eth.getBalance(accounts[2])}`);
        console.log(`${accounts[3]}: ${await web3.eth.getBalance(accounts[3])}`);
    } catch (e) {
        console.error(e);
        callback(1);
    }
}