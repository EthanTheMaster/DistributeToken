const Distribute = artifacts.require("Distribute");

module.exports = async function (deployer) {
    await deployer.deploy(Distribute);

    // Write out the contract data for the web application to see but strip
    // out the AST data. Set the bytecode to be the deployed version.
    var fs = require("fs");
    fs.writeFileSync("./web/DistributeContract.json", JSON.stringify({
        abi: Distribute.abi,
        bytecode: Distribute.bytecode
    }));
}