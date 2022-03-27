module.exports = async function main(callback) {
    try {
        const accounts = await web3.eth.getAccounts();
        const dev_account = "0x2E33Bc8A10d7ba4289EC3ea6428a2854Aac7886c"
        await web3.eth.sendTransaction({from: accounts[0], to: dev_account, value: web3.utils.toWei("1", "ether")});
    } catch (e) {
        console.log(e);
        callback(1);
    }
}